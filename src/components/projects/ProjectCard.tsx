import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Project, ProjectHealth, ProjectStatus } from "@/types/project";
import { Activity, AlertCircle, CheckCircle2, Clock, FolderGit2, User, Milestone, Tag, CalendarClock } from "lucide-react";

import Link from "next/link";

export function ProjectCard({ project }: { project: Project }) {
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

  const formatLastUpdated = (isoDate: string | null) => {
    if (!isoDate) return "Unknown";
    const date = new Date(isoDate);
    return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(date);
  };

  return (
    <Link href={`/projects/${project.id}`} className="block">
      <Card className="flex flex-col h-full hover:shadow-md hover:border-indigo-200 transition-all duration-200 border-slate-200/60 bg-white group">
        <CardHeader className="pb-3 border-b border-slate-100 group-hover:bg-slate-50/50 transition-colors">
        <div className="flex justify-between items-start gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center shrink-0">
              <FolderGit2 className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold text-slate-900 leading-none mb-1.5">
                {project.project_name}
              </CardTitle>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-slate-500 tracking-wider bg-slate-100 px-1.5 py-0.5 rounded">
                  {project.project_code}
                </span>
              </div>
            </div>
          </div>
          <Badge variant="outline" className={`px-2.5 py-0.5 text-xs font-semibold ${getStatusColor(project.status)} shrink-0`}>
            {project.status}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 py-4 space-y-4">
        {/* Secondary Info Row */}
        <div className="grid grid-cols-2 gap-3 text-sm text-slate-600">
          <div className="flex items-center gap-2">
            <Milestone className="w-4 h-4 text-slate-400 shrink-0" />
            <span className="truncate" title={project.current_phase || "No phase"}>
              Phase: <span className="font-medium text-slate-900">{project.current_phase || "--"}</span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-slate-400 shrink-0" />
            <span className="truncate" title={project.current_sprint || "No sprint"}>
              Sprint: <span className="font-medium text-slate-900">{project.current_sprint || "--"}</span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Tag className="w-4 h-4 text-slate-400 shrink-0" />
            <span className="truncate" title={project.current_version || "No version"}>
              Version: <span className="font-medium text-slate-900">{project.current_version || "--"}</span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-slate-400 shrink-0" />
            <span className="truncate" title={project.owner || "Unassigned"}>
              Owner: <span className="font-medium text-slate-900">{project.owner || "Unassigned"}</span>
            </span>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="pt-3 pb-3 border-t border-slate-100 bg-slate-50/50 rounded-b-lg flex items-center justify-between gap-4">
        <div className="flex items-center gap-1.5 bg-white px-2.5 py-1.5 rounded-md border border-slate-200 shadow-sm shrink-0">
          {getHealthIcon(project.health)}
          <span className="text-xs">{getHealthText(project.health)}</span>
        </div>
        
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <CalendarClock className="w-3.5 h-3.5 text-slate-400" />
          <span>Updated: {formatLastUpdated(project.last_updated_at || project.updated_at)}</span>
        </div>
      </CardFooter>
    </Card>
    </Link>
  );
}
