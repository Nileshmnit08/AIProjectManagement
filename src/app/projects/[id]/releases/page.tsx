import { createClient } from "@/lib/supabase/server";
import { mockDb } from "@/lib/mock-db";
import { Release } from "@/types/project";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Rocket, Tag, Calendar, LayoutList } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default async function ReleasesPage({ params }: { params: { id: string } }) {
  let releases: Release[] = [];
  let error: string | null = null;

  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
      releases = mockDb.getReleases(params.id);
    } else {
      const supabase = createClient();
      const { data, error: dbErr } = await supabase
        .from('releases')
        .select('*')
        .eq('project_id', params.id)
        .order('created_at', { ascending: false });
        
      if (dbErr) throw dbErr;
      releases = data as Release[];
    }
  } catch {
    error = "Unable to load project releases.";
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
      case 'RELEASED': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'IN_PROGRESS': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'PLANNED': return 'bg-slate-100 text-slate-800 border-slate-200';
      case 'ROLLED_BACK': return 'bg-rose-100 text-rose-800 border-rose-200';
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
        <h2 className="text-xl font-semibold text-slate-900">Releases</h2>
        <Button className="bg-indigo-600 hover:bg-indigo-700">
          <Plus className="w-4 h-4 mr-2" />
          Create Release
        </Button>
      </div>

      {releases.length === 0 ? (
        <Card className="border-dashed border-2 border-slate-200 bg-slate-50/50 shadow-none">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-4">
              <Rocket className="w-6 h-6 text-slate-400" />
            </div>
            <h3 className="text-lg font-medium text-slate-900 mb-1">No releases recorded yet.</h3>
            <p className="text-slate-500 mb-4 max-w-sm">
              Track versions, deployments, and release notes for your project environments.
            </p>
            <Button variant="outline">Draft a release</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {releases.map(release => (
            <Card key={release.id} className="border-slate-200 shadow-sm overflow-hidden">
              <div className="border-b border-slate-100 bg-slate-50/50 p-4 flex justify-between items-start md:items-center flex-col md:flex-row gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-100 rounded text-indigo-700">
                    <Tag className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 flex items-center gap-2">
                      {release.release_name}
                      <span className="font-mono text-sm text-slate-500 bg-slate-200 px-1.5 py-0.5 rounded">{release.version}</span>
                    </h3>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-sm text-slate-500 flex items-center gap-1.5 bg-white px-2 py-1 rounded border border-slate-200">
                    <Calendar className="w-3.5 h-3.5" />
                    {formatDate(release.release_date)}
                  </div>
                  <Badge variant="outline" className={`text-xs ${getStatusColor(release.status)}`}>
                    {release.status}
                  </Badge>
                </div>
              </div>
              <CardContent className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="md:col-span-2 space-y-3">
                    <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                      <LayoutList className="w-3.5 h-3.5" />
                      Release Notes
                    </h4>
                    <p className="text-sm text-slate-700 whitespace-pre-wrap">
                      {release.release_notes || "No release notes provided."}
                    </p>
                  </div>
                  <div className="space-y-4 border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-6">
                    <div>
                      <span className="block text-xs text-slate-500 mb-1">Environment</span>
                      <span className="text-sm font-medium text-slate-900">{release.environment || "--"}</span>
                    </div>
                    <div>
                      <span className="block text-xs text-slate-500 mb-1">Build Number</span>
                      <span className="text-sm font-mono text-slate-900">{release.build_number || "--"}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
