import { createClient } from "@/lib/supabase/server";
import { ProjectCard } from "@/components/projects/ProjectCard";
import { AddProjectDialog } from "@/components/projects/AddProjectDialog";
import { ProjectFilters } from "@/components/projects/ProjectFilters";
import { mockDb } from "@/lib/mock-db";
import { Project } from "@/types/project";
import { Briefcase, PlayCircle, PauseCircle, CheckCircle, AlertTriangle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

function SummaryCard({ title, value, icon: Icon, colorClass }: { title: string, value: number, icon: React.ElementType, colorClass: string }) {
  return (
    <Card className="border-slate-200/60 shadow-sm">
      <CardContent className="p-6 flex items-center gap-4">
        <div className={`p-3 rounded-xl ${colorClass}`}>
          <Icon className="w-6 h-6" />
        </div>
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="text-2xl font-bold text-slate-900">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

export default async function ProjectsRegistry({ searchParams }: { searchParams: { tab?: string, q?: string, status?: string, health?: string, sort?: string } }) {
  let allProjects: Project[] = [];
  let isMocked = false;

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    allProjects = mockDb.getProjects();
    isMocked = true;
  } else {
    const supabase = createClient();
    const { data, error } = await supabase.from('projects').select('*, users(full_name)').order('created_at', { ascending: true });
    if (error) {
      console.error("Error fetching projects:", error);
      allProjects = mockDb.getProjects();
      isMocked = true;
    } else {
      allProjects = data as Project[];
    }
  }

  const isArchivedTab = searchParams.tab === 'archived';
  let projects = allProjects.filter(p => isArchivedTab ? p.status === 'ARCHIVED' : p.status !== 'ARCHIVED');

  // Search
  if (searchParams.q) {
    const q = searchParams.q.toLowerCase();
    projects = projects.filter(p => 
      p.project_name.toLowerCase().includes(q) || 
      p.project_code.toLowerCase().includes(q)
    );
  }

  // Filter
  if (searchParams.status && searchParams.status !== 'ALL') {
    projects = projects.filter(p => p.status === searchParams.status);
  }
  if (searchParams.health && searchParams.health !== 'ALL') {
    projects = projects.filter(p => p.health === searchParams.health);
  }

  // Sort
  const sort = searchParams.sort || 'updated_desc';
  projects.sort((a, b) => {
    switch (sort) {
      case 'name_asc': return a.project_name.localeCompare(b.project_name);
      case 'name_desc': return b.project_name.localeCompare(a.project_name);
      case 'status_asc': return a.status.localeCompare(b.status);
      case 'health_asc': return a.health.localeCompare(b.health);
      case 'updated_desc': default:
        const dateA = new Date(a.last_updated_at || a.updated_at).getTime();
        const dateB = new Date(b.last_updated_at || b.updated_at).getTime();
        return dateB - dateA;
    }
  });

  const totalProjects = allProjects.filter(p => p.status !== 'ARCHIVED').length;
  const activeProjects = allProjects.filter(p => p.status === 'ACTIVE').length;
  const onHoldProjects = allProjects.filter(p => p.status === 'ON_HOLD').length;
  const completedProjects = allProjects.filter(p => p.status === 'COMPLETED').length;
  const attentionCriticalProjects = allProjects.filter(p => (p.health === 'ATTENTION_REQUIRED' || p.health === 'CRITICAL') && p.status !== 'ARCHIVED').length;

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500 pb-10">
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-4">
            Project Registry
            <div className="flex bg-slate-100 rounded-lg p-1 text-sm font-medium">
              <a href="/" className={`px-3 py-1.5 rounded-md transition-colors ${!isArchivedTab ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}>Active</a>
              <a href="/?tab=archived" className={`px-3 py-1.5 rounded-md transition-colors ${isArchivedTab ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}>Archived</a>
            </div>
          </h1>
          <p className="text-slate-500 mt-2 flex items-center gap-2">
            Manage and monitor independent software projects
            {isMocked && (
              <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">
                Local Mock Mode
              </span>
            )}
          </p>
        </div>
        <AddProjectDialog />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <SummaryCard title="Total Projects" value={totalProjects} icon={Briefcase} colorClass="bg-indigo-50 text-indigo-600" />
        <SummaryCard title="Active" value={activeProjects} icon={PlayCircle} colorClass="bg-emerald-50 text-emerald-600" />
        <SummaryCard title="On Hold" value={onHoldProjects} icon={PauseCircle} colorClass="bg-amber-50 text-amber-600" />
        <SummaryCard title="Completed" value={completedProjects} icon={CheckCircle} colorClass="bg-slate-100 text-slate-600" />
        <SummaryCard title="Attention / Critical" value={attentionCriticalProjects} icon={AlertTriangle} colorClass="bg-rose-50 text-rose-600" />
      </div>

      <ProjectFilters />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {projects.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>
    </div>
  );
}
