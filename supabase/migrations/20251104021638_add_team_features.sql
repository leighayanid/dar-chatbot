-- Add Team Features Migration
-- This migration adds support for teams, team members, invitations, and sharing

-- =====================================================
-- 1. CREATE TEAMS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS teams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    avatar_url TEXT,
    owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster lookups
CREATE INDEX idx_teams_owner_id ON teams(owner_id);

-- =====================================================
-- 2. CREATE TEAM MEMBERS TABLE
-- =====================================================
CREATE TYPE team_role AS ENUM ('owner', 'admin', 'member', 'viewer');

CREATE TABLE IF NOT EXISTS team_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role team_role NOT NULL DEFAULT 'member',
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(team_id, user_id)
);

-- Indexes for faster lookups
CREATE INDEX idx_team_members_team_id ON team_members(team_id);
CREATE INDEX idx_team_members_user_id ON team_members(user_id);

-- =====================================================
-- 3. CREATE TEAM INVITATIONS TABLE
-- =====================================================
CREATE TYPE invitation_status AS ENUM ('pending', 'accepted', 'declined', 'expired');

CREATE TABLE IF NOT EXISTS team_invitations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    role team_role NOT NULL DEFAULT 'member',
    invited_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    status invitation_status NOT NULL DEFAULT 'pending',
    token TEXT NOT NULL UNIQUE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW() + INTERVAL '7 days',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    accepted_at TIMESTAMP WITH TIME ZONE
);

-- Indexes for faster lookups
CREATE INDEX idx_team_invitations_team_id ON team_invitations(team_id);
CREATE INDEX idx_team_invitations_email ON team_invitations(email);
CREATE INDEX idx_team_invitations_token ON team_invitations(token);

-- =====================================================
-- 4. ADD TEAM SUPPORT TO EXISTING TABLES
-- =====================================================

-- Add team_id and visibility to conversations
ALTER TABLE conversations ADD COLUMN IF NOT EXISTS team_id UUID REFERENCES teams(id) ON DELETE SET NULL;
ALTER TABLE conversations ADD COLUMN IF NOT EXISTS visibility TEXT DEFAULT 'private' CHECK (visibility IN ('private', 'team', 'shared'));
ALTER TABLE conversations ADD COLUMN IF NOT EXISTS shared_with UUID[] DEFAULT '{}';

CREATE INDEX idx_conversations_team_id ON conversations(team_id);

-- Add team_id and visibility to tasks
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS team_id UUID REFERENCES teams(id) ON DELETE SET NULL;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS visibility TEXT DEFAULT 'private' CHECK (visibility IN ('private', 'team', 'shared'));
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL;

CREATE INDEX idx_tasks_team_id ON tasks(team_id);
CREATE INDEX idx_tasks_assigned_to ON tasks(assigned_to);

-- Add team_id to reports
ALTER TABLE reports ADD COLUMN IF NOT EXISTS team_id UUID REFERENCES teams(id) ON DELETE SET NULL;
ALTER TABLE reports ADD COLUMN IF NOT EXISTS visibility TEXT DEFAULT 'private' CHECK (visibility IN ('private', 'team'));

CREATE INDEX idx_reports_team_id ON reports(team_id);

-- =====================================================
-- 5. CREATE FEEDBACK/COMMENTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
    task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CHECK (conversation_id IS NOT NULL OR task_id IS NOT NULL)
);

CREATE INDEX idx_feedback_conversation_id ON feedback(conversation_id);
CREATE INDEX idx_feedback_task_id ON feedback(task_id);
CREATE INDEX idx_feedback_user_id ON feedback(user_id);

-- =====================================================
-- 6. CREATE HELPER FUNCTIONS
-- =====================================================

