export type Conversation = {
  id: string
  title: string | null
  user_id: string | null
  created_at: string
  updated_at: string
}

export type Message = {
  id: string
  conversation_id: string | null
  user_id: string | null
  role: 'user' | 'assistant' | 'system'
  content: string
  created_at: string
}

export type Database = {
  public: {
    Tables: {
      conversations: {
        Row: Conversation
        Insert: Omit<Conversation, 'id' | 'created_at' | 'updated_at'> & {
          id?: string
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Omit<Conversation, 'id' | 'created_at' | 'updated_at'>>
      }
      messages: {
        Row: Message
        Insert: Omit<Message, 'id' | 'created_at'> & {
          id?: string
          created_at?: string
        }
        Update: Partial<Omit<Message, 'id' | 'created_at'>>
      }
    }
  }
}
