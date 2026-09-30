export type ProjectStatus = 'PLANNING' | 'ACTIVE' | 'ON_HOLD' | 'COMPLETED' | 'ARCHIVED';
export type ProjectHealth = 'NOT_STARTED' | 'HEALTHY' | 'ATTENTION_REQUIRED' | 'CRITICAL';

export interface Project {
  id: string;
  project_name: string;
  project_code: string;
  description: string | null;
  project_type: string | null;
  owner: string | null;
  status: ProjectStatus;
  health: ProjectHealth;
  current_phase: string | null;
  current_sprint: string | null;
  current_version: string | null;
  start_date: string | null;
  target_date: string | null;
  last_updated_at: string | null;
  repository_url: string | null;
  live_url: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}
