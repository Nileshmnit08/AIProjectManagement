import { createClient } from "@/lib/supabase/server";
import { Project, ProjectHealth, ProjectStatus } from "@/types/project";
import { notFound } from "next/navigation";
import { FolderGit2, CheckCircle2, AlertCircle, Clock, CalendarClock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { EditProjectDialog } from "@/components/projects/EditProjectDialog";
import { ArchiveProjectButton } from "@/components/projects/ArchiveProjectButton";
import { mockDb } from "@/lib/mock-db";
import { ProjectTabs } from "@/components/projects/ProjectTabs";

export default async function ProjectLayout({ children, params }: { children: React.ReactNode, params: { id: string } }) {
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

      <ProjectTabs projectId={project.id} />

      <div className="pt-4">
        {children}
      </div>
    </div>
  );
}
