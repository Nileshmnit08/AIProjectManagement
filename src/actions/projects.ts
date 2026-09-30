"use server";

import { createClient } from "@/lib/supabase/server";
import { Project, ProjectHealth, ProjectStatus } from "@/types/project";
import { revalidatePath } from "next/cache";
import { mockDb } from "@/lib/mock-db";

export type ActionState = {
  success: boolean;
  message?: string;
  errors?: Record<string, string[]>;
};

export async function createProject(prevState: ActionState, formData: FormData): Promise<ActionState> {
  const name = formData.get("project_name") as string;
  const code = formData.get("project_code") as string;
  const status = formData.get("status") as ProjectStatus;
  const health = formData.get("health") as ProjectHealth;
  
  const repo = formData.get("repository_url") as string;
  const live = formData.get("live_url") as string;
  
  const startDate = formData.get("start_date") as string;
  const targetDate = formData.get("target_date") as string;

  const errors: Record<string, string[]> = {};

  if (!name || name.trim().length === 0) {
    errors.project_name = ["Project Name is required."];
  }
  
  if (!code || code.trim().length === 0) {
    errors.project_code = ["Project Code is required."];
  }
  
  if (repo && repo.trim().length > 0) {
    try { new URL(repo); } catch { errors.repository_url = ["Must be a valid URL."]; }
  }
  
  if (live && live.trim().length > 0) {
    try { new URL(live); } catch { errors.live_url = ["Must be a valid URL."]; }
  }
  
  if (startDate && targetDate) {
    if (new Date(startDate) > new Date(targetDate)) {
      errors.target_date = ["Target date must be after start date."];
    }
  }

  // Duplicate Code check
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    if (mockDb.getProjects().some(p => p.project_code.toUpperCase() === code.toUpperCase())) {
      errors.project_code = ["Project Code must be unique."];
    }
  } else {
    const supabase = createClient();
    const { count } = await supabase.from('projects')
      .select('*', { count: 'exact', head: true })
      .ilike('project_code', code);
    if (count && count > 0) {
      errors.project_code = ["Project Code must be unique."];
    }
  }

  if (Object.keys(errors).length > 0) {
    return { success: false, errors, message: "Please fix the errors in the form." };
  }

  const newProject: Partial<Project> = {
    project_name: name,
    project_code: code.toUpperCase(),
    status,
    health,
    description: (formData.get("description") as string) || null,
    project_type: (formData.get("project_type") as string) || null,
    owner: (formData.get("owner") as string) || null,
    current_phase: (formData.get("current_phase") as string) || null,
    current_sprint: (formData.get("current_sprint") as string) || null,
    current_version: (formData.get("current_version") as string) || null,
    start_date: startDate || null,
    target_date: targetDate || null,
    repository_url: repo || null,
    live_url: live || null,
    notes: (formData.get("notes") as string) || null,
  };

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    mockDb.addProject({
      ...newProject,
      id: Math.random().toString(36).substr(2, 9),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      last_updated_at: new Date().toISOString(),
    } as Project);
  } else {
    const supabase = createClient();
    // @ts-expect-error: Mocked supabase types conflict with generated SDK types until actual CLI types are generated.
    const { error } = await supabase.from('projects').insert([newProject]);
    if (error) {
      return { success: false, message: error.message };
    }
  }

  revalidatePath("/");
  return { success: true, message: "Project created successfully." };
}

export async function updateProject(id: string, prevState: ActionState, formData: FormData): Promise<ActionState> {
  const name = formData.get("project_name") as string;
  const code = formData.get("project_code") as string;
  const status = formData.get("status") as ProjectStatus;
  const health = formData.get("health") as ProjectHealth;
  
  const repo = formData.get("repository_url") as string;
  const live = formData.get("live_url") as string;
  
  const startDate = formData.get("start_date") as string;
  const targetDate = formData.get("target_date") as string;

  const errors: Record<string, string[]> = {};

  if (!name || name.trim().length === 0) {
    errors.project_name = ["Project Name is required."];
  }
  
  if (!code || code.trim().length === 0) {
    errors.project_code = ["Project Code is required."];
  }
  
  if (repo && repo.trim().length > 0) {
    try { new URL(repo); } catch { errors.repository_url = ["Must be a valid URL."]; }
  }
  
  if (live && live.trim().length > 0) {
    try { new URL(live); } catch { errors.live_url = ["Must be a valid URL."]; }
  }
  
  if (startDate && targetDate) {
    if (new Date(startDate) > new Date(targetDate)) {
      errors.target_date = ["Target date must be after start date."];
    }
  }

  // Duplicate Code check (only if code changed, but here we just check if it conflicts with another project)
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    if (mockDb.getProjects().some(p => p.project_code.toUpperCase() === code.toUpperCase() && p.id !== id)) {
      errors.project_code = ["Project Code must be unique."];
    }
  } else {
    const supabase = createClient();
    const { count } = await supabase.from('projects')
      .select('id', { count: 'exact', head: true })
      .ilike('project_code', code)
      .neq('id', id);
    if (count && count > 0) {
      errors.project_code = ["Project Code must be unique."];
    }
  }

  if (Object.keys(errors).length > 0) {
    return { success: false, errors, message: "Please fix the errors in the form." };
  }

  const updates: Partial<Project> = {
    project_name: name,
    project_code: code.toUpperCase(),
    status,
    health,
    description: (formData.get("description") as string) || null,
    project_type: (formData.get("project_type") as string) || null,
    owner: (formData.get("owner") as string) || null,
    current_phase: (formData.get("current_phase") as string) || null,
    current_sprint: (formData.get("current_sprint") as string) || null,
    current_version: (formData.get("current_version") as string) || null,
    start_date: startDate || null,
    target_date: targetDate || null,
    repository_url: repo || null,
    live_url: live || null,
    notes: (formData.get("notes") as string) || null,
  };

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    mockDb.updateProject(id, updates);
  } else {
    const supabase = createClient();
    // @ts-expect-error: mock types
    const { error } = await supabase.from('projects').update(updates).eq('id', id);
    if (error) {
      return { success: false, message: error.message };
    }
  }

  revalidatePath("/");
  revalidatePath(`/projects/${id}`);
  return { success: true, message: "Project updated successfully." };
}

export async function archiveProject(id: string): Promise<ActionState> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    mockDb.archiveProject(id);
  } else {
    const supabase = createClient();
    // @ts-expect-error: mock types
    const { error } = await supabase.from('projects').update({ status: 'ARCHIVED' }).eq('id', id);
    if (error) {
      return { success: false, message: error.message };
    }
  }

  revalidatePath("/");
  revalidatePath(`/projects/${id}`);
  return { success: true, message: "Project archived successfully." };
}