-- Function to check if user is team member
CREATE OR REPLACE FUNCTION is_team_member(user_id UUID, team_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM team_members
        WHERE team_members.user_id = $1 AND team_members.team_id = $2
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user's role in team
CREATE OR REPLACE FUNCTION get_team_role(user_id UUID, team_id UUID)
RETURNS team_role AS $$
DECLARE
    user_role team_role;
BEGIN
    SELECT role INTO user_role
    FROM team_members
    WHERE team_members.user_id = $1 AND team_members.team_id = $2;

    RETURN user_role;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user can manage team (owner or admin)
CREATE OR REPLACE FUNCTION can_manage_team(user_id UUID, team_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    user_role team_role;
BEGIN
    user_role := get_team_role($1, $2);
    RETURN user_role IN ('owner', 'admin');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 7. UPDATE RLS POLICIES
-- =====================================================

-- Teams RLS
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view teams they are members of" ON teams;
CREATE POLICY "Users can view teams they are members of"
    ON teams FOR SELECT
    USING (
        owner_id = auth.uid() OR
        is_team_member(auth.uid(), id)
    );

DROP POLICY IF EXISTS "Owners can update their teams" ON teams;
CREATE POLICY "Owners can update their teams"
    ON teams FOR UPDATE
    USING (owner_id = auth.uid());

DROP POLICY IF EXISTS "Users can create teams" ON teams;
CREATE POLICY "Users can create teams"
    ON teams FOR INSERT
    WITH CHECK (owner_id = auth.uid());

DROP POLICY IF EXISTS "Owners can delete their teams" ON teams;
CREATE POLICY "Owners can delete their teams"
    ON teams FOR DELETE
    USING (owner_id = auth.uid());

-- Team Members RLS
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view team members of their teams" ON team_members;
CREATE POLICY "Users can view team members of their teams"
    ON team_members FOR SELECT
    USING (is_team_member(auth.uid(), team_id));

DROP POLICY IF EXISTS "Team admins can manage members" ON team_members;
CREATE POLICY "Team admins can manage members"
    ON team_members FOR ALL
    USING (can_manage_team(auth.uid(), team_id));

-- Team Invitations RLS
ALTER TABLE team_invitations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view invitations to their teams" ON team_invitations;
CREATE POLICY "Users can view invitations to their teams"
    ON team_invitations FOR SELECT
    USING (
        can_manage_team(auth.uid(), team_id) OR
        email = (SELECT email FROM auth.users WHERE id = auth.uid())
    );

DROP POLICY IF EXISTS "Team admins can create invitations" ON team_invitations;
CREATE POLICY "Team admins can create invitations"
    ON team_invitations FOR INSERT
    WITH CHECK (can_manage_team(auth.uid(), team_id));

DROP POLICY IF EXISTS "Team admins can update invitations" ON team_invitations;
CREATE POLICY "Team admins can update invitations"
    ON team_invitations FOR UPDATE
    USING (can_manage_team(auth.uid(), team_id));

-- Update Conversations RLS to support team sharing
DROP POLICY IF EXISTS "Users can view their own conversations" ON conversations;
CREATE POLICY "Users can view their own conversations"
    ON conversations FOR SELECT
    USING (
        user_id = auth.uid() OR
        (team_id IS NOT NULL AND is_team_member(auth.uid(), team_id)) OR
        (auth.uid() = ANY(shared_with))
    );

DROP POLICY IF EXISTS "Users can insert their own conversations" ON conversations;
CREATE POLICY "Users can insert their own conversations"
    ON conversations FOR INSERT
    WITH CHECK (
        user_id = auth.uid() AND
        (team_id IS NULL OR is_team_member(auth.uid(), team_id))
    );

DROP POLICY IF EXISTS "Users can update their own conversations" ON conversations;
CREATE POLICY "Users can update their own conversations"
    ON conversations FOR UPDATE
    USING (
        user_id = auth.uid() OR
        (team_id IS NOT NULL AND can_manage_team(auth.uid(), team_id))
    );

DROP POLICY IF EXISTS "Users can delete their own conversations" ON conversations;
CREATE POLICY "Users can delete their own conversations"
    ON conversations FOR DELETE
    USING (
        user_id = auth.uid() OR
        (team_id IS NOT NULL AND can_manage_team(auth.uid(), team_id))
    );

-- Update Messages RLS to support team sharing
DROP POLICY IF EXISTS "Users can view messages in their conversations" ON messages;
CREATE POLICY "Users can view messages in their conversations"
    ON messages FOR SELECT
    USING (
        user_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM conversations
            WHERE conversations.id = messages.conversation_id AND (
                conversations.user_id = auth.uid() OR
                (conversations.team_id IS NOT NULL AND is_team_member(auth.uid(), conversations.team_id)) OR
                (auth.uid() = ANY(conversations.shared_with))
            )
        )
    );

-- Update Tasks RLS to support team sharing
DROP POLICY IF EXISTS "Users can view their own tasks" ON tasks;
CREATE POLICY "Users can view their own tasks"
    ON tasks FOR SELECT
    USING (
        user_id = auth.uid() OR
        assigned_to = auth.uid() OR
        (team_id IS NOT NULL AND is_team_member(auth.uid(), team_id))
    );

DROP POLICY IF EXISTS "Users can insert their own tasks" ON tasks;
CREATE POLICY "Users can insert their own tasks"
    ON tasks FOR INSERT
    WITH CHECK (
        user_id = auth.uid() AND
        (team_id IS NULL OR is_team_member(auth.uid(), team_id))
    );

DROP POLICY IF EXISTS "Users can update their own tasks" ON tasks;
CREATE POLICY "Users can update their own tasks"
    ON tasks FOR UPDATE
    USING (
        user_id = auth.uid() OR
        assigned_to = auth.uid() OR
        (team_id IS NOT NULL AND is_team_member(auth.uid(), team_id))
    );

DROP POLICY IF EXISTS "Users can delete their own tasks" ON tasks;
CREATE POLICY "Users can delete their own tasks"
    ON tasks FOR DELETE
    USING (
        user_id = auth.uid() OR
        (team_id IS NOT NULL AND can_manage_team(auth.uid(), team_id))
    );

-- Update Reports RLS to support team sharing
DROP POLICY IF EXISTS "Users can view their own reports" ON reports;
CREATE POLICY "Users can view their own reports"
    ON reports FOR SELECT
    USING (
        user_id = auth.uid() OR
        (team_id IS NOT NULL AND is_team_member(auth.uid(), team_id))
    );

DROP POLICY IF EXISTS "Users can insert their own reports" ON reports;
CREATE POLICY "Users can insert their own reports"
    ON reports FOR INSERT
    WITH CHECK (
        user_id = auth.uid() AND
        (team_id IS NULL OR is_team_member(auth.uid(), team_id))
    );

DROP POLICY IF EXISTS "Users can update their own reports" ON reports;
CREATE POLICY "Users can update their own reports"
    ON reports FOR UPDATE
    USING (
        user_id = auth.uid() OR
        (team_id IS NOT NULL AND can_manage_team(auth.uid(), team_id))
    );

DROP POLICY IF EXISTS "Users can delete their own reports" ON reports;
CREATE POLICY "Users can delete their own reports"
    ON reports FOR DELETE
    USING (
        user_id = auth.uid() OR
        (team_id IS NOT NULL AND can_manage_team(auth.uid(), team_id))
    );

-- Feedback RLS
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view feedback on accessible resources" ON feedback;
CREATE POLICY "Users can view feedback on accessible resources"
    ON feedback FOR SELECT
    USING (
        user_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM conversations
            WHERE conversations.id = feedback.conversation_id AND (
                conversations.user_id = auth.uid() OR
                (conversations.team_id IS NOT NULL AND is_team_member(auth.uid(), conversations.team_id))
            )
        ) OR
        EXISTS (
            SELECT 1 FROM tasks
            WHERE tasks.id = feedback.task_id AND (
                tasks.user_id = auth.uid() OR
                (tasks.team_id IS NOT NULL AND is_team_member(auth.uid(), tasks.team_id))
            )
        )
    );

