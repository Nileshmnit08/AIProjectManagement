"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function createTask(projectId: string, formData: FormData) {
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const status = formData.get("status") as string;
  const priority = formData.get("priority") as string;
  const sprintId = formData.get("sprint_id") as string;
  const assigneeId = formData.get("assignee_id") as string;
  const dueDate = formData.get("due_date") as string;

  if (!title || !status || !priority) {
    return { error: "Missing required fields" };
  }

  if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    // @ts-ignore
    const { error } = await supabase.from('tasks').insert({
      project_id: projectId,
      title,
      description: description || null,
      status,
      priority,
      sprint_id: sprintId || null,
      assignee_id: assigneeId || null,
      due_date: dueDate || null,
      created_by: user?.id || 'SYSTEM'
    });

    if (error) {
      console.error(error);
      return { error: "Failed to create task" };
    }
  } else {
    return { error: "Server actions not supported in local mock mode." };
  }

  revalidatePath(`/projects/${projectId}/tasks`);
  revalidatePath(`/projects/${projectId}/sprints`);
  if (sprintId) {
    revalidatePath(`/projects/${projectId}/sprints/${sprintId}`);
  }
  
  return { success: true };
}
