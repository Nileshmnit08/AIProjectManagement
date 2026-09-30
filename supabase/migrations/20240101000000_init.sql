-- Create ENUMs for Project Status and Health
CREATE TYPE project_status AS ENUM ('PLANNING', 'ACTIVE', 'ON_HOLD', 'COMPLETED', 'ARCHIVED');
CREATE TYPE project_health AS ENUM ('NOT_STARTED', 'HEALTHY', 'ATTENTION_REQUIRED', 'CRITICAL');

-- Create Users table (extends auth.users minimally or standalone for app logic)
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create Teams table (foundation)
CREATE TABLE teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create Projects table
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_name TEXT NOT NULL,
  project_code TEXT NOT NULL UNIQUE,
  description TEXT,
  project_type TEXT,
  owner UUID REFERENCES users(id) ON DELETE SET NULL,
  status project_status NOT NULL DEFAULT 'PLANNING',
  health project_health NOT NULL DEFAULT 'NOT_STARTED',
  current_phase TEXT,
  current_sprint TEXT,
  current_version TEXT,
  start_date DATE,
  target_date DATE,
  last_updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  repository_url TEXT,
  live_url TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Create Policies (allow read access to authenticated users for now)
CREATE POLICY "Allow authenticated users to read users" ON users FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated users to read teams" ON teams FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated users to read projects" ON projects FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated users to insert projects" ON projects FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow authenticated users to update projects" ON projects FOR UPDATE TO authenticated USING (true);

-- Create Trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_teams_updated_at BEFORE UPDATE ON teams FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Seed initial 4 projects
INSERT INTO projects (project_name, project_code, status, health, description) VALUES
('VetKind', 'VETKIND', 'ACTIVE', 'HEALTHY', 'Veterinary clinic management platform.'),
('Brokerage App', 'BROKERAGE', 'ACTIVE', 'ATTENTION_REQUIRED', 'Real estate and brokerage management app.'),
('BoviCare', 'BOVICARE', 'ACTIVE', 'ATTENTION_REQUIRED', 'Cattle health and farm management solution.'),
('ShubhLabh CRM', 'SHUBHLABH-CRM', 'ACTIVE', 'HEALTHY', 'Customer relationship management system.');
