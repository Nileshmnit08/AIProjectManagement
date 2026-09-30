"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from "lucide-react";
import { useTransition } from "react";

export function ProjectFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  const updateParams = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== "ALL") {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    
    startTransition(() => {
      router.push(`/?${params.toString()}`);
    });
  };

  return (
    <div className="flex flex-col md:flex-row gap-4 bg-white p-4 rounded-xl border border-slate-200/60 shadow-sm mb-6">
      
      {/* Search */}
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <Input 
          placeholder="Search projects..." 
          className="pl-9" 
          defaultValue={searchParams.get("q") || ""}
          onChange={(e) => {
            // Simple debounce can be added here, but direct works for small datasets
            const val = e.target.value;
            const params = new URLSearchParams(searchParams.toString());
            if (val) params.set("q", val);
            else params.delete("q");
            startTransition(() => router.push(`/?${params.toString()}`));
          }}
        />
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <Select defaultValue={searchParams.get("status") || "ALL"} onValueChange={(v) => updateParams("status", v)}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Status</SelectItem>
            <SelectItem value="PLANNING">Planning</SelectItem>
            <SelectItem value="ACTIVE">Active</SelectItem>
            <SelectItem value="ON_HOLD">On Hold</SelectItem>
            <SelectItem value="COMPLETED">Completed</SelectItem>
          </SelectContent>
        </Select>

        <Select defaultValue={searchParams.get("health") || "ALL"} onValueChange={(v) => updateParams("health", v)}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Health" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Health</SelectItem>
            <SelectItem value="NOT_STARTED">Not Started</SelectItem>
            <SelectItem value="HEALTHY">Healthy</SelectItem>
            <SelectItem value="ATTENTION_REQUIRED">Attention Req.</SelectItem>
            <SelectItem value="CRITICAL">Critical</SelectItem>
          </SelectContent>
        </Select>

        <Select defaultValue={searchParams.get("sort") || "updated_desc"} onValueChange={(v) => updateParams("sort", v)}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Sort By" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="updated_desc">Last Updated</SelectItem>
            <SelectItem value="name_asc">Name (A-Z)</SelectItem>
            <SelectItem value="name_desc">Name (Z-A)</SelectItem>
            <SelectItem value="status_asc">Status</SelectItem>
            <SelectItem value="health_asc">Health</SelectItem>
          </SelectContent>
        </Select>
      </div>

    </div>
  );
}
