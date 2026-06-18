import { Image as ImageIcon } from "lucide-react"
import { Link, useLocation } from "react-router-dom"
import { cn } from "@/lib/utils"

interface UploadHistoryItem {
  id: string
  label: string
  date: string
}

interface SidebarHistoryProps {
  uploads: UploadHistoryItem[]
}

export function SidebarHistory({ uploads }: SidebarHistoryProps) {
  const location = useLocation();

  return (
    <div className="mt-6 flex-1 overflow-y-auto px-3">
      <div className="px-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">
        Recent
      </div>
      <div className="space-y-1">
        {uploads.map((upload) => {
          const isActive = location.pathname === `/jobs/${upload.id}`;
          return (
            <Link 
              key={upload.id}
              to={`/jobs/${upload.id}`}
              className={cn(
                "w-full text-left flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors group border",
                isActive 
                  ? "bg-zinc-800/60 text-[#FAFAFA] font-medium border-zinc-700/80" 
                  : "text-zinc-400 hover:bg-zinc-800/40 hover:text-[#FAFAFA] border-transparent"
              )}
            >
              <ImageIcon size={16} className={cn(
                isActive ? "text-[#FAFAFA]" : "text-zinc-600 group-hover:text-zinc-400"
              )} />
              <span className="truncate flex-1">{upload.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
