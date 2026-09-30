import { Bell, Search, User } from "lucide-react";

export function Header() {
  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-10 shadow-sm">
      <div className="flex items-center gap-2 w-full max-w-md bg-slate-100 rounded-md px-3 py-2 border border-slate-200 focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-500 transition-all">
        <Search className="w-4 h-4 text-slate-400" />
        <input 
          type="text" 
          placeholder="Search projects, tasks..." 
          className="bg-transparent border-none outline-none w-full text-sm text-slate-700 placeholder:text-slate-400"
        />
      </div>
      
      <div className="flex items-center gap-4">
        <button className="relative p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
        </button>
        <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center border border-indigo-200 cursor-pointer">
          <User className="w-4 h-4 text-indigo-700" />
        </div>
      </div>
    </header>
  );
}
