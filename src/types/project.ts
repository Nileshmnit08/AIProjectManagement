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

// -----------------------------------------------------
// AIPM-02 Entities
// -----------------------------------------------------

export type SprintStatus = 'PLANNED' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';

export interface Sprint {
  id: string;
  project_id: string;
  name: string;
  sprint_number: number;
  objective: string | null;
  status: SprintStatus;
  start_date: string | null;
  end_date: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'BLOCKED' | 'COMPLETED';
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface Task {
  id: string;
  project_id: string;
  sprint_id: string | null;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  assignee_id: string | null;
  due_date: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export type IssueType = 'BUG' | 'ISSUE';
export type IssueStatus = 'OPEN' | 'IN_PROGRESS' | 'BLOCKED' | 'RESOLVED' | 'CLOSED';
export type IssueSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface Issue {
  id: string;
  project_id: string;
  sprint_id: string | null;
  title: string;
  description: string | null;
  type: IssueType;
  severity: IssueSeverity;
  status: IssueStatus;
  assignee_id: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export type TeamMemberStatus = 'ACTIVE' | 'INACTIVE';

export interface TeamMember {
  id: string;
  project_id: string;
  name: string;
  role: string;
  responsibility: string | null;
  status: TeamMemberStatus;
  created_at: string;
}

export type ReleaseStatus = 'PLANNED' | 'IN_PROGRESS' | 'RELEASED' | 'ROLLED_BACK';

export interface Release {
  id: string;
  project_id: string;
  version: string;
  release_name: string;
  status: ReleaseStatus;
  environment: string | null;
  release_date: string | null;
  build_number: string | null;
  release_notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface ActivityLog {
  id: string;
  project_id: string;
  action: string;
  user_name: string;
  related_entity_type: string | null;
  related_entity_id: string | null;
  created_at: string;
}
