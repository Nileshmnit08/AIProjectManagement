import { createClient } from "@/lib/supabase/server";
import { mockDb } from "@/lib/mock-db";
import { Task, Sprint, TeamMember } from "@/types/project";
import { Card, CardContent } from "@/components/ui/card";
import { ListTodo, Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AddTaskDialog } from "@/components/tasks/AddTaskDialog";
import { AlertCircle } from "lucide-react";

export default async function TasksPage({ params, searchParams }: { params: { id: string }, searchParams?: { q?: string, status?: string, priority?: string, sprint?: string, assignee?: string, sort?: string } }) {
  let allTasks: Task[] = [];
  let tasks: Task[] = [];
  let sprints: Sprint[] = [];
  let team: TeamMember[] = [];
  let error: string | null = null;

  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
      tasks = mockDb.getTasks(params.id);
      sprints = mockDb.getSprints(params.id);
      team = mockDb.getTeamMembers(params.id);
    } else {
      const supabase = createClient();
      const [tasksRes, sprintsRes, teamRes] = await Promise.all([
        supabase.from('tasks').select('*').eq('project_id', params.id).order('created_at', { ascending: false }),
        supabase.from('sprints').select('*').eq('project_id', params.id).order('sprint_number', { ascending: false }),
        supabase.from('team_members').select('*').eq('project_id', params.id)
      ]);
        
      if (tasksRes.error) throw tasksRes.error;
      allTasks = tasksRes.data as Task[];
      sprints = (sprintsRes.data || []) as Sprint[];
      team = (teamRes.data || []) as TeamMember[];
    }
  } catch {
    error = "Unable to load project tasks.";
  }

  // Apply Search
  tasks = [...allTasks];
  if (searchParams?.q) {
    const q = searchParams.q.toLowerCase();
    tasks = tasks.filter(t => t.title.toLowerCase().includes(q) || t.id.toLowerCase().includes(q));
  }
  
  // Apply Filters
  if (searchParams?.status) tasks = tasks.filter(t => t.status === searchParams.status);
  if (searchParams?.priority) tasks = tasks.filter(t => t.priority === searchParams.priority);
  if (searchParams?.sprint) tasks = tasks.filter(t => t.sprint_id === searchParams.sprint);
  if (searchParams?.assignee) tasks = tasks.filter(t => t.assignee_id === searchParams.assignee);

  // Apply Sort
  const sort = searchParams?.sort || 'created_desc';
  tasks.sort((a, b) => {
    switch (sort) {
      case 'created_asc': return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      case 'updated_desc': return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
      case 'due_asc': return new Date(a.due_date || '2099-12-31').getTime() - new Date(b.due_date || '2099-12-31').getTime();
      case 'status': return a.status.localeCompare(b.status);
      case 'priority': {
        const pOrder: Record<string, number> = { 'CRITICAL': 4, 'HIGH': 3, 'MEDIUM': 2, 'LOW': 1 };
        return (pOrder[b.priority] || 0) - (pOrder[a.priority] || 0);
      }
      case 'created_desc': default:
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    }
  });

  if (error) {
    return (
      <Card className="border-rose-200 bg-rose-50/50">
        <CardContent className="flex flex-col items-center justify-center py-12 text-center text-rose-600">
          <p className="font-medium">{error}</p>
        </CardContent>
      </Card>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'IN_PROGRESS': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'TODO': return 'bg-slate-100 text-slate-800 border-slate-200';
      case 'COMPLETED': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'BLOCKED': return 'bg-rose-100 text-rose-800 border-rose-200';
      default: return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'CRITICAL': return 'text-rose-600 bg-rose-50';
      case 'HIGH': return 'text-amber-600 bg-amber-50';
      case 'MEDIUM': return 'text-blue-600 bg-blue-50';
      case 'LOW': return 'text-slate-600 bg-slate-50';
      default: return 'text-slate-600 bg-slate-50';
    }
  };

  const formatDate = (isoDate: string | null) => {
    if (!isoDate) return "--";
    return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(new Date(isoDate));
  };

  const isOverdue = (task: Task) => {
    if (task.status === 'COMPLETED' || !task.due_date) return false;
    return new Date(task.due_date) < new Date(new Date().setHours(0, 0, 0, 0));
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-slate-900">Tasks</h2>
        <AddTaskDialog projectId={params.id} sprints={sprints} team={team} />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="border-slate-200/60 shadow-sm bg-slate-50">
          <CardContent className="p-4 text-center">
            <p className="text-sm font-medium text-slate-500 mb-1">Total Tasks</p>
            <p className="text-2xl font-bold text-slate-900">{tasks.length}</p>
          </CardContent>
        </Card>
        <Card className="border-slate-200/60 shadow-sm bg-slate-50">
          <CardContent className="p-4 text-center">
            <p className="text-sm font-medium text-slate-500 mb-1">To Do</p>
            <p className="text-2xl font-bold text-slate-700">{tasks.filter(t => t.status === 'TODO').length}</p>
          </CardContent>
        </Card>
        <Card className="border-slate-200/60 shadow-sm bg-blue-50/50">
          <CardContent className="p-4 text-center">
            <p className="text-sm font-medium text-blue-600 mb-1">In Progress</p>
            <p className="text-2xl font-bold text-blue-700">{tasks.filter(t => t.status === 'IN_PROGRESS').length}</p>
          </CardContent>
        </Card>
        <Card className="border-slate-200/60 shadow-sm bg-rose-50/50">
          <CardContent className="p-4 text-center">
            <p className="text-sm font-medium text-rose-600 mb-1 flex justify-center items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span> Blocked
            </p>
            <p className="text-2xl font-bold text-rose-700">{tasks.filter(t => t.status === 'BLOCKED').length}</p>
          </CardContent>
        </Card>
        <Card className="border-slate-200/60 shadow-sm bg-emerald-50/50">
          <CardContent className="p-4 text-center">
            <p className="text-sm font-medium text-emerald-600 mb-1">Completed</p>
            <p className="text-2xl font-bold text-emerald-700">{tasks.filter(t => t.status === 'COMPLETED').length}</p>
          </CardContent>
        </Card>
      </div>

      {tasks.length > 0 && (
        <div className="flex gap-4 items-center">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search tasks..." 
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>
          <Button variant="outline" className="gap-2">
            <Filter className="w-4 h-4" />
            Filter
          </Button>
        </div>
      )}

      {tasks.length === 0 ? (
        <Card className="border-dashed border-2 border-slate-200 bg-slate-50/50 shadow-none">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-4">
              <ListTodo className="w-6 h-6 text-slate-400" />
            </div>
            <h3 className="text-lg font-medium text-slate-900 mb-1">No tasks found for this project.</h3>
            <p className="text-slate-500 mb-4 max-w-sm">
              Start tracking work by creating tasks and assigning them to your team.
            </p>
            <AddTaskDialog projectId={params.id} sprints={sprints} team={team}>
              <Button variant="outline">Create your first task</Button>
            </AddTaskDialog>
          </CardContent>
        </Card>
      ) : (
        <div className="border border-slate-200 rounded-lg overflow-hidden bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 font-medium">
                <tr>
                  <th className="px-4 py-3">Task Title</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Priority</th>
                  <th className="px-4 py-3">Sprint</th>
                  <th className="px-4 py-3">Assignee</th>
                  <th className="px-4 py-3">Due Date</th>
                  <th className="px-4 py-3">Updated</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {tasks.map((task) => (
                  <tr key={task.id} className="hover:bg-slate-50/50 transition-colors group cursor-pointer">
                    <td className="px-4 py-3 font-medium text-slate-900 group-hover:text-indigo-600 transition-colors">
                      <div className="flex items-center gap-2">
                        {isOverdue(task) && (
                          <AlertCircle className="w-4 h-4 text-rose-600" aria-label="Overdue Task" title="Overdue" />
                        )}
                        <span className={isOverdue(task) ? "text-rose-700" : ""}>{task.title}</span>
                      </div>
                      {isOverdue(task) && <span className="text-[10px] text-rose-600 font-bold uppercase tracking-wider block mt-0.5">Overdue</span>}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="outline" className={`text-[10px] uppercase font-bold tracking-wider ${getStatusColor(task.status)}`}>
                        {task.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${getPriorityColor(task.priority)}`}>
                        {task.priority}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-600 text-xs">
                      {task.sprint_id ? (
                        <span className="truncate max-w-[100px] block">{task.sprint_id.substring(0,8)}</span>
                      ) : (
                        <span className="text-slate-400 italic">Backlog</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {task.assignee_id ? (
                        <span className="truncate max-w-[120px] block">{task.assignee_id}</span>
                      ) : (
                        <span className="text-slate-400 italic">Unassigned</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {formatDate(task.due_date)}
                    </td>
                    <td className="px-4 py-3 text-slate-500 text-xs">
                      {formatDate(task.updated_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
