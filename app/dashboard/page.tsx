"use client";

import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import {
  Message,
  MessageAvatar,
  MessageContent,
} from "@/components/ai-elements/message";
import {
  PromptInput,
  PromptInputBody,
  PromptInputFooter,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputTools,
} from "@/components/ai-elements/prompt-input";
import { useChat } from "@ai-sdk/react";
import {
  BarChart3Icon,
  MessageSquareIcon,
  Trash2Icon,
  FileDownIcon,
  MicIcon,
  MicOffIcon,
  CalendarIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  XIcon,
  MoreVerticalIcon,
} from "lucide-react";
import React, { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { AppHeader } from "@/components/app-header";
import {
  createConversation,
  createMessage,
  getAllMessages,
  deleteConversation,
  getConversations,
  deleteMessage as deleteMessageFromDB,
} from "@/lib/supabase";
import { useAuth } from "@/lib/auth/auth-context";
import { SmartDailySummary } from "@/components/smart-daily-summary";
import { OnboardingFlow } from "@/components/onboarding-flow";
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts";
import { useSpeechRecognition } from "@/hooks/use-speech-recognition";
import { SlashCommandMenu } from "@/components/slash-command-menu";
import type { SlashCommand } from "@/lib/slash-commands";

const STORAGE_KEY = "dar-chat-messages";
const CONVERSATION_ID_KEY = "dar-conversation-id";

type ViewMode = "chat" | "summary";

// Helper function to format date
function formatDate(date: Date): string {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  // Reset hours for comparison
  const messageDate = new Date(date);
  messageDate.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  yesterday.setHours(0, 0, 0, 0);

  if (messageDate.getTime() === today.getTime()) {
    return "Today";
  } else if (messageDate.getTime() === yesterday.getTime()) {
    return "Yesterday";
  } else {
    return messageDate.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }
}

// Helper function to format time
function formatTime(date: Date): string {
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

// Group messages by date
function groupMessagesByDate(messages: any[]) {
  const groups: { date: string; messages: any[]; dateKey: string }[] = [];
  let currentDate = "";

  messages.forEach((message) => {
    const messageDate = message.createdAt
      ? new Date(message.createdAt)
      : new Date();
    const dateKey = messageDate.toDateString();

    if (dateKey !== currentDate) {
      currentDate = dateKey;
      groups.push({
        date: formatDate(messageDate),
        dateKey: dateKey,
        messages: [message],
      });
    } else {
      groups[groups.length - 1].messages.push(message);
    }
  });

  return groups;
}

// Get unique dates from messages
function getUniqueDates(messages: any[]) {
  const dates = new Map<string, { date: string; dateKey: string; count: number }>();

  messages.forEach((message) => {
    const messageDate = message.createdAt
      ? new Date(message.createdAt)
      : new Date();
    const dateKey = messageDate.toDateString();

    if (!dates.has(dateKey)) {
      dates.set(dateKey, {
        date: formatDate(messageDate),
        dateKey: dateKey,
        count: 0,
      });
    }
    dates.get(dateKey)!.count++;
  });

  return Array.from(dates.values());
}

// Get week number and year
function getWeekKey(date: Date): string {
  const onejan = new Date(date.getFullYear(), 0, 1);
  const millisecsInDay = 86400000;
  const week = Math.ceil((((date.getTime() - onejan.getTime()) / millisecsInDay) + onejan.getDay() + 1) / 7);
  return `${date.getFullYear()}-W${week}`;
}

// Format week label
function formatWeekLabel(weekKey: string): string {
  const [year, week] = weekKey.split('-W');
  return `Week ${week}, ${year}`;
}

// Get month key
function getMonthKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

// Format month label
function formatMonthLabel(monthKey: string): string {
  const [year, month] = monthKey.split('-');
  const date = new Date(parseInt(year), parseInt(month) - 1);
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

// Group messages by week
function groupMessagesByWeek(messages: any[]) {
  const weeks = new Map<string, { weekKey: string; label: string; messages: any[] }>();

  messages.forEach((message) => {
    const messageDate = message.createdAt ? new Date(message.createdAt) : new Date();
    const weekKey = getWeekKey(messageDate);

    if (!weeks.has(weekKey)) {
      weeks.set(weekKey, {
        weekKey,
        label: formatWeekLabel(weekKey),
        messages: [],
      });
    }
    weeks.get(weekKey)!.messages.push(message);
  });

  return Array.from(weeks.values()).sort((a, b) => b.weekKey.localeCompare(a.weekKey));
}

// Group messages by month
function groupMessagesByMonth(messages: any[]) {
  const months = new Map<string, { monthKey: string; label: string; messages: any[] }>();

  messages.forEach((message) => {
    const messageDate = message.createdAt ? new Date(message.createdAt) : new Date();
    const monthKey = getMonthKey(messageDate);

    if (!months.has(monthKey)) {
      months.set(monthKey, {
        monthKey,
        label: formatMonthLabel(monthKey),
        messages: [],
      });
    }
    months.get(monthKey)!.messages.push(message);
  });

  return Array.from(months.values()).sort((a, b) => b.monthKey.localeCompare(a.monthKey));
}

export default function Home() {
  const { user, signOut, loading: authLoading } = useAuth();
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const conversationIdRef = useRef<string | null>(null);
  const router = useRouter();

  const { messages, sendMessage: originalSendMessage, status, setMessages } = useChat();

  // Redirect to homepage if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/');
    }
  }, [user, authLoading, router]);

  // Wrapper to inject conversationId into API calls
  const sendMessage = useCallback(
    (message: { text: string }) => {
      if (!conversationIdRef.current) {
        console.warn('No conversation ID available');
        return;
      }

      console.log('Sending message with conversationId:', conversationIdRef.current);

      // Temporarily intercept fetch to add conversationId
      const originalFetch = window.fetch;
      window.fetch = async (input, init) => {
        if (typeof input === 'string' && input.includes('/api/chat') && init?.body) {
          try {
            const body = JSON.parse(init.body as string);
            body.conversationId = conversationIdRef.current;
            init.body = JSON.stringify(body);
            console.log('Injected conversationId into request:', conversationIdRef.current);
          } catch (e) {
            console.error('Failed to inject conversationId:', e);
          }
        }
        const result = await originalFetch(input, init);
        // Restore original fetch after the call completes
        setTimeout(() => {
          window.fetch = originalFetch;
        }, 0);
        return result;
      };

      // Call the original sendMessage
      return originalSendMessage(message);
    },
    [originalSendMessage]
  );

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [historyExpanded, setHistoryExpanded] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>("chat");
  const [summaryPeriod, setSummaryPeriod] = useState<"week" | "month">("week");
  const [showPreview, setShowPreview] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [showSlashMenu, setShowSlashMenu] = useState(false);
  const [slashQuery, setSlashQuery] = useState('');
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const dateRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  // Voice recognition hook
  const { isListening, transcript, startListening, stopListening, resetTranscript, isSupported } = useSpeechRecognition();

  // Update input value when transcript changes
  useEffect(() => {
    if (transcript) {
      setInputValue(transcript);
    }
  }, [transcript]);

  // Detect slash command trigger
  useEffect(() => {
    const cursorPosition = inputRef.current?.selectionStart || 0;
    const textBeforeCursor = inputValue.slice(0, cursorPosition);

    // Check if the last word starts with "/"
    const lastWord = textBeforeCursor.split(/\s/).pop() || '';

    if (lastWord.startsWith('/') && lastWord.length > 0) {
      setShowSlashMenu(true);
      setSlashQuery(lastWord);
    } else {
      setShowSlashMenu(false);
      setSlashQuery('');
    }
  }, [inputValue]);

  // Handle slash command selection
  const handleSlashCommandSelect = (command: SlashCommand) => {
    // Remove the slash command from input
    const cursorPosition = inputRef.current?.selectionStart || 0;
    const textBeforeCursor = inputValue.slice(0, cursorPosition);
    const textAfterCursor = inputValue.slice(cursorPosition);

    // Find and remove the last slash command
    const lastSlashIndex = textBeforeCursor.lastIndexOf('/');
    const newTextBefore = textBeforeCursor.slice(0, lastSlashIndex);

    if (command.type === 'template' && command.content) {
      // Insert template content
      const newValue = newTextBefore + command.content + textAfterCursor;
      setInputValue(newValue);

      // Close menu
      setShowSlashMenu(false);
      setSlashQuery('');

      // Focus input
      setTimeout(() => {
        inputRef.current?.focus();
      }, 0);
    } else if (command.type === 'action') {
      // Execute action
      setShowSlashMenu(false);
      setSlashQuery('');

      // Handle different actions
      if (command.id === 'stats') {
        setViewMode('summary');
      } else if (command.id === 'settings') {
        router.push('/settings');
      } else if (command.id === 'help') {
        setInputValue('How can I use DAR effectively? What features are available?');
        setTimeout(() => {
          if (inputValue.trim()) {
            sendMessage({ text: 'How can I use DAR effectively? What features are available?' });
            setInputValue('');
          }
        }, 100);
      }
    }
  };

  // Toggle voice recording
  const toggleVoiceRecording = () => {
    if (isListening) {
      stopListening();
    } else {
      resetTranscript();
      setInputValue('');
      startListening();
    }
  };

  // Keyboard shortcuts
  useKeyboardShortcuts([
    {
      key: 'k',
      metaKey: true,
      callback: () => {
        inputRef.current?.focus();
      },
      description: 'Focus input',
    },
    {
      key: 'Enter',
      metaKey: true,
      callback: () => {
        if (inputValue.trim()) {
          sendMessage({ text: inputValue });
          setInputValue('');
          resetTranscript();
        }
      },
      description: 'Send message',
    },
    {
      key: 'Escape',
      callback: () => {
        if (isListening) {
          stopListening();
        }
      },
      description: 'Close modals',
    },
  ], viewMode === 'chat');



  // Open sidebar by default on desktop
  useEffect(() => {
    if (window.innerWidth >= 1024) {
      setSidebarOpen(true);
    }
  }, []);

  // Load conversation and messages from database on mount
  useEffect(() => {
    async function loadData() {
      // Only load data if user is authenticated
      if (!user || authLoading) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        // Get or create conversation
        let convId = localStorage.getItem(CONVERSATION_ID_KEY);
        let needsNewConversation = !convId;

        // If we have a conversation ID, verify it exists in the database
        if (convId) {
          console.log('Checking if conversation exists:', convId);
          const existingConv = await getConversations();
          const convExists = existingConv.some(c => c.id === convId);

          if (!convExists) {
            console.warn('Conversation from localStorage not found in database, creating new one');
            localStorage.removeItem(CONVERSATION_ID_KEY);
            convId = null;
            needsNewConversation = true;
          } else {
            console.log('Using existing conversation:', convId);
          }
        }

        // Create new conversation if needed
        if (needsNewConversation) {
          console.log('Creating new conversation for user:', user.id);
          const newConv = await createConversation("Daily Report");
          if (newConv) {
            convId = newConv.id;
            localStorage.setItem(CONVERSATION_ID_KEY, convId);
            console.log('Conversation created and saved:', convId);
          } else {
            console.error('Failed to create conversation - cannot proceed');
            setIsLoading(false);
            return;
          }
        }

        if (convId) {
          setConversationId(convId);
          conversationIdRef.current = convId;
          console.log('Conversation ID set:', convId);

          // Load messages from database
          console.log('Loading messages from database...');
          const dbMessages = await getAllMessages();
          console.log('Loaded', dbMessages.length, 'messages from database');

          if (dbMessages.length > 0) {
            // Convert database messages to AI SDK format
            const formattedMessages = dbMessages.map((msg) => ({
              id: msg.id,
              role: msg.role,
              parts: [{ type: "text" as const, text: msg.content }],
              createdAt: new Date(msg.created_at),
            }));
            setMessages(formattedMessages);
          }
        }
      } catch (error) {
        console.error("Failed to load messages from database:", error);

        // Fallback to localStorage if database fails
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          try {
            const parsedMessages = JSON.parse(stored);
            if (parsedMessages.length > 0) {
              setMessages(parsedMessages);
            }
          } catch (error) {
            console.error("Failed to load messages from localStorage:", error);
          }
        }
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, [user, authLoading, setMessages]);

  // Save messages to localStorage whenever they change
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    }
  }, [messages]);

  // Clear chat function
  const clearChat = async () => {
    if (conversationId) {
      await deleteConversation(conversationId);
      localStorage.removeItem(CONVERSATION_ID_KEY);

      // Create new conversation
      const newConv = await createConversation("Daily Report");
      if (newConv) {
        setConversationId(newConv.id);
        conversationIdRef.current = newConv.id;
        localStorage.setItem(CONVERSATION_ID_KEY, newConv.id);
      }
    }

    setMessages([]);
    localStorage.removeItem(STORAGE_KEY);
  };

  // Delete individual message function
  const deleteMessage = async (messageId: string) => {
    if (!confirm('Are you sure you want to delete this message?')) return;

    try {
      // Delete from database
      const success = await deleteMessageFromDB(messageId);

      if (!success) {
        throw new Error('Database deletion failed');
      }

      // Remove message from state
      const updatedMessages = messages.filter((msg) => msg.id !== messageId);
      setMessages(updatedMessages);

      // Update localStorage
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedMessages));

      // Close dropdown
      setOpenDropdownId(null);
    } catch (error) {
      console.error('Failed to delete message:', error);
      alert('Failed to delete message. Please try again.');
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpenDropdownId(null);
      }
    }

    if (openDropdownId) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [openDropdownId]);

  // Show preview modal
  const showExportPreview = () => {
    setShowPreview(true);
  };

  // Export report function
  const exportReport = async () => {
    try {
      const response = await fetch("/api/export-report", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ messages }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate report");
      }

      // Create a blob from the response
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      // Create a temporary link and trigger download
      const a = document.createElement("a");
      a.href = url;
      a.download = `DAR_Report_${new Date().toISOString().split("T")[0]}.docx`;
      document.body.appendChild(a);
      a.click();

      // Clean up
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      // Close preview modal
      setShowPreview(false);
    } catch (error) {
      console.error("Error exporting report:", error);
      alert("Failed to export report. Please try again.");
    }
  };

  // Scroll to specific date
  const scrollToDate = (dateKey: string) => {
    const element = dateRefs.current[dateKey];
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const uniqueDates = getUniqueDates(messages);
  const weeklyGroups = groupMessagesByWeek(messages);
  const monthlyGroups = groupMessagesByMonth(messages);

  // Show loading screen while checking authentication
  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-zinc-50 via-white to-zinc-100 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950">
        <div className="text-center">
          <div className="mb-6 inline-flex rounded-3xl bg-gradient-to-br from-blue-100 to-indigo-100 p-6 shadow-lg dark:from-blue-950/50 dark:to-indigo-950/50">
            <div className="size-16 animate-pulse rounded-full bg-blue-600 dark:bg-blue-400" />
          </div>
          <h2 className="mb-2 text-2xl font-bold text-zinc-900 dark:text-zinc-50">
            Loading...
          </h2>
          <p className="text-base text-zinc-600 dark:text-zinc-400">
            Please wait
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col bg-gradient-to-br from-zinc-50 via-white to-zinc-100 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950">
      <AppHeader
        children={
          /* View Toggle Tabs */
          <div className="hidden items-center gap-1 rounded-xl bg-zinc-100 p-1 md:flex dark:bg-zinc-800">
            <button
              onClick={() => setViewMode("chat")}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                viewMode === "chat"
                  ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-700 dark:text-zinc-50"
                  : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200"
              }`}
            >
              <MessageSquareIcon className="size-4" />
              Chat
            </button>
            <button
              onClick={() => setViewMode("summary")}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                viewMode === "summary"
                  ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-700 dark:text-zinc-50"
                  : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200"
              }`}
            >
              <BarChart3Icon className="size-4" />
              Summary
            </button>
          </div>
        }
        actions={
          messages.length > 0 ? (
            <>
              <button
                onClick={showExportPreview}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-green-50 dark:text-zinc-300 dark:hover:bg-green-950/30"
              >
                <FileDownIcon className="size-4 text-green-600 dark:text-green-400" />
                <span>Export DOCX</span>
              </button>

              <button
                onClick={clearChat}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-red-700 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30"
              >
                <Trash2Icon className="size-4" />
                <span>Clear Chat</span>
              </button>
            </>
          ) : undefined
        }
      />

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside
          className={`${
            sidebarOpen ? "translate-x-0 lg:static" : "-translate-x-full lg:-translate-x-full"
          } fixed inset-y-0 left-0 top-[85px] z-20 w-72 border-r border-zinc-200/60 bg-white/95 backdrop-blur-xl transition-transform duration-300 dark:border-zinc-800/60 dark:bg-zinc-900/95 lg:top-0`}
        >
          <div className="flex h-full flex-col p-3">
            <button
              onClick={() => setHistoryExpanded(!historyExpanded)}
              className="mb-4 flex items-center justify-between gap-2 rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50 px-3 py-2 shadow-sm transition-all hover:shadow-md active:scale-[0.98] dark:from-blue-950/30 dark:to-indigo-950/30"
            >
              <div className="flex items-center gap-2">
                <div className="rounded-lg bg-white p-1.5 shadow-sm dark:bg-zinc-800">
                  <CalendarIcon className="size-4 text-blue-600 dark:text-blue-400" />
                </div>
                <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-50">
                  History
                </h2>
              </div>
              {historyExpanded ? (
                <ChevronUpIcon className="size-5 text-zinc-600 transition-transform dark:text-zinc-400" />
              ) : (
                <ChevronDownIcon className="size-5 text-zinc-600 transition-transform dark:text-zinc-400" />
              )}
            </button>

            {historyExpanded && (
              <div className="animate-in fade-in slide-in-from-top-2 duration-200">
                {uniqueDates.length === 0 ? (
                  <div className="flex flex-col items-center justify-center rounded-xl bg-zinc-50 p-8 text-center dark:bg-zinc-800/50">
                    <CalendarIcon className="mb-3 size-12 text-zinc-300 dark:text-zinc-600" />
                    <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                      No messages yet
                    </p>
                  </div>
                ) : (
                  <div className="flex-1 space-y-2 overflow-y-auto">
                    {uniqueDates.map((dateInfo) => (
                      <button
                        key={dateInfo.dateKey}
                        onClick={() => scrollToDate(dateInfo.dateKey)}
                        className="group flex w-full items-center justify-between rounded-lg bg-gradient-to-br from-zinc-50 to-zinc-100 px-3 py-2 text-left shadow-sm transition-all hover:scale-[1.02] hover:from-blue-50 hover:to-indigo-50 hover:shadow-md active:scale-[0.98] dark:from-zinc-800/50 dark:to-zinc-800/30 dark:hover:from-blue-950/30 dark:hover:to-indigo-950/30"
                      >
                        <span className="text-sm font-semibold text-zinc-700 transition-colors group-hover:text-blue-700 dark:text-zinc-300 dark:group-hover:text-blue-400">
                          {dateInfo.date}
                        </span>
                        <span className="rounded-full bg-white px-2 py-0.5 text-xs font-bold text-zinc-600 shadow-sm transition-colors group-hover:bg-blue-100 group-hover:text-blue-700 dark:bg-zinc-700 dark:text-zinc-300 dark:group-hover:bg-blue-900/50 dark:group-hover:text-blue-300">
                          {dateInfo.count}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </aside>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 top-[85px] z-10 bg-black/60 backdrop-blur-sm transition-all lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <div className="flex flex-1 flex-col items-center overflow-hidden">
          <div className={`flex w-full flex-1 flex-col overflow-hidden transition-all duration-300 ${
            sidebarOpen ? "max-w-3xl" : "max-w-4xl"
          }`}>
        {viewMode === "chat" ? (
          <div className="flex flex-1 flex-col overflow-hidden">
          {/* Smart Daily Summary */}
          <div className="flex-shrink-0 p-4 pb-0">
            <SmartDailySummary />
          </div>
          <Conversation className="flex-1 min-h-0">
          <ConversationContent>
            {isLoading ? (
              <div className="flex h-full items-center justify-center p-8">
                <div className="text-center">
                  <div className="mb-6 inline-flex rounded-3xl bg-gradient-to-br from-blue-100 to-indigo-100 p-6 shadow-lg dark:from-blue-950/50 dark:to-indigo-950/50">
                    <div className="size-16 animate-pulse rounded-full bg-blue-600 dark:bg-blue-400" />
                  </div>
                  <h2 className="mb-2 text-2xl font-bold text-zinc-900 dark:text-zinc-50">
                    Loading your messages...
                  </h2>
                  <p className="text-base text-zinc-600 dark:text-zinc-400">
                    Please wait while we fetch your conversation
                  </p>
                </div>
              </div>
            ) : messages.length === 0 ? (
              <div className="flex h-full items-center justify-center p-8">
                <div className="text-center">
                  <div className="mb-6 inline-flex rounded-3xl bg-gradient-to-br from-blue-100 to-indigo-100 p-6 shadow-lg dark:from-blue-950/50 dark:to-indigo-950/50">
                    <MessageSquareIcon className="size-16 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h2 className="mb-2 text-2xl font-bold text-zinc-900 dark:text-zinc-50">
                    Start your daily report
                  </h2>
                  <p className="text-base text-zinc-600 dark:text-zinc-400">
                    Share what you accomplished today, and I'll help you reflect on it
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-6 p-4">
                {groupMessagesByDate(messages).map((group, groupIndex) => (
                  <div
                    key={groupIndex}
                    ref={(el) => {
                      dateRefs.current[group.dateKey] = el;
                    }}
                    className="space-y-3"
                  >
                    {/* Date Header */}
                    <div className="sticky top-1 z-10 flex justify-center">
                      <div className="rounded-full bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 px-4 py-1.5 text-xs font-semibold text-blue-800 shadow-sm backdrop-blur-sm ring-1 ring-blue-200/50 dark:from-blue-950/70 dark:via-indigo-950/70 dark:to-purple-950/70 dark:text-blue-200 dark:ring-blue-800/50">
                        {group.date}
                      </div>
                    </div>

                    {/* Messages for this date */}
                    <div className="space-y-3">
                      {group.messages.map((message) => (
                        <div
                          key={message.id}
                          className={`group/message flex gap-2.5 ${
                            message.role === "user" ? "flex-row-reverse" : "flex-row"
                          }`}
                        >
                          {/* Avatar */}
                          <div className="flex-shrink-0">
                            <div className="relative">
                              <div
                                className={`absolute -inset-0.5 rounded-full bg-gradient-to-r opacity-0 blur-sm transition-opacity group-hover/message:opacity-75 ${
                                  message.role === "user"
                                    ? "from-blue-500 to-indigo-500"
                                    : "from-purple-500 to-pink-500"
                                }`}
                              />
                              <img
                                src={
                                  message.role === "user"
                                    ? "https://api.dicebear.com/7.x/avataaars/svg?seed=user"
                                    : "https://api.dicebear.com/7.x/bottts/svg?seed=assistant"
                                }
                                alt={message.role === "user" ? "You" : "AI"}
                                className="relative size-8 rounded-full border-2 border-white shadow-sm dark:border-zinc-800"
                              />
                            </div>
                          </div>

                          {/* Message Bubble with Actions */}
                          <div
                            className={`flex max-w-[80%] flex-col gap-1 ${
                              message.role === "user" ? "items-end" : "items-start"
                            }`}
                          >
                            <div className="relative flex items-start gap-2">
                              {/* Three-dot menu button (appears on hover) */}
                              {message.role === "user" && (
                                <div className="relative" ref={openDropdownId === message.id ? dropdownRef : null}>
                                  <button
                                    onClick={() => setOpenDropdownId(openDropdownId === message.id ? null : message.id)}
                                    className={`opacity-0 group-hover/message:opacity-100 transition-opacity rounded-lg p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-700 ${
                                      openDropdownId === message.id ? 'opacity-100' : ''
                                    }`}
                                    aria-label="Message options"
                                  >
                                    <MoreVerticalIcon className="size-4 text-zinc-600 dark:text-zinc-400" />
                                  </button>

                                  {/* Dropdown menu */}
                                  {openDropdownId === message.id && (
                                    <div className="absolute right-0 top-full z-50 mt-1 w-32 rounded-xl border border-zinc-200 bg-white p-1 shadow-lg dark:border-zinc-700 dark:bg-zinc-800">
                                      <button
                                        onClick={() => deleteMessage(message.id)}
                                        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30"
                                      >
                                        <Trash2Icon className="size-4" />
                                        Delete
                                      </button>
                                    </div>
                                  )}
                                </div>
                              )}

                              {/* Message bubble content */}
                              <div className="flex flex-col gap-1">
                                <div
                                  className={`rounded-2xl px-4 py-2.5 shadow-sm transition-all group-hover/message:shadow-md ${
                                    message.role === "user"
                                      ? "bg-gradient-to-br from-blue-500 to-indigo-600 text-white"
                                      : "bg-white border border-zinc-200/60 dark:bg-zinc-800 dark:border-zinc-700/60"
                                  }`}
                                >
                                  <div
                                    className={`prose prose-sm max-w-none leading-relaxed ${
                                      message.role === "user"
                                        ? "prose-invert"
                                        : "dark:prose-invert"
                                    }`}
                                  >
                                    {message.parts.map((part: any, index: number) => {
                                      if (part.type === "text") {
                                        return <span key={index}>{part.text}</span>;
                                      }
                                      return null;
                                    })}
                                  </div>
                                </div>
                                <div
                                  className={`px-1.5 text-[10px] font-medium text-zinc-400 dark:text-zinc-500 ${
                                    message.role === "user" ? "text-right" : "text-left"
                                  }`}
                                >
                                  {formatTime(
                                    message.createdAt
                                      ? new Date(message.createdAt)
                                      : new Date()
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ConversationContent>
          <ConversationScrollButton />
        </Conversation>

        {/* Slash Command Menu */}
        {showSlashMenu && (
          <SlashCommandMenu
            query={slashQuery}
            onSelect={handleSlashCommandSelect}
            onClose={() => {
              setShowSlashMenu(false);
              setSlashQuery('');
            }}
          />
        )}

        {/* Input Area - Fixed at bottom */}
        <div className="flex-shrink-0 border-t border-zinc-200/60 bg-white/80 backdrop-blur-xl p-5 dark:border-zinc-800/60 dark:bg-zinc-900/80">
          <div className="rounded-2xl bg-gradient-to-br from-zinc-50 to-zinc-100 p-1 shadow-lg dark:from-zinc-800 dark:to-zinc-900">
            <PromptInput
              onSubmit={(message, event) => {
                event.preventDefault();
                if (inputValue.trim()) {
                  sendMessage({ text: inputValue });
                  setInputValue('');
                  resetTranscript();
                }
              }}
            >
              <PromptInputBody>
                <PromptInputTextarea
                  ref={inputRef}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="What did you accomplish today? Type / for templates (Cmd/Ctrl+K to focus, Cmd/Ctrl+Enter to send)"
                  className="min-h-[60px] resize-none rounded-xl border-0 bg-white px-4 py-3 text-zinc-900 placeholder:text-zinc-500 focus:ring-2 focus:ring-blue-500 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder:text-zinc-400"
                />
              </PromptInputBody>
              <PromptInputFooter className="flex items-center justify-between px-3 pb-2">
                <div className="flex items-center gap-2">
                  <PromptInputTools />
                  {isSupported && (
                    <button
                      type="button"
                      onClick={toggleVoiceRecording}
                      className={`rounded-lg p-2 transition-all hover:scale-105 active:scale-95 ${
                        isListening
                          ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
                          : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-600'
                      }`}
                      title={isListening ? 'Stop recording' : 'Start voice input'}
                    >
                      {isListening ? (
                        <MicOffIcon className="size-4 animate-pulse" />
                      ) : (
                        <MicIcon className="size-4" />
                      )}
                    </button>
                  )}
                </div>
                <PromptInputSubmit
                  status={status}
                  className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-2.5 font-semibold text-white shadow-md transition-all hover:scale-105 hover:from-blue-700 hover:to-indigo-700 hover:shadow-lg active:scale-95 disabled:opacity-50 disabled:hover:scale-100"
                />
              </PromptInputFooter>
            </PromptInput>
          </div>
        </div>
          </div>
        ) : (
          /* Summary View */
          <div className="flex-1 overflow-y-auto p-4">
            {/* Period Toggle */}
            <div className="mb-6 flex justify-center">
              <div className="inline-flex gap-1 rounded-xl bg-zinc-100 p-1 dark:bg-zinc-800">
                <button
                  onClick={() => setSummaryPeriod("week")}
                  className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                    summaryPeriod === "week"
                      ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-700 dark:text-zinc-50"
                      : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200"
                  }`}
                >
                  Weekly
                </button>
                <button
                  onClick={() => setSummaryPeriod("month")}
                  className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                    summaryPeriod === "month"
                      ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-700 dark:text-zinc-50"
                      : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200"
                  }`}
                >
                  Monthly
                </button>
              </div>
            </div>

            {/* Summary Cards */}
            <div className="space-y-4">
              {(summaryPeriod === "week" ? weeklyGroups : monthlyGroups).map((group) => (
                <div
                  key={'weekKey' in group ? group.weekKey : group.monthKey}
                  className="rounded-2xl bg-white p-6 shadow-md transition-all hover:shadow-xl dark:bg-zinc-800"
                >
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">
                      {group.label}
                    </h3>
                    <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-bold text-blue-700 dark:bg-blue-900/50 dark:text-blue-300">
                      {group.messages.length} messages
                    </span>
                  </div>
                  <div className="space-y-3">
                    {group.messages.slice(0, 5).map((message) => (
                      <div
                        key={message.id}
                        className="rounded-lg bg-zinc-50 p-3 text-sm dark:bg-zinc-900/50"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 text-zinc-700 dark:text-zinc-300">
                            {message.parts[0]?.text?.slice(0, 150)}
                            {message.parts[0]?.text?.length > 150 ? "..." : ""}
                          </div>
                          <div className="text-xs text-zinc-500 dark:text-zinc-400">
                            {formatTime(message.createdAt ? new Date(message.createdAt) : new Date())}
                          </div>
                        </div>
                      </div>
                    ))}
                    {group.messages.length > 5 && (
                      <div className="text-center text-sm text-zinc-500 dark:text-zinc-400">
                        +{group.messages.length - 5} more messages
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
          </div>
        </div>
      </div>

      {/* Export Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-5xl max-h-[90vh] overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-zinc-900">
            {/* Modal Header */}
            <div className="sticky top-0 border-b border-zinc-200 bg-white/95 backdrop-blur-xl px-6 py-5 dark:border-zinc-800 dark:bg-zinc-900/95">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
                    Export Preview
                  </h2>
                  <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                    Review your report before exporting to DOCX
                  </p>
                </div>
                <button
                  onClick={() => setShowPreview(false)}
                  className="group rounded-xl bg-zinc-100 p-2.5 text-zinc-700 transition-all hover:scale-105 hover:bg-zinc-200 active:scale-95 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
                  title="Close preview"
                >
                  <XIcon className="size-5 transition-transform group-hover:rotate-90" />
                </button>
              </div>
            </div>

            {/* Modal Content - Scrollable */}
            <div className="overflow-y-auto p-4" style={{ maxHeight: 'calc(90vh - 180px)' }}>
              {/* Report Header Preview */}
              <div className="mb-6 text-center">
                <h1 className="mb-2 text-3xl font-bold text-zinc-900 dark:text-zinc-50">
                  Daily Accomplishment Report
                </h1>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  Generated on{" "}
                  {new Date().toLocaleString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                    hour12: true,
                  })}
                </p>
              </div>

              {/* Table Preview */}
              <div className="overflow-x-auto rounded-xl border border-zinc-200 shadow-lg dark:border-zinc-700">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gradient-to-r from-indigo-600 to-indigo-700">
                      <th className="border-r border-indigo-500 px-4 py-3 text-left text-sm font-bold text-white" style={{ width: '25%' }}>
                        Date & Time
                      </th>
                      <th className="border-r border-indigo-500 px-4 py-3 text-center text-sm font-bold text-white" style={{ width: '15%' }}>
                        Role
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-bold text-white" style={{ width: '60%' }}>
                        Message
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {messages.map((message, index) => {
                      const msg = message as any;
                      const timestamp = msg.createdAt
                        ? new Date(msg.createdAt).toLocaleString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                            hour: "numeric",
                            minute: "2-digit",
                            hour12: true,
                          })
                        : "N/A";
                      const role = message.role === "user" ? "You" : "AI Assistant";
                      let content = "";
                      if (message.parts && Array.isArray(message.parts)) {
                        content = message.parts.map((part: any) => part.text || "").join(" ");
                      } else if (msg.content) {
                        content = msg.content;
                      }

                      return (
                        <tr
                          key={message.id}
                          className={index % 2 === 0 ? "bg-zinc-50 dark:bg-zinc-800/50" : "bg-white dark:bg-zinc-900"}
                        >
                          <td className="border-r border-zinc-200 px-4 py-3 text-sm text-zinc-700 dark:border-zinc-700 dark:text-zinc-300">
                            {timestamp}
                          </td>
                          <td className="border-r border-zinc-200 px-4 py-3 text-center dark:border-zinc-700">
                            <span
                              className={`inline-block rounded-full px-3 py-1 text-xs font-bold ${
                                message.role === "user"
                                  ? "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300"
                                  : "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300"
                              }`}
                            >
                              {role}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-zinc-700 dark:text-zinc-300">
                            <div className="line-clamp-3">{content}</div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Info Note */}
              <div className="mt-4 rounded-xl bg-blue-50 px-4 py-3 text-sm text-blue-800 dark:bg-blue-950/30 dark:text-blue-300">
                <strong>Note:</strong> This preview shows how your data will be organized in the DOCX file. The actual
                document will be formatted for 8.5 x 13 inch paper with professional styling.
              </div>
            </div>

            {/* Modal Footer - Sticky */}
            <div className="sticky bottom-0 border-t border-zinc-200 bg-white/95 backdrop-blur-xl px-6 py-4 dark:border-zinc-800 dark:bg-zinc-900/95">
              <div className="flex items-center justify-end gap-3">
                <button
                  onClick={() => setShowPreview(false)}
                  className="rounded-xl bg-zinc-100 px-5 py-2.5 font-semibold text-zinc-700 transition-all hover:scale-105 hover:bg-zinc-200 active:scale-95 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
                >
                  Cancel
                </button>
                <button
                  onClick={exportReport}
                  className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 px-5 py-2.5 font-semibold text-white shadow-md transition-all hover:scale-105 hover:from-green-700 hover:to-emerald-700 hover:shadow-lg active:scale-95"
                >
                  <FileDownIcon className="size-4" />
                  Export DOCX
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Onboarding Flow */}
      <OnboardingFlow />
    </div>
  );
}
