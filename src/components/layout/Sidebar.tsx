import Link from "next/link";
import { LayoutDashboard, Target } from "lucide-react";

export function Sidebar() {
  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col h-screen sticky top-0 border-r border-slate-800">
      <div className="h-16 flex items-center px-6 border-b border-slate-800">
        <span className="font-bold text-xl text-white tracking-tight flex items-center gap-2">
          <Target className="w-6 h-6 text-indigo-500" />
          AIPM
        </span>
      </div>
      <nav className="flex-1 py-6 px-4 space-y-2">
        <Link href="/" className="flex items-center gap-3 px-3 py-2 text-white bg-indigo-600/10 rounded-md transition-colors hover:bg-indigo-600/20">
          <LayoutDashboard className="w-5 h-5 text-indigo-400" />
          <span className="font-medium">Projects</span>
        </Link>
        {/* Temporarily hidden until Global Views are implemented
        <Link href="#" className="flex items-center gap-3 px-3 py-2 rounded-md transition-colors hover:bg-slate-800 hover:text-white">
          <Activity className="w-5 h-5" />
          <span className="font-medium">Sprints</span>
        </Link>
        <Link href="#" className="flex items-center gap-3 px-3 py-2 rounded-md transition-colors hover:bg-slate-800 hover:text-white">
          <GitBranch className="w-5 h-5" />
          <span className="font-medium">Releases</span>
        </Link>
        <Link href="#" className="flex items-center gap-3 px-3 py-2 rounded-md transition-colors hover:bg-slate-800 hover:text-white">
          <Users className="w-5 h-5" />
          <span className="font-medium">Teams</span>
        </Link>
        */}
      </nav>
      <div className="p-4 border-t border-slate-800">
        {/* 
        <Link href="#" className="flex items-center gap-3 px-3 py-2 rounded-md transition-colors hover:bg-slate-800 hover:text-white">
          <Settings className="w-5 h-5" />
          <span className="font-medium">Settings</span>
        </Link>
        */}
      </div>
    </aside>
  );
}
