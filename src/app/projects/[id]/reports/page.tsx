import { createClient } from "@/lib/supabase/server";
import { mockDb } from "@/lib/mock-db";
import { Card, CardContent } from "@/components/ui/card";
import { BarChart3 } from "lucide-react";

export default async function ReportsPage({ params }: { params: { id: string } }) {
  // Try to fetch at least ONE Task or Sprint to see if there's enough data for reporting
  let hasData = false;
  let error: string | null = null;

  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
      const tasks = mockDb.getTasks(params.id);
      const issues = mockDb.getIssues(params.id);
      hasData = tasks.length > 0 || issues.length > 0;
    } else {
      const supabase = createClient();
      const { data, error: dbErr } = await supabase
        .from('tasks')
        .select('id')
        .eq('project_id', params.id)
        .limit(1);
        
      if (dbErr) throw dbErr;
      hasData = data && data.length > 0;
    }
  } catch {
    error = "Unable to load project data for reports.";
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

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-slate-900">Project Reports</h2>
      </div>

      {!hasData ? (
        <Card className="border-dashed border-2 border-slate-200 bg-slate-50/50 shadow-none">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-4">
              <BarChart3 className="w-6 h-6 text-slate-400" />
            </div>
            <h3 className="text-lg font-medium text-slate-900 mb-1">Not enough data to generate this report.</h3>
            <p className="text-slate-500 max-w-sm">
              Reporting requires active sprints, tasks, and issues to calculate meaningful metrics.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="py-12 text-center text-slate-500">
            Report generation logic will render charts and statistics here based on the database content.
          </CardContent>
        </Card>
      )}
    </div>
  );
}
