-- Create conversations table to track chat sessions
CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create messages table to store chat messages
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX idx_messages_created_at ON messages(created_at DESC);
CREATE INDEX idx_conversations_created_at ON conversations(created_at DESC);

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to automatically update updated_at on conversations
CREATE TRIGGER update_conversations_updated_at
  BEFORE UPDATE ON conversations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (for now, we'll allow all operations)
-- In production, you would want to add proper authentication and user-specific policies
CREATE POLICY "Allow all operations on conversations" ON conversations
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on messages" ON messages
  FOR ALL USING (true) WITH CHECK (true);

-- Add comments for documentation
COMMENT ON TABLE conversations IS 'Stores chat conversation sessions';
COMMENT ON TABLE messages IS 'Stores individual messages within conversations';
COMMENT ON COLUMN messages.role IS 'The role of the message sender: user, assistant, or system';
COMMENT ON COLUMN messages.content IS 'The text content of the message';
