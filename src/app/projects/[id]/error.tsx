"use client";
import { ErrorState } from "@/components/ui/ErrorState";
import { useEffect } from "react";

export default function ProjectDetailError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return <ErrorState message="Failed to load project details." onRetry={reset} />
}
