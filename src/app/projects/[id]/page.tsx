import { createClient } from "@/lib/supabase/server";
import { Project } from "@/types/project";
import { notFound } from "next/navigation";
import { Activity, Tag, Milestone, User, GitBranch, Globe, Info, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { mockDb } from "@/lib/mock-db";

export default async function ProjectOverview({ params }: { params: { id: string } }) {
  let project: Project | null = null;

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    project = mockDb.getProject(params.id);
  } else {
    const supabase = createClient();
    const { data, error } = await supabase.from('projects').select('*').eq('id', params.id).single();
    if (error || !data) {
      project = mockDb.getProject(params.id);
    } else {
      project = data as Project;
    }
  }

  if (!project) {
    notFound();
  }

  const formatDate = (isoDate: string | null) => {
    if (!isoDate) return "--";
    return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(isoDate));
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in duration-300">
      
      {/* Main Column */}
      <div className="lg:col-span-2 space-y-6">
        <Card className="border-slate-200/60 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Info className="w-5 h-5 text-indigo-500" />
              Description
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-600 leading-relaxed">
              {project.description || "No description provided."}
            </p>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="border-slate-200/60 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-slate-500 uppercase tracking-wider font-semibold">Current State</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                <span className="flex items-center gap-2 text-slate-600"><Milestone className="w-4 h-4"/> Phase</span>
                <span className="font-medium text-slate-900">{project.current_phase || "--"}</span>
              </div>
              <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                <span className="flex items-center gap-2 text-slate-600"><Activity className="w-4 h-4"/> Sprint</span>
                <span className="font-medium text-slate-900">{project.current_sprint || "--"}</span>
              </div>
              <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                <span className="flex items-center gap-2 text-slate-600"><Tag className="w-4 h-4"/> Version</span>
                <span className="font-medium text-slate-900">{project.current_version || "--"}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200/60 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-slate-500 uppercase tracking-wider font-semibold">Timeline & Links</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                <span className="flex items-center gap-2 text-slate-600"><Calendar className="w-4 h-4"/> Start Date</span>
                <span className="font-medium text-slate-900">{formatDate(project.start_date)}</span>
              </div>
              <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                <span className="flex items-center gap-2 text-slate-600"><Calendar className="w-4 h-4"/> Target Date</span>
                <span className="font-medium text-slate-900">{formatDate(project.target_date)}</span>
              </div>
              <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                <span className="flex items-center gap-2 text-slate-600"><Globe className="w-4 h-4"/> Live URL</span>
                {project.live_url ? (
                  <a href={project.live_url} target="_blank" rel="noreferrer" className="font-medium text-indigo-600 hover:underline truncate max-w-[150px]">{project.live_url}</a>
                ) : <span className="font-medium text-slate-900">--</span>}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Sidebar Column */}
      <div className="space-y-6">
        <Card className="border-slate-200/60 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-slate-500 uppercase tracking-wider font-semibold">Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <span className="block text-xs text-slate-500 mb-1">Project Type</span>
              <div className="font-medium text-slate-900">{project.project_type || "--"}</div>
            </div>
            <div>
              <span className="block text-xs text-slate-500 mb-1">Owner</span>
              <div className="flex items-center gap-2 font-medium text-slate-900">
                <User className="w-4 h-4 text-slate-400" />
                {project.owner || "Unassigned"}
              </div>
            </div>
            <div>
              <span className="block text-xs text-slate-500 mb-1">Repository</span>
              <div className="flex items-center gap-2">
                <GitBranch className="w-4 h-4 text-slate-400" />
                {project.repository_url ? (
                  <a href={project.repository_url} target="_blank" rel="noreferrer" className="font-medium text-indigo-600 hover:underline truncate">
                    {project.repository_url.replace('https://github.com/', '')}
                  </a>
                ) : <span className="font-medium text-slate-900">--</span>}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200/60 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-slate-500 uppercase tracking-wider font-semibold">Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-600 whitespace-pre-wrap">
              {project.notes || "No additional notes."}
            </p>
          </CardContent>
        </Card>
      </div>
      
    </div>
  );
}
