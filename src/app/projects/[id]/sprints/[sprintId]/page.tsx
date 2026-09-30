import { createClient } from "@/lib/supabase/server";
import { mockDb } from "@/lib/mock-db";
import { Sprint, Task } from "@/types/project";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, ChevronLeft, Target, PlayCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AddTaskDialog } from "@/components/tasks/AddTaskDialog";
import { TeamMember } from "@/types/project";

export default async function SprintDetailPage({ params }: { params: { id: string, sprintId: string } }) {
  let sprint: Sprint | null = null;
  let tasks: Task[] = [];
  let team: TeamMember[] = [];
  let error: string | null = null;

  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
      const sprints = mockDb.getSprints(params.id);
      sprint = sprints.find(s => s.id === params.sprintId) || null;
      tasks = mockDb.getTasks(params.id).filter(t => t.sprint_id === params.sprintId);
      team = mockDb.getTeamMembers(params.id);
    } else {
      const supabase = createClient();
      const [sprintRes, tasksRes, teamRes] = await Promise.all([
        supabase.from('sprints').select('*').eq('id', params.sprintId).single(),
        supabase.from('tasks').select('*').eq('sprint_id', params.sprintId).order('created_at', { ascending: false }),
        supabase.from('team_members').select('*').eq('project_id', params.id)
      ]);
      
      if (sprintRes.error) throw sprintRes.error;
      sprint = sprintRes.data as Sprint;
      
      if (tasksRes.data) tasks = tasksRes.data as Task[];
      if (teamRes.data) team = teamRes.data as TeamMember[];
    }
  } catch {
    error = "Unable to load sprint details.";
  }

  if (error || !sprint) {
    return (
      <Card className="border-rose-200 bg-rose-50/50">
        <CardContent className="flex flex-col items-center justify-center py-12 text-center text-rose-600">
          <p className="font-medium">{error || "Sprint not found"}</p>
          <Link href={`/projects/${params.id}/sprints`} className="text-sm underline mt-2">Return to Sprints</Link>
        </CardContent>
      </Card>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'PLANNED': return 'bg-slate-100 text-slate-800 border-slate-200';
      case 'COMPLETED': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'CANCELLED': return 'bg-rose-100 text-rose-800 border-rose-200';
      default: return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  const formatDate = (isoDate: string | null) => {
    if (!isoDate) return "--";
    return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(isoDate));
  };

  const totalTasks = tasks.length;
  const completed = tasks.filter(t => t.status === 'COMPLETED').length;
  const inProgress = tasks.filter(t => t.status === 'IN_PROGRESS').length;
  const blocked = tasks.filter(t => t.status === 'BLOCKED').length;
  const remaining = tasks.filter(t => t.status === 'TODO').length;
  const progress = totalTasks === 0 ? 0 : Math.round((completed / totalTasks) * 100);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <Link href={`/projects/${params.id}/sprints`} className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors">
        <ChevronLeft className="w-4 h-4 mr-1" /> Back to Sprints
      </Link>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-bold text-slate-900">{sprint.name}</h1>
            <Badge variant="outline" className={getStatusColor(sprint.status)}>{sprint.status}</Badge>
          </div>
          <div className="flex items-center gap-4 text-sm text-slate-500">
            <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded">Sprint {sprint.sprint_number}</span>
            <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4"/> {formatDate(sprint.start_date)} - {formatDate(sprint.end_date)}</span>
          </div>
        </div>
        <div className="flex gap-2">
          {sprint.status === 'PLANNED' && (
            <Button variant="outline" className="bg-white gap-2">
              <PlayCircle className="w-4 h-4" /> Start Sprint
            </Button>
          )}
          <Button variant="outline">Edit Sprint</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardContent className="p-6">
              <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                <Target className="w-4 h-4" /> Sprint Objective
              </h3>
              <p className="text-slate-900 leading-relaxed">
                {sprint.objective || "No specific objective defined for this sprint."}
              </p>
            </CardContent>
          </Card>

          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-slate-900">Sprint Tasks</h3>
              <AddTaskDialog projectId={params.id} sprints={[sprint]} team={team} defaultSprintId={sprint.id} />
            </div>
            {tasks.length === 0 ? (
              <div className="bg-slate-50 border border-dashed border-slate-200 rounded-lg p-8 text-center">
                <p className="text-slate-500 mb-2">No tasks assigned to this sprint yet.</p>
              </div>
            ) : (
              <div className="border border-slate-200 rounded-lg overflow-hidden bg-white shadow-sm">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 font-medium">
                    <tr>
                      <th className="px-4 py-3">Task Title</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Assignee</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {tasks.map((task) => (
                      <tr key={task.id} className="hover:bg-slate-50/50">
                        <td className="px-4 py-3 font-medium text-slate-900">{task.title}</td>
                        <td className="px-4 py-3 text-xs">{task.status}</td>
                        <td className="px-4 py-3 text-slate-600">{task.assignee_id || "Unassigned"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">Progress</h3>
              <div className="flex items-end gap-2 mb-2">
                <span className="text-3xl font-bold text-slate-900">{progress}%</span>
                <span className="text-slate-500 font-medium mb-1">Completed</span>
              </div>
              <div className="h-3 bg-slate-100 rounded-full overflow-hidden mb-6">
                <div 
                  className="h-full bg-indigo-500 rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                  <span className="text-slate-500">Total Tasks</span>
                  <span className="font-semibold text-slate-900">{totalTasks}</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                  <span className="text-emerald-600">Completed</span>
                  <span className="font-semibold text-emerald-700">{completed}</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                  <span className="text-blue-600">In Progress</span>
                  <span className="font-semibold text-blue-700">{inProgress}</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                  <span className="text-rose-600 font-medium flex items-center gap-1.5">
                    {blocked > 0 && <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>}
                    Blocked
                  </span>
                  <span className="font-semibold text-rose-700">{blocked}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">To Do</span>
                  <span className="font-semibold text-slate-700">{remaining}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
