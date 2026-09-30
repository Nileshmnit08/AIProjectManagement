"use client";

import { AlertTriangle, RefreshCcw } from "lucide-react";
import { Button } from "./button";

export function ErrorState({ message, onRetry }: { message: string, onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 animate-in fade-in duration-300">
      <div className="w-16 h-16 rounded-full bg-rose-100 flex items-center justify-center mb-4">
        <AlertTriangle className="w-8 h-8 text-rose-600" />
      </div>
      <h3 className="text-xl font-medium text-slate-900 mb-2">Something went wrong</h3>
      <p className="text-slate-500 mb-6 max-w-md text-center">{message}</p>
      {onRetry && (
        <Button onClick={onRetry} variant="outline" className="gap-2">
          <RefreshCcw className="w-4 h-4" />
          Retry
        </Button>
      )}
    </div>
  );
}
