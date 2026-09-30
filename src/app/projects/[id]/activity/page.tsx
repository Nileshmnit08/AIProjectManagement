import { createClient } from "@/lib/supabase/server";
import { mockDb } from "@/lib/mock-db";
import { ActivityLog } from "@/types/project";
import { Card, CardContent } from "@/components/ui/card";
import { Activity, Clock } from "lucide-react";

export default async function ActivityPage({ params }: { params: { id: string } }) {
  let logs: ActivityLog[] = [];
  let error: string | null = null;

  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
      logs = mockDb.getActivityLogs(params.id);
    } else {
      const supabase = createClient();
      const { data, error: dbErr } = await supabase
        .from('activity_logs')
        .select('*')
        .eq('project_id', params.id)
        .order('created_at', { ascending: false });
        
      if (dbErr) throw dbErr;
      logs = data as ActivityLog[];
    }
  } catch {
    error = "Unable to load project activity.";
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

  const formatDateTime = (isoDate: string) => {
    return new Intl.DateTimeFormat('en-US', { 
      month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric' 
    }).format(new Date(isoDate));
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-slate-900">Project Activity</h2>
      </div>

      {logs.length === 0 ? (
        <Card className="border-dashed border-2 border-slate-200 bg-slate-50/50 shadow-none">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-4">
              <Activity className="w-6 h-6 text-slate-400" />
            </div>
            <h3 className="text-lg font-medium text-slate-900 mb-1">No activity recorded yet.</h3>
            <p className="text-slate-500 max-w-sm">
              Check back later to see a chronological history of changes, updates, and milestones.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="relative pl-6 border-l-2 border-slate-200 ml-4 space-y-8 pb-8">
          {logs.map((log) => (
            <div key={log.id} className="relative">
              {/* Timeline Dot */}
              <div className="absolute w-3 h-3 bg-indigo-500 rounded-full -left-[31px] top-1.5 ring-4 ring-white"></div>
              
              <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <p className="text-slate-900 text-sm">
                      <span className="font-semibold">{log.user_name}</span> {log.action}
                    </p>
                    {log.related_entity_type && (
                      <p className="text-xs text-slate-500 mt-1">
                        Related: {log.related_entity_type} {log.related_entity_id ? `(${log.related_entity_id.substring(0,8)}...)` : ''}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-slate-400 shrink-0">
                    <Clock className="w-3.5 h-3.5" />
                    {formatDateTime(log.created_at)}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
