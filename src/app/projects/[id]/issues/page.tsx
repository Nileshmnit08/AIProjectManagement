import { createClient } from "@/lib/supabase/server";
import { mockDb } from "@/lib/mock-db";
import { Issue } from "@/types/project";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Bug, Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default async function IssuesPage({ params }: { params: { id: string } }) {
  let issues: Issue[] = [];
  let error: string | null = null;

  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
      issues = mockDb.getIssues(params.id);
    } else {
      const supabase = createClient();
      const { data, error: dbErr } = await supabase
        .from('issues')
        .select('*')
        .eq('project_id', params.id)
        .order('created_at', { ascending: false });
        
      if (dbErr) throw dbErr;
      issues = data as Issue[];
    }
  } catch {
    error = "Unable to load project issues.";
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
      case 'OPEN': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'IN_PROGRESS': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'RESOLVED': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'CLOSED': return 'bg-slate-100 text-slate-800 border-slate-200';
      case 'BLOCKED': return 'bg-rose-100 text-rose-800 border-rose-200';
      default: return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'CRITICAL': return 'text-rose-600 bg-rose-50 border-rose-200 border';
      case 'HIGH': return 'text-orange-600 bg-orange-50 border-orange-200 border';
      case 'MEDIUM': return 'text-amber-600 bg-amber-50 border-amber-200 border';
      case 'LOW': return 'text-slate-600 bg-slate-50 border-slate-200 border';
      default: return 'text-slate-600 bg-slate-50 border-slate-200 border';
    }
  };

  const formatDate = (isoDate: string | null) => {
    if (!isoDate) return "--";
    return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(isoDate));
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-slate-900">Issues & Bugs</h2>
        <Button className="bg-indigo-600 hover:bg-indigo-700">
          <Plus className="w-4 h-4 mr-2" />
          Report Issue
        </Button>
      </div>

      {issues.length > 0 && (
        <div className="flex gap-4 items-center">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search issues..." 
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>
          <Button variant="outline" className="gap-2">
            <Filter className="w-4 h-4" />
            Filter
          </Button>
        </div>
      )}

      {issues.length === 0 ? (
        <Card className="border-dashed border-2 border-slate-200 bg-slate-50/50 shadow-none">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-4">
              <Bug className="w-6 h-6 text-slate-400" />
            </div>
            <h3 className="text-lg font-medium text-slate-900 mb-1">No issues reported for this project.</h3>
            <p className="text-slate-500 mb-4 max-w-sm">
              Track bugs, defects, and blockers separately from your regular project tasks.
            </p>
            <Button variant="outline">Report an issue</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="border border-slate-200 rounded-lg overflow-hidden bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 font-medium">
                <tr>
                  <th className="px-4 py-3">Issue Title</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Severity</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Assignee</th>
                  <th className="px-4 py-3">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {issues.map((issue) => (
                  <tr key={issue.id} className="hover:bg-slate-50/50 transition-colors group cursor-pointer">
                    <td className="px-4 py-3 font-medium text-slate-900 group-hover:text-indigo-600 transition-colors">
                      {issue.title}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                        {issue.type}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${getSeverityColor(issue.severity)}`}>
                        {issue.severity}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="outline" className={`text-[10px] ${getStatusColor(issue.status)}`}>
                        {issue.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {issue.assignee || <span className="text-slate-400 italic">Unassigned</span>}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {formatDate(issue.created_at)}
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
