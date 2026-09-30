import { 
  Project, 
  Sprint, 
  Task, 
  Issue, 
  TeamMember, 
  Release, 
  ActivityLog 
} from "@/types/project";

// Initial Seed Data
const INITIAL_MOCK_PROJECTS: Project[] = [
  {
    id: "1", project_name: "VetKind", project_code: "VETKIND", description: "Veterinary clinic management platform.",
    status: "ACTIVE", health: "HEALTHY", created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
    last_updated_at: new Date().toISOString(), project_type: "Web App", owner: "Alex Morgan", 
    current_phase: "Development", current_sprint: "Sprint 4", current_version: "v1.2.0", 
    start_date: "2023-10-01", target_date: "2024-03-15", repository_url: "https://github.com/example/vetkind", 
    live_url: "https://vetkind.example.com", notes: "Core modules complete. Focus on billing."
  },
  {
    id: "2", project_name: "Brokerage App", project_code: "BROKERAGE", description: "Real estate and brokerage management app.",
    status: "ACTIVE", health: "ATTENTION_REQUIRED", created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
    last_updated_at: new Date(Date.now() - 86400000).toISOString(), project_type: "Mobile App", owner: "Sam Taylor", 
    current_phase: "UAT", current_sprint: "Sprint 12", current_version: "v0.9.5-rc", 
    start_date: "2023-05-15", target_date: "2024-01-30", repository_url: "https://github.com/example/brokerage", 
    live_url: null, notes: "UAT feedback pending from key stakeholders."
  },
  {
    id: "3", project_name: "BoviCare", project_code: "BOVICARE", description: "Cattle health and farm management solution.",
    status: "ON_HOLD", health: "ATTENTION_REQUIRED", created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
    last_updated_at: new Date(Date.now() - 604800000).toISOString(), project_type: "Web & Mobile", owner: "Jordan Lee", 
    current_phase: "Design", current_sprint: "Sprint 2", current_version: "v0.1.0", 
    start_date: "2024-01-10", target_date: "2024-08-20", repository_url: null, live_url: null, notes: "On hold due to budget review."
  },
  {
    id: "4", project_name: "ShubhLabh CRM", project_code: "SHUBHLABH-CRM", description: "Customer relationship management system.",
    status: "COMPLETED", health: "HEALTHY", created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
    last_updated_at: new Date(Date.now() - 2592000000).toISOString(), project_type: "Enterprise Web", owner: "Casey Smith", 
    current_phase: "Maintenance", current_sprint: "Done", current_version: "v2.0.0", 
    start_date: "2022-09-01", target_date: "2023-11-15", repository_url: "https://github.com/example/shubhlabh", 
    live_url: "https://crm.shubhlabh.example.com", notes: "Successfully transitioned to maintenance phase."
  }
];

// Global cache to persist across hot reloads in development
declare global {
  // eslint-disable-next-line no-var
  var __mockDb: Project[] | undefined;
  // eslint-disable-next-line no-var
  var __mockSprints: Sprint[] | undefined;
  // eslint-disable-next-line no-var
  var __mockTasks: Task[] | undefined;
  // eslint-disable-next-line no-var
  var __mockIssues: Issue[] | undefined;
  // eslint-disable-next-line no-var
  var __mockTeamMembers: TeamMember[] | undefined;
  // eslint-disable-next-line no-var
  var __mockReleases: Release[] | undefined;
  // eslint-disable-next-line no-var
  var __mockActivityLogs: ActivityLog[] | undefined;
}

if (!global.__mockDb) {
  global.__mockDb = [...INITIAL_MOCK_PROJECTS];
  global.__mockSprints = [];
  global.__mockTasks = [];
  global.__mockIssues = [];
  global.__mockTeamMembers = [];
  global.__mockReleases = [];
  global.__mockActivityLogs = [];
}

export const mockDb = {
  // Projects
  getProjects: () => [...global.__mockDb!],
  addProject: (p: Project) => {
    global.__mockDb!.push(p);
  },
  getProject: (id: string) => global.__mockDb!.find(p => p.id === id) || null,
  updateProject: (id: string, updates: Partial<Project>) => {
    const index = global.__mockDb!.findIndex(p => p.id === id);
    if (index !== -1) {
      global.__mockDb![index] = { ...global.__mockDb![index], ...updates, updated_at: new Date().toISOString() };
    }
  },
  archiveProject: (id: string) => {
    const index = global.__mockDb!.findIndex(p => p.id === id);
    if (index !== -1) {
      global.__mockDb![index] = { ...global.__mockDb![index], status: 'ARCHIVED', updated_at: new Date().toISOString() };
    }
  },

  // Sprints
  getSprints: (projectId: string) => global.__mockSprints!.filter(s => s.project_id === projectId),
  
  // Tasks
  getTasks: (projectId: string) => global.__mockTasks!.filter(t => t.project_id === projectId),

  // Issues
  getIssues: (projectId: string) => global.__mockIssues!.filter(i => i.project_id === projectId),

  // Team Members
  getTeamMembers: (projectId: string) => global.__mockTeamMembers!.filter(tm => tm.project_id === projectId),

  // Releases
  getReleases: (projectId: string) => global.__mockReleases!.filter(r => r.project_id === projectId),

  // Activity Logs
  getActivityLogs: (projectId: string) => global.__mockActivityLogs!.filter(a => a.project_id === projectId),
};
