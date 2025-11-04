import { supabase } from './client'
import { supabaseServer } from './server'
import type { Conversation, Message } from './types'

// Conversation operations
export async function createConversation(title?: string): Promise<Conversation | null> {
  // Get current user
  console.log('createConversation: Getting user...');
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    console.error('createConversation: User not authenticated')
    return null
  }

  console.log('createConversation: User authenticated:', user.id);
  console.log('createConversation: Creating conversation with title:', title);

  const { data, error } = await supabase
    .from('conversations')
    // @ts-ignore - Type issues with Supabase client
    .insert({
      title: title || null,
      user_id: user.id
    })
    .select()
    .single()

  if (error) {
    console.error('createConversation: Error creating conversation:', error)
    console.error('createConversation: Error details:', JSON.stringify(error, null, 2))
    return null
  }

  console.log('createConversation: Conversation created successfully:', (data as any).id);
  return data as Conversation
}

export async function getConversations(): Promise<Conversation[]> {
  const { data, error } = await supabase
    .from('conversations')
    .select('*')
    .order('updated_at', { ascending: false })

  if (error) {
    console.error('Error fetching conversations:', error)
    return []
  }

  return data || []
}

export async function getConversation(id: string): Promise<Conversation | null> {
  const { data, error } = await supabase
    .from('conversations')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching conversation:', error)
    return null
  }

  return data
}

export async function updateConversationTitle(id: string, title: string): Promise<boolean> {
  const { error } = await supabase
    .from('conversations')
    // @ts-ignore - Type issues with Supabase client
    .update({ title })
    .eq('id', id)

  if (error) {
    console.error('Error updating conversation title:', error)
    return false
  }

  return true
}

export async function deleteConversation(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('conversations')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting conversation:', error)
    return false
  }

  return true
}

// Message operations
export async function createMessage(
  conversationId: string | null,
  role: 'user' | 'assistant' | 'system',
  content: string
): Promise<Message | null> {
  // Get current user
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    console.error('User not authenticated')
    return null
  }

  const { data, error } = await supabase
    .from('messages')
    // @ts-ignore - Type issues with Supabase client
    .insert({
      conversation_id: conversationId,
      role,
      content,
      user_id: user.id
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating message:', error)
    return null
  }

  return data as Message
}

export async function getMessages(conversationId: string): Promise<Message[]> {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true })

  if (error) {
    console.error('Error fetching messages:', error)
    return []
  }

  return data || []
}

export async function getAllMessages(): Promise<Message[]> {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .order('created_at', { ascending: true })

  if (error) {
    console.error('Error fetching all messages:', error)
    return []
  }

  return data || []
}

export async function deleteMessage(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('messages')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting message:', error)
    return false
  }

  return true
}

// Server-side operations (for API routes)
export async function createMessageServer(
  conversationId: string | null,
  role: 'user' | 'assistant' | 'system',
  content: string,
  userId: string
): Promise<Message | null> {
  const { data, error } = await supabaseServer
    .from('messages')
    // @ts-ignore - Type issues with Supabase client
    .insert({
      conversation_id: conversationId,
      role,
      content,
      user_id: userId
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating message (server):', error)
    return null
  }

  return data as Message
}

export async function getMessagesServer(conversationId: string): Promise<Message[]> {
  const { data, error } = await supabaseServer
    .from('messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true })

  if (error) {
    console.error('Error fetching messages (server):', error)
    return []
  }

  return data || []
}
