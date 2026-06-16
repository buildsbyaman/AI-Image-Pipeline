import { Download, MoreHorizontal, Maximize2 } from "lucide-react"
import type { ProcessingStatus } from "./StatusBadge"
import { StatusBadge } from "./StatusBadge"

export interface Job {
  id: string
  originalImage: string
  resultImage?: string
  prompt: string
  status: ProcessingStatus
  createdAt: Date
}

interface JobCardProps {
  job: Job
}

export function JobCard({ job }: JobCardProps) {
  return (
    <div className="w-full bg-[#111113] border border-zinc-800/50 rounded-2xl overflow-hidden hover:border-zinc-700/50 transition-colors">
      <div className="p-4 border-b border-zinc-800/50 flex items-center justify-between bg-zinc-900/20">
        <div className="flex items-center gap-3">
          <StatusBadge status={job.status} />
          <span className="text-xs text-zinc-500">
            {job.createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button className="p-1.5 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 rounded-md transition-colors">
            <MoreHorizontal size={16} />
          </button>
        </div>
      </div>
      
      <div className="p-5">
        <p className="text-sm text-zinc-300 mb-5 font-medium leading-relaxed">
          <span className="text-zinc-500 mr-2">Prompt:</span>
          {job.prompt || "Default enhancement"}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider ml-1">Original</span>
            <div className="relative aspect-video rounded-xl overflow-hidden bg-zinc-900 border border-zinc-800 group">
              <img src={job.originalImage} alt="Original" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                <button className="p-2 bg-zinc-800/80 rounded-full text-zinc-200 hover:text-white hover:bg-zinc-700 transition-colors">
                  <Maximize2 size={16} />
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider ml-1">Result</span>
            <div className="relative aspect-video rounded-xl overflow-hidden bg-zinc-900 border border-zinc-800 group">
              {job.resultImage ? (
                <>
                  <img src={job.resultImage} alt="Result" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 backdrop-blur-[2px]">
                    <button className="p-2 bg-zinc-800/80 rounded-full text-zinc-200 hover:text-white hover:bg-zinc-700 transition-colors">
                      <Maximize2 size={16} />
                    </button>
                    <button className="p-2 bg-zinc-800/80 rounded-full text-zinc-200 hover:text-white hover:bg-zinc-700 transition-colors">
                      <Download size={16} />
                    </button>
                  </div>
                </>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-zinc-600 gap-3">
                  <div className="w-8 h-8 border-2 border-zinc-800 border-t-violet-500 rounded-full animate-spin" />
                  <span className="text-xs font-medium">Processing image...</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
