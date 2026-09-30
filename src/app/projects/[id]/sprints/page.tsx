import { createClient } from "@/lib/supabase/server";
import { mockDb } from "@/lib/mock-db";
import { Sprint, Task } from "@/types/project";
import { Card, CardContent } from "@/components/ui/card";
import { LayoutList, Calendar, CheckCircle2, Circle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { AddSprintDialog } from "@/components/sprints/AddSprintDialog";

export default async function SprintsPage({ params }: { params: { id: string } }) {
  let sprints: Sprint[] = [];
  let tasks: Task[] = [];
  let error: string | null = null;

  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
      sprints = mockDb.getSprints(params.id);
      tasks = mockDb.getTasks(params.id);
    } else {
      const supabase = createClient();
      const [sprintsRes, tasksRes] = await Promise.all([
        supabase.from('sprints').select('*').eq('project_id', params.id).order('sprint_number', { ascending: false }),
        supabase.from('tasks').select('*').eq('project_id', params.id).not('sprint_id', 'is', null)
      ]);
        
      if (sprintsRes.error) throw sprintsRes.error;
      if (tasksRes.error) throw tasksRes.error;
      
      sprints = sprintsRes.data as Sprint[];
      tasks = tasksRes.data as Task[];
    }
  } catch {
    error = "Unable to load project sprints.";
  }

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

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-slate-900">Sprints</h2>
        <AddSprintDialog projectId={params.id} />
      </div>

      {sprints.length === 0 ? (
        <Card className="border-dashed border-2 border-slate-200 bg-slate-50/50 shadow-none">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-4">
              <LayoutList className="w-6 h-6 text-slate-400" />
            </div>
            <h3 className="text-lg font-medium text-slate-900 mb-1">No sprints created yet.</h3>
            <p className="text-slate-500 mb-4 max-w-sm">
              Break your project down into timeboxed iterations to deliver value consistently.
            </p>
            <AddSprintDialog projectId={params.id}>
              <Button variant="outline">Create your first sprint</Button>
            </AddSprintDialog>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sprints.map(sprint => {
            const sprintTasks = tasks.filter(t => t.sprint_id === sprint.id);
            const totalTasks = sprintTasks.length;
            const completedTasks = sprintTasks.filter(t => t.status === 'COMPLETED').length;
            const openTasks = totalTasks - completedTasks;
            const progress = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

            return (
              <Link key={sprint.id} href={`/projects/${params.id}/sprints/${sprint.id}`}>
                <Card className="border-slate-200 shadow-sm hover:border-indigo-200 hover:shadow-md transition-all cursor-pointer h-full flex flex-col">
                  <CardContent className="p-5 flex-1 flex flex-col">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-semibold text-slate-900 line-clamp-1">{sprint.name}</h3>
                        <p className="text-sm text-slate-500 font-mono mt-0.5">Sprint {sprint.sprint_number}</p>
                      </div>
                      <Badge variant="outline" className={`text-[10px] uppercase font-bold tracking-wider ${getStatusColor(sprint.status)}`}>
                        {sprint.status}
                      </Badge>
                    </div>
                    
                    <p className="text-sm text-slate-600 line-clamp-2 mb-4 flex-1">
                      {sprint.objective || "No objective defined."}
                    </p>

                    <div className="space-y-4">
                      {/* Progress Bar */}
                      <div>
                        <div className="flex justify-between items-end mb-1.5">
                          <span className="text-xs font-medium text-slate-500">Progress</span>
                          <span className="text-xs font-bold text-slate-700">{progress}%</span>
                        </div>
                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-indigo-500 rounded-full transition-all duration-500"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-2 text-center text-xs">
                        <div className="bg-slate-50 rounded p-1.5 border border-slate-100">
                          <div className="font-bold text-slate-700">{totalTasks}</div>
                          <div className="text-[10px] text-slate-500 uppercase tracking-wider">Total</div>
                        </div>
                        <div className="bg-emerald-50 rounded p-1.5 border border-emerald-100">
                          <div className="font-bold text-emerald-700">{completedTasks}</div>
                          <div className="text-[10px] text-emerald-600 uppercase tracking-wider flex items-center justify-center gap-1"><CheckCircle2 className="w-3 h-3"/> Done</div>
                        </div>
                        <div className="bg-blue-50 rounded p-1.5 border border-blue-100">
                          <div className="font-bold text-blue-700">{openTasks}</div>
                          <div className="text-[10px] text-blue-600 uppercase tracking-wider flex items-center justify-center gap-1"><Circle className="w-3 h-3"/> Open</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-xs text-slate-500 pt-3 border-t border-slate-100">
                        <div className="flex items-center gap-1.5 font-medium">
                          <Calendar className="w-3.5 h-3.5" />
                          {formatDate(sprint.start_date)} - {formatDate(sprint.end_date)}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
