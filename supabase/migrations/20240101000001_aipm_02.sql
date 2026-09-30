-- AIPM-02 Schema Migration

-- ENUMS
DO $$ BEGIN CREATE TYPE sprint_status AS ENUM ('PLANNED', 'ACTIVE', 'COMPLETED', 'CANCELLED'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE task_status AS ENUM ('TODO', 'IN_PROGRESS', 'BLOCKED', 'COMPLETED'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE task_priority AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE issue_type AS ENUM ('BUG', 'ISSUE'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE issue_status AS ENUM ('OPEN', 'IN_PROGRESS', 'BLOCKED', 'RESOLVED', 'CLOSED'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE issue_severity AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE team_member_status AS ENUM ('ACTIVE', 'INACTIVE'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE release_status AS ENUM ('PLANNED', 'IN_PROGRESS', 'RELEASED', 'ROLLED_BACK'); EXCEPTION WHEN duplicate_object THEN null; END $$;

-- SPRINTS
CREATE TABLE IF NOT EXISTS sprints (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    sprint_number INTEGER NOT NULL,
    objective TEXT,
    status sprint_status NOT NULL DEFAULT 'PLANNED',
    start_date TIMESTAMP WITH TIME ZONE,
    end_date TIMESTAMP WITH TIME ZONE,
    created_by TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- TASKS
CREATE TABLE IF NOT EXISTS tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    sprint_id UUID REFERENCES sprints(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT,
    status task_status NOT NULL DEFAULT 'TODO',
    priority task_priority NOT NULL DEFAULT 'MEDIUM',
    assignee_id UUID, -- References team_members(id), added constraint later or handled via logic since team_members is defined after
    due_date TIMESTAMP WITH TIME ZONE,
    created_by TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ISSUES
CREATE TABLE IF NOT EXISTS issues (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    sprint_id UUID REFERENCES sprints(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT,
    type issue_type NOT NULL DEFAULT 'ISSUE',
    severity issue_severity NOT NULL DEFAULT 'MEDIUM',
    status issue_status NOT NULL DEFAULT 'OPEN',
    assignee_id UUID,
    created_by TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- TEAM MEMBERS
CREATE TABLE IF NOT EXISTS team_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    responsibility TEXT,
    status team_member_status NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RELEASES
CREATE TABLE IF NOT EXISTS releases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    version TEXT NOT NULL,
    release_name TEXT NOT NULL,
    status release_status NOT NULL DEFAULT 'PLANNED',
    environment TEXT,
    release_date TIMESTAMP WITH TIME ZONE,
    build_number TEXT,
    release_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ACTIVITY LOGS
CREATE TABLE IF NOT EXISTS activity_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    action TEXT NOT NULL,
    user_name TEXT NOT NULL,
    related_entity_type TEXT,
    related_entity_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS
ALTER TABLE sprints ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE releases ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for all authenticated users" ON sprints FOR SELECT TO authenticated USING (true);
CREATE POLICY "Enable insert for authenticated users" ON sprints FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Enable update for authenticated users" ON sprints FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Enable read access for all authenticated users" ON tasks FOR SELECT TO authenticated USING (true);
CREATE POLICY "Enable insert for authenticated users" ON tasks FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Enable update for authenticated users" ON tasks FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Enable read access for all authenticated users" ON issues FOR SELECT TO authenticated USING (true);
CREATE POLICY "Enable insert for authenticated users" ON issues FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Enable update for authenticated users" ON issues FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Enable read access for all authenticated users" ON team_members FOR SELECT TO authenticated USING (true);
CREATE POLICY "Enable insert for authenticated users" ON team_members FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Enable update for authenticated users" ON team_members FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Enable read access for all authenticated users" ON releases FOR SELECT TO authenticated USING (true);
CREATE POLICY "Enable insert for authenticated users" ON releases FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Enable update for authenticated users" ON releases FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Enable read access for all authenticated users" ON activity_logs FOR SELECT TO authenticated USING (true);
CREATE POLICY "Enable insert for authenticated users" ON activity_logs FOR INSERT TO authenticated WITH CHECK (true);
