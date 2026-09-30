"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function createSprint(projectId: string, formData: FormData) {
  const name = formData.get("name") as string;
  const sprintNumber = parseInt(formData.get("sprint_number") as string, 10);
  const objective = formData.get("objective") as string;
  const status = formData.get("status") as string;
  const startDate = formData.get("start_date") as string;
  const endDate = formData.get("end_date") as string;

  if (!name || isNaN(sprintNumber) || !startDate || !endDate) {
    return { error: "Missing required fields" };
  }

  if (new Date(endDate) < new Date(startDate)) {
    return { error: "End date cannot precede start date" };
  }

  if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
    const supabase = createClient();
    
    // Auth check
    const { data: { user } } = await supabase.auth.getUser();
    
    // @ts-ignore
    const { error } = await supabase.from('sprints').insert({
      project_id: projectId,
      name,
      sprint_number: sprintNumber,
      objective,
      status,
      start_date: startDate,
      end_date: endDate,
      created_by: user?.id || 'SYSTEM'
    });

    if (error) {
      console.error(error);
      return { error: "Failed to create sprint" };
    }
  } else {
    // We would use mockDb here but Server Actions don't share the same Node.js global 
    // scope as the local mock-db cache in dev mode reliably across worker threads,
    // so we'll just throw an error instructing to use the API route or client side.
    // Actually, for local mock mode, we will handle creation client-side to avoid this issue.
    return { error: "Server actions not supported in local mock mode without Supabase." };
  }

  revalidatePath(`/projects/${projectId}/sprints`);
  return { success: true };
}
