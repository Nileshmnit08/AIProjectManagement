import { createClient } from "@/lib/supabase/server";
import { Project, ProjectHealth, ProjectStatus } from "@/types/project";
import { notFound } from "next/navigation";
import { 
  FolderGit2, CheckCircle2, AlertCircle, Clock, Calendar, GitBranch, Globe, 
  Activity, Tag, Milestone, User, CalendarClock, Info
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { EditProjectDialog } from "@/components/projects/EditProjectDialog";
import { ArchiveProjectButton } from "@/components/projects/ArchiveProjectButton";
import { mockDb } from "@/lib/mock-db";



export default async function ProjectDetail({ params }: { params: { id: string } }) {
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

  const getStatusColor = (status: ProjectStatus) => {
    switch (status) {
      case 'ACTIVE': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'PLANNING': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'ON_HOLD': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'COMPLETED': return 'bg-slate-100 text-slate-800 border-slate-200';
      case 'ARCHIVED': return 'bg-slate-100 text-slate-500 border-slate-200';
      default: return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  const getHealthIcon = (health: ProjectHealth) => {
    switch (health) {
      case 'HEALTHY': return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
      case 'ATTENTION_REQUIRED': return <AlertCircle className="w-4 h-4 text-amber-500" />;
      case 'CRITICAL': return <AlertCircle className="w-4 h-4 text-rose-600" />;
      case 'NOT_STARTED': return <Clock className="w-4 h-4 text-slate-400" />;
      default: return null;
    }
  };

  const getHealthText = (health: ProjectHealth) => {
    switch (health) {
      case 'HEALTHY': return <span className="text-emerald-700 font-medium">Healthy</span>;
      case 'ATTENTION_REQUIRED': return <span className="text-amber-600 font-medium">Attention Required</span>;
      case 'CRITICAL': return <span className="text-rose-700 font-medium">Critical</span>;
      case 'NOT_STARTED': return <span className="text-slate-500 font-medium">Not Started</span>;
      default: return null;
    }
  };

  const formatDate = (isoDate: string | null) => {
    if (!isoDate) return "--";
    return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(isoDate));
  };

  const NAV_ITEMS = ["Overview", "Sprints", "Tasks", "Issues", "Team", "Releases", "Activity", "Reports"];

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500 pb-10">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center shrink-0">
            <FolderGit2 className="w-6 h-6 text-indigo-600" />
          </div>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-3xl font-bold tracking-tight text-slate-900">{project.project_name}</h1>
              <Badge variant="outline" className={`px-2.5 py-0.5 text-xs font-semibold ${getStatusColor(project.status)}`}>
                {project.status}
              </Badge>
            </div>
            <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
              <span className="font-mono bg-slate-100 px-2 py-0.5 rounded text-slate-600">{project.project_code}</span>
              <span className="flex items-center gap-1.5">
                {getHealthIcon(project.health)}
                {getHealthText(project.health)}
              </span>
              <span className="flex items-center gap-1.5">
                <CalendarClock className="w-4 h-4" />
                Updated {formatDate(project.last_updated_at || project.updated_at)}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <EditProjectDialog project={project} />
          <ArchiveProjectButton projectId={project.id} isArchived={project.status === 'ARCHIVED'} />
        </div>
      </div>

      {/* Navigation Foundation */}
      <div className="border-b border-slate-200">
        <nav className="flex space-x-8 overflow-x-auto" aria-label="Tabs">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item}
              href="#"
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors
                ${item === "Overview" 
                  ? "border-indigo-500 text-indigo-600" 
                  : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
                }`}
            >
              {item}
            </Link>
          ))}
        </nav>
      </div>

      {/* Overview Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
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
    </div>
  );
}
