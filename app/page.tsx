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
  CalendarIcon,
  MessageSquareIcon,
  MenuIcon,
  MoonIcon,
  SunIcon,
  Trash2Icon,
  XIcon,
  LogOutIcon,
  UserIcon,
} from "lucide-react";
import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  createConversation,
  createMessage,
  getAllMessages,
  deleteConversation,
  getConversations,
} from "@/lib/supabase";
import { useAuth } from "@/lib/auth/auth-context";

const STORAGE_KEY = "dar-chat-messages";
const CONVERSATION_ID_KEY = "dar-conversation-id";
const THEME_KEY = "dar-theme";

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

  const { messages, sendMessage: baseSendMessage, status, setMessages } = useChat();

  // Wrapper to inject conversationId into API calls
  const sendMessage = useCallback((message: { text: string }) => {
    if (conversationIdRef.current) {
      // Temporarily intercept fetch to add conversationId
      const originalFetch = window.fetch;
      window.fetch = async (input, init) => {
        if (typeof input === 'string' && input.includes('/api/chat') && init?.body) {
          try {
            const body = JSON.parse(init.body as string);
            body.conversationId = conversationIdRef.current;
            init.body = JSON.stringify(body);
          } catch (e) {
            console.error('Failed to parse body:', e);
          }
        }
        const result = await originalFetch(input, init);
        // Restore original fetch
        window.fetch = originalFetch;
        return result;
      };
    }
    return baseSendMessage(message);
  }, [baseSendMessage]);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [viewMode, setViewMode] = useState<ViewMode>("chat");
  const [summaryPeriod, setSummaryPeriod] = useState<"week" | "month">("week");
  const dateRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  // Initialize theme from localStorage and system preference
  useEffect(() => {
    const savedTheme = localStorage.getItem(THEME_KEY) as "light" | "dark" | null;
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.classList.toggle("dark", savedTheme === "dark");
    } else {
      // Check system preference
      const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      setTheme(isDark ? "dark" : "light");
      document.documentElement.classList.toggle("dark", isDark);
    }
  }, []);

  // Toggle theme function
  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem(THEME_KEY, newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
  };

  // Open sidebar by default on desktop
  useEffect(() => {
    if (window.innerWidth >= 1024) {
      setSidebarOpen(true);
    }
  }, []);

  // Load conversation and messages from database on mount
  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        // Get or create conversation
        let convId = localStorage.getItem(CONVERSATION_ID_KEY);

        if (!convId) {
          // Create a new conversation
          const newConv = await createConversation("Daily Report");
          if (newConv) {
            convId = newConv.id;
            localStorage.setItem(CONVERSATION_ID_KEY, convId);
          }
        }

        if (convId) {
          setConversationId(convId);
          conversationIdRef.current = convId;

          // Load messages from database
          const dbMessages = await getAllMessages();

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
  }, [setMessages]);

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

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-zinc-50 via-white to-zinc-100 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950">
      <header className="w-full border-b border-zinc-200/60 bg-white/80 backdrop-blur-xl dark:border-zinc-800/60 dark:bg-zinc-900/80">
        <div className="flex w-full items-center justify-between px-6 py-5">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="group rounded-xl bg-gradient-to-br from-zinc-100 to-zinc-200 p-2.5 text-zinc-700 shadow-sm transition-all hover:scale-105 hover:shadow-md active:scale-95 dark:from-zinc-800 dark:to-zinc-700 dark:text-zinc-300 lg:hidden"
              title="Toggle sidebar"
            >
              {sidebarOpen ? (
                <XIcon className="size-5 transition-transform group-hover:rotate-90" />
              ) : (
                <MenuIcon className="size-5" />
              )}
            </button>
            <div>
              <h1 className="bg-gradient-to-r from-zinc-900 via-zinc-700 to-zinc-900 bg-clip-text text-2xl font-bold tracking-tight text-transparent dark:from-zinc-50 dark:via-zinc-300 dark:to-zinc-50">
                Daily Accomplishment Report
              </h1>
              <p className="mt-0.5 text-sm font-medium text-zinc-500 dark:text-zinc-400">
                Track and reflect on your daily achievements
              </p>
            </div>
          </div>

          {/* View Toggle Tabs */}
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

          <div className="flex items-center gap-2">
            {/* User Info */}
            {user && (
              <div className="hidden items-center gap-2 rounded-xl bg-gradient-to-br from-zinc-100 to-zinc-200 px-3 py-2 text-sm font-medium text-zinc-700 shadow-sm dark:from-zinc-800 dark:to-zinc-700 dark:text-zinc-300 md:flex">
                <UserIcon className="size-4" />
                <span className="max-w-[150px] truncate">{user.email}</span>
              </div>
            )}

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="group rounded-xl bg-gradient-to-br from-zinc-100 to-zinc-200 p-2.5 text-zinc-700 shadow-sm transition-all hover:scale-105 hover:shadow-md active:scale-95 dark:from-zinc-800 dark:to-zinc-700 dark:text-zinc-300"
              title={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
            >
              {theme === "light" ? (
                <MoonIcon className="size-5 transition-transform group-hover:rotate-12" />
              ) : (
                <SunIcon className="size-5 transition-transform group-hover:rotate-12" />
              )}
            </button>

            {/* Clear Button */}
            {messages.length > 0 && (
              <button
                onClick={clearChat}
                className="group flex items-center gap-2 rounded-xl bg-gradient-to-br from-red-50 to-red-100 px-4 py-2.5 text-sm font-medium text-red-700 shadow-sm transition-all hover:scale-105 hover:from-red-100 hover:to-red-200 hover:shadow-md active:scale-95 dark:from-red-950/50 dark:to-red-900/50 dark:text-red-300 dark:hover:from-red-900/60 dark:hover:to-red-800/60"
                title="Clear chat history"
              >
                <Trash2Icon className="size-4 transition-transform group-hover:rotate-12" />
                <span className="hidden sm:inline">Clear</span>
              </button>
            )}

            {/* Sign Out Button */}
            <button
              onClick={signOut}
              className="group flex items-center gap-2 rounded-xl bg-gradient-to-br from-zinc-100 to-zinc-200 px-4 py-2.5 text-sm font-medium text-zinc-700 shadow-sm transition-all hover:scale-105 hover:from-zinc-200 hover:to-zinc-300 hover:shadow-md active:scale-95 dark:from-zinc-800 dark:to-zinc-700 dark:text-zinc-300 dark:hover:from-zinc-700 dark:hover:to-zinc-600"
              title="Sign out"
            >
              <LogOutIcon className="size-4 transition-transform group-hover:-translate-x-0.5" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside
          className={`${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          } fixed inset-y-0 left-0 top-[85px] z-20 w-72 border-r border-zinc-200/60 bg-white/95 backdrop-blur-xl transition-transform duration-300 dark:border-zinc-800/60 dark:bg-zinc-900/95 lg:static lg:top-0 lg:translate-x-0`}
        >
          <div className="flex h-full flex-col p-5">
            <div className="mb-6 flex items-center gap-2.5 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 px-4 py-3 shadow-sm dark:from-blue-950/30 dark:to-indigo-950/30">
              <div className="rounded-lg bg-white p-2 shadow-sm dark:bg-zinc-800">
                <CalendarIcon className="size-5 text-blue-600 dark:text-blue-400" />
              </div>
              <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">
                History
              </h2>
            </div>

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
                    className="group flex w-full items-center justify-between rounded-xl bg-gradient-to-br from-zinc-50 to-zinc-100 px-4 py-3 text-left shadow-sm transition-all hover:scale-[1.02] hover:from-blue-50 hover:to-indigo-50 hover:shadow-md active:scale-[0.98] dark:from-zinc-800/50 dark:to-zinc-800/30 dark:hover:from-blue-950/30 dark:hover:to-indigo-950/30"
                  >
                    <span className="font-semibold text-zinc-700 transition-colors group-hover:text-blue-700 dark:text-zinc-300 dark:group-hover:text-blue-400">
                      {dateInfo.date}
                    </span>
                    <span className="rounded-full bg-white px-2.5 py-0.5 text-xs font-bold text-zinc-600 shadow-sm transition-colors group-hover:bg-blue-100 group-hover:text-blue-700 dark:bg-zinc-700 dark:text-zinc-300 dark:group-hover:bg-blue-900/50 dark:group-hover:text-blue-300">
                      {dateInfo.count}
                    </span>
                  </button>
                ))}
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
          <div className="flex w-full max-w-3xl flex-1 flex-col">
        {viewMode === "chat" ? (
          <Conversation className="flex-1">
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
              <div className="space-y-8 p-4">
                {groupMessagesByDate(messages).map((group, groupIndex) => (
                  <div
                    key={groupIndex}
                    ref={(el) => {
                      dateRefs.current[group.dateKey] = el;
                    }}
                    className="space-y-5"
                  >
                    {/* Date Header */}
                    <div className="sticky top-2 z-10 flex justify-center">
                      <div className="rounded-full bg-gradient-to-r from-blue-100 via-indigo-100 to-purple-100 px-5 py-2 text-xs font-bold text-blue-900 shadow-lg backdrop-blur-sm dark:from-blue-950/80 dark:via-indigo-950/80 dark:to-purple-950/80 dark:text-blue-200">
                        {group.date}
                      </div>
                    </div>

                    {/* Messages for this date */}
                    <div className="space-y-5">
                      {group.messages.map((message) => (
                        <div
                          key={message.id}
                          className={`group flex gap-3 ${
                            message.role === "user" ? "flex-row-reverse" : "flex-row"
                          }`}
                        >
                          {/* Avatar */}
                          <div className="flex-shrink-0">
                            <div className="relative">
                              <div
                                className={`absolute -inset-1 rounded-full bg-gradient-to-r opacity-0 blur transition-opacity group-hover:opacity-100 ${
                                  message.role === "user"
                                    ? "from-blue-600 to-indigo-600"
                                    : "from-purple-600 to-pink-600"
                                }`}
                              />
                              <img
                                src={
                                  message.role === "user"
                                    ? "https://api.dicebear.com/7.x/avataaars/svg?seed=user"
                                    : "https://api.dicebear.com/7.x/bottts/svg?seed=assistant"
                                }
                                alt={message.role === "user" ? "You" : "AI"}
                                className="relative size-10 rounded-full border-2 border-white shadow-md dark:border-zinc-800"
                              />
                            </div>
                          </div>

                          {/* Message Bubble */}
                          <div
                            className={`flex max-w-[75%] flex-col gap-1.5 ${
                              message.role === "user" ? "items-end" : "items-start"
                            }`}
                          >
                            <div
                              className={`rounded-2xl px-5 py-3 shadow-md transition-all group-hover:shadow-xl ${
                                message.role === "user"
                                  ? "bg-gradient-to-br from-blue-500 to-indigo-600 text-white"
                                  : "bg-white dark:bg-zinc-800"
                              }`}
                            >
                              <div
                                className={`prose prose-sm max-w-none ${
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
                              className={`px-2 text-xs font-medium text-zinc-500 dark:text-zinc-400 ${
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
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ConversationContent>
          <ConversationScrollButton />
        </Conversation>
        ) : (
          /* Summary View */
          <div className="flex-1 overflow-y-auto p-6">
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

        {viewMode === "chat" && (
            <div className="border-t border-zinc-200/60 bg-white/80 backdrop-blur-xl p-5 dark:border-zinc-800/60 dark:bg-zinc-900/80">
              <div className="rounded-2xl bg-gradient-to-br from-zinc-50 to-zinc-100 p-1 shadow-lg dark:from-zinc-800 dark:to-zinc-900">
                <PromptInput
                  onSubmit={(message, event) => {
                    event.preventDefault();
                    if (message.text?.trim()) {
                      sendMessage({ text: message.text });
                    }
                  }}
                >
                  <PromptInputBody>
                    <PromptInputTextarea
                      placeholder="What did you accomplish today?"
                      className="min-h-[60px] resize-none rounded-xl border-0 bg-white px-4 py-3 text-zinc-900 placeholder:text-zinc-500 focus:ring-2 focus:ring-blue-500 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder:text-zinc-400"
                    />
                  </PromptInputBody>
                  <PromptInputFooter className="flex items-center justify-between px-3 pb-2">
                    <PromptInputTools />
                    <PromptInputSubmit
                      status={status}
                      className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-2.5 font-semibold text-white shadow-md transition-all hover:scale-105 hover:from-blue-700 hover:to-indigo-700 hover:shadow-lg active:scale-95 disabled:opacity-50 disabled:hover:scale-100"
                    />
                  </PromptInputFooter>
                </PromptInput>
              </div>
            </div>
        )}
          </div>
        </div>
      </div>
    </div>
  );
}
