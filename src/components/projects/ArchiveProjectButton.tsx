"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Archive } from "lucide-react";
import { archiveProject } from "@/actions/projects";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

export function ArchiveProjectButton({ projectId, isArchived }: { projectId: string, isArchived: boolean }) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  if (isArchived) return null;

  async function handleArchive() {
    if (!confirm("Are you sure you want to archive this project? It will be moved to the Archived view.")) return;
    
    setLoading(true);
    try {
      const result = await archiveProject(projectId);
      if (result.success) {
        toast({ title: "Success", description: result.message });
        router.push("/?tab=archived");
      } else {
        toast({ variant: "destructive", title: "Error", description: result.message || "Failed to archive." });
      }
    } catch {
      toast({ variant: "destructive", title: "Error", description: "An unexpected error occurred." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button variant="outline" className="flex items-center gap-2 text-rose-600 hover:text-rose-700 hover:bg-rose-50 border-rose-200" onClick={handleArchive} disabled={loading}>
      {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Archive className="w-4 h-4" />}
      Archive
    </Button>
  );
}
