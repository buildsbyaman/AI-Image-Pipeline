import { cn } from "@/lib/utils"

export type ProcessingStatus = "idle" | "pending" | "uploading" | "processing" | "w1" | "w2" | "completed" | "failed" | "error"

interface StatusBadgeProps {
  status: ProcessingStatus
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const statusConfig = {
    idle: { label: "Idle", dotClass: "bg-zinc-500", textClass: "text-zinc-500", borderClass: "border-zinc-800/50" },
    pending: { label: "Pending", dotClass: "bg-zinc-400 animate-pulse", textClass: "text-zinc-400", borderClass: "border-zinc-800/50" },
    uploading: { label: "Uploading...", dotClass: "bg-blue-400 animate-pulse", textClass: "text-blue-400", borderClass: "border-blue-500/20 bg-blue-500/5" },
    processing: { label: "Processing AI", dotClass: "bg-violet-400 animate-pulse", textClass: "text-violet-400", borderClass: "border-violet-500/20 bg-violet-500/5" },
    w1: { label: "Safety Check Done", dotClass: "bg-indigo-400 animate-pulse", textClass: "text-indigo-400", borderClass: "border-indigo-500/20 bg-indigo-500/5" },
    w2: { label: "Caption Generated", dotClass: "bg-purple-400 animate-pulse", textClass: "text-purple-400", borderClass: "border-purple-500/20 bg-purple-500/5" },
    completed: { label: "Completed", dotClass: "bg-emerald-400", textClass: "text-emerald-400", borderClass: "border-emerald-500/20 bg-emerald-500/5" },
    failed: { label: "Failed", dotClass: "bg-red-400", textClass: "text-red-400", borderClass: "border-red-500/20 bg-red-500/5" },
    error: { label: "Failed", dotClass: "bg-red-400", textClass: "text-red-400", borderClass: "border-red-500/20 bg-red-500/5" },
  }

  const normalized = (status || "").toLowerCase();
  const config = statusConfig[normalized as keyof typeof statusConfig] || statusConfig.idle;

  return (
    <div className={cn("inline-flex items-center gap-2 px-2.5 py-1 rounded-full border text-xs font-medium transition-colors", config.borderClass)}>
      <span className={cn("h-1.5 w-1.5 rounded-full", config.dotClass)} />
      <span className={config.textClass}>{config.label}</span>
    </div>
  );
}
