"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Loader2 } from "lucide-react";
import { createProject } from "@/actions/projects";
import { useToast } from "@/hooks/use-toast";

export function AddProjectDialog() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const { toast } = useToast();

  async function onSubmit(formData: FormData) {
    setLoading(true);
    setErrors({});
    
    try {
      const result = await createProject({ success: false }, formData);
      
      if (result.success) {
        toast({ title: "Success", description: result.message });
        setOpen(false);
      } else {
        if (result.errors) setErrors(result.errors);
        if (result.message) toast({ variant: "destructive", title: "Error", description: result.message });
      }
    } catch {
      toast({ variant: "destructive", title: "Error", description: "An unexpected error occurred." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add Project
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Project</DialogTitle>
          <DialogDescription>
            Create a new project in the registry. Fill out the core information below.
          </DialogDescription>
        </DialogHeader>

        <form action={onSubmit} className="space-y-6 pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="project_name">Project Name *</Label>
              <Input id="project_name" name="project_name" placeholder="e.g. Apollo Portal" />
              {errors.project_name && <p className="text-sm text-red-500">{errors.project_name[0]}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="project_code">Project Code *</Label>
              <Input id="project_code" name="project_code" placeholder="e.g. APOLLO" className="uppercase" />
              {errors.project_code && <p className="text-sm text-red-500">{errors.project_code[0]}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" name="description" placeholder="Brief summary of the project..." />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status">Status *</Label>
              <Select name="status" defaultValue="PLANNING">
                <SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="PLANNING">Planning</SelectItem>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="ON_HOLD">On Hold</SelectItem>
                  <SelectItem value="COMPLETED">Completed</SelectItem>
                  <SelectItem value="ARCHIVED">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="health">Health *</Label>
              <Select name="health" defaultValue="NOT_STARTED">
                <SelectTrigger><SelectValue placeholder="Select health" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="NOT_STARTED">Not Started</SelectItem>
                  <SelectItem value="HEALTHY">Healthy</SelectItem>
                  <SelectItem value="ATTENTION_REQUIRED">Attention Required</SelectItem>
                  <SelectItem value="CRITICAL">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="project_type">Project Type</Label>
              <Input id="project_type" name="project_type" placeholder="e.g. Web App" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="owner">Owner</Label>
              <Input id="owner" name="owner" placeholder="e.g. Jane Doe" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="current_phase">Current Phase</Label>
              <Input id="current_phase" name="current_phase" placeholder="e.g. Discovery" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="current_sprint">Current Sprint</Label>
              <Input id="current_sprint" name="current_sprint" placeholder="e.g. Sprint 1" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="current_version">Current Version</Label>
              <Input id="current_version" name="current_version" placeholder="e.g. v1.0" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start_date">Start Date</Label>
              <Input id="start_date" name="start_date" type="date" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="target_date">Target Date</Label>
              <Input id="target_date" name="target_date" type="date" />
              {errors.target_date && <p className="text-sm text-red-500">{errors.target_date[0]}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="repository_url">Repository URL</Label>
              <Input id="repository_url" name="repository_url" type="url" placeholder="https://github.com/..." />
              {errors.repository_url && <p className="text-sm text-red-500">{errors.repository_url[0]}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="live_url">Live URL</Label>
              <Input id="live_url" name="live_url" type="url" placeholder="https://..." />
              {errors.live_url && <p className="text-sm text-red-500">{errors.live_url[0]}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" name="notes" placeholder="Any additional context..." />
          </div>

          <div className="flex justify-end gap-3 border-t pt-4">
            <Button variant="outline" type="button" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={loading} className="bg-indigo-600 hover:bg-indigo-700">
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Create Project
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
