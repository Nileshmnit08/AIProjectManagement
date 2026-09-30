"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { label: "Overview", path: "" },
  { label: "Sprints", path: "/sprints" },
  { label: "Tasks", path: "/tasks" },
  { label: "Issues", path: "/issues" },
  { label: "Team", path: "/team" },
  { label: "Releases", path: "/releases" },
  { label: "Activity", path: "/activity" },
  { label: "Reports", path: "/reports" },
];

export function ProjectTabs({ projectId }: { projectId: string }) {
  const pathname = usePathname();
  const basePath = `/projects/${projectId}`;

  return (
    <div className="border-b border-slate-200 mt-6">
      <nav className="flex space-x-8 overflow-x-auto" aria-label="Tabs">
        {NAV_ITEMS.map((item) => {
          const href = `${basePath}${item.path}`;
          // Overview is exact match, others match start
          const isActive = item.path === "" 
            ? pathname === basePath 
            : pathname.startsWith(href);

          return (
            <Link
              key={item.label}
              href={href}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors
                ${isActive 
                  ? "border-indigo-500 text-indigo-600" 
                  : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
                }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