DROP POLICY IF EXISTS "Team members can create feedback" ON feedback;
CREATE POLICY "Team members can create feedback"
    ON feedback FOR INSERT
    WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update their own feedback" ON feedback;
CREATE POLICY "Users can update their own feedback"
    ON feedback FOR UPDATE
    USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can delete their own feedback" ON feedback;
CREATE POLICY "Users can delete their own feedback"
    ON feedback FOR DELETE
    USING (user_id = auth.uid());

-- =====================================================
-- 8. CREATE TRIGGERS FOR UPDATED_AT
-- =====================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_teams_updated_at ON teams;
CREATE TRIGGER update_teams_updated_at
    BEFORE UPDATE ON teams
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_feedback_updated_at ON feedback;
CREATE TRIGGER update_feedback_updated_at
    BEFORE UPDATE ON feedback
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 9. AUTO-ADD TEAM OWNER AS MEMBER
-- =====================================================

CREATE OR REPLACE FUNCTION auto_add_team_owner_as_member()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO team_members (team_id, user_id, role)
    VALUES (NEW.id, NEW.owner_id, 'owner');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_auto_add_team_owner ON teams;
CREATE TRIGGER trigger_auto_add_team_owner
    AFTER INSERT ON teams
    FOR EACH ROW
    EXECUTE FUNCTION auto_add_team_owner_as_member();
