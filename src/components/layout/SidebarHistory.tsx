import { Image as ImageIcon } from "lucide-react"

interface UploadHistoryItem {
  label: string
  date: string
}

interface SidebarHistoryProps {
  uploads: UploadHistoryItem[]
}

export function SidebarHistory({ uploads }: SidebarHistoryProps) {
  return (
    <div className="mt-6 flex-1 overflow-y-auto px-3">
      <div className="px-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">
        Recent
      </div>
      <div className="space-y-1">
        {uploads.map((upload, i) => (
          <button 
            key={i}
            className="w-full text-left flex items-center gap-3 px-3 py-2 text-sm text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200 rounded-lg transition-colors group"
          >
            <ImageIcon size={16} className="text-zinc-600 group-hover:text-zinc-400" />
            <span className="truncate flex-1">{upload.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
