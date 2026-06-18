import { useState } from "react"
import { AlertTriangle, Clock, RefreshCw, Trash2 } from "lucide-react"
import { StatusBadge, type ProcessingStatus } from "./StatusBadge"
import type { Job } from "@/api/jobs"
import { useRetryJob, useDeleteJob } from "@/hooks/useJobs"
import { useNavigate } from "react-router-dom"
import { API_URL } from "@/lib/auth"
import { cn } from "@/lib/utils"

interface JobCardProps {
  job: Job
  hideImage?: boolean
  hideTimeline?: boolean
}

export function JobCard({ job, hideImage = false, hideTimeline = false }: JobCardProps) {
  const { mutate: retryJob, isPending: isRetrying } = useRetryJob()
  const { mutate: deleteJob, isPending: isDeleting } = useDeleteJob()
  const navigate = useNavigate()
  const [imageError, setImageError] = useState(false)

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this job and its processed files?")) {
      deleteJob(job.id, {
        onSuccess: () => {
          navigate("/dashboard")
        }
      })
    }
  }

  return (
    <div className={`w-full bg-[#111113] border ${job.flagged ? 'border-red-900/50 hover:border-red-800/50' : 'border-zinc-800/50 hover:border-zinc-700/50'} rounded-2xl overflow-hidden transition-colors`}>
      <div className={`p-4 border-b flex items-center justify-between ${job.flagged ? 'border-red-900/30 bg-red-950/10' : 'border-zinc-800/50 bg-zinc-900/20'}`}>
        <div className="flex items-center gap-3">
          <StatusBadge status={(job.status.toLowerCase() as ProcessingStatus) || "pending"} />
          <span className="text-xs text-zinc-500 flex items-center gap-1">
            <Clock size={12} />
            {new Date(job.createdAt).toLocaleString()}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {job.status === 'FAILED' && (
            <button 
              onClick={() => retryJob(job.id)}
              disabled={isRetrying}
              className="px-3 py-1.5 text-xs font-medium text-zinc-300 hover:text-white bg-zinc-800 hover:bg-zinc-700 rounded-md transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              <RefreshCw size={14} className={isRetrying ? "animate-spin" : ""} />
              Retry
            </button>
          )}

          <button 
            onClick={handleDelete}
            disabled={isDeleting}
            className="px-3 py-1.5 text-xs font-medium text-red-400 hover:text-red-300 hover:bg-red-950/20 border border-red-900/40 hover:border-red-800/60 rounded-md transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            <Trash2 size={14} className={isDeleting ? "animate-pulse" : ""} />
            Delete
          </button>
        </div>
      </div>
      
      <div className="p-5">
        <div className={cn(
          "grid grid-cols-1 gap-6",
          hideImage ? "md:grid-cols-2" : "md:grid-cols-3"
        )}>
          {/* Image Column */}
          {!hideImage && (
            <div className="space-y-2">
              <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Source Image</span>
              <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-zinc-950 border border-zinc-800/80 group/img flex items-center justify-center">
                {job.fileKey && !imageError ? (
                  <img 
                    src={`${API_URL}/files/${job.fileKey}`} 
                    alt="Job source" 
                    className="h-full w-full object-cover transition-all duration-300 group-hover/img:scale-[1.03]"
                    loading="lazy"
                    onError={() => setImageError(true)}
                  />
                ) : (
                  <span className="text-zinc-500 text-sm font-medium">Job source</span>
                )}
              </div>
            </div>
          )}

          {/* Details Column */}
          <div className="space-y-4">
            <div>
              <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Job ID</span>
              <p className="text-sm font-mono text-zinc-300 mt-1 break-all">{job.id}</p>
            </div>
            
            {job.caption && (
              <div>
                <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Caption</span>
                <p className="text-sm text-zinc-300 mt-1">{job.caption}</p>
              </div>
            )}
            
            {job.labels && job.labels.length > 0 && (
              <div>
                <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Labels</span>
                <div className="flex flex-wrap gap-2 mt-2">
                  {job.labels.map((label: string, i: number) => (
                    <span key={i} className="px-2 py-1 text-xs bg-zinc-800/60 text-zinc-300 rounded-md border border-zinc-800/80">
                      {label}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Safety Status Column */}
          <div className="space-y-4">
            <div>
              <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Safety Status</span>
              {job.status === 'PENDING' || job.status === 'PROCESSING' ? (
                 <div className="flex items-center gap-2 mt-1">
                  <div className="w-4 h-4 border-2 border-zinc-600 border-t-zinc-400 rounded-full animate-spin" />
                  <span className="text-sm text-zinc-400">Analyzing...</span>
                </div>
              ) : job.status === 'FAILED' ? (
                <div className="mt-2 p-3 bg-red-950/20 border border-red-950/40 rounded-lg">
                  <div className="flex items-center gap-2 text-red-400">
                    <AlertTriangle size={16} />
                    <span className="text-sm font-medium">Analysis Failed</span>
                  </div>
                  {job.error && (
                    <p className="text-xs text-red-400/70 mt-1.5 font-mono break-words leading-relaxed">{job.error}</p>
                  )}
                </div>
              ) : job.flagged ? (
                <div className="mt-2 p-3 bg-red-950/30 border border-red-900/50 rounded-lg flex items-start gap-3">
                  <AlertTriangle size={16} className="text-red-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-red-500">Content Flagged</p>
                    <p className="text-xs text-red-400/80 mt-1">Category: {job.flaggedCategory || "Unknown"}</p>
                  </div>
                </div>
              ) : (
                <div className="mt-2 text-sm text-emerald-500 font-medium flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500" />
                  Safe Content
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Processing Timeline */}
        {!hideTimeline && (
          <div className="mt-8 border-t border-zinc-800/80 pt-6">
            <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider block mb-6">Processing Timeline</span>
            
            <div className="relative flex items-center justify-between w-full max-w-3xl mx-auto px-4 mb-2">
              {/* Connector Line Background */}
              <div className="absolute top-[18px] left-[32px] right-[32px] h-[2px] bg-zinc-800/60 -translate-y-1/2 z-0" />
              
              {/* Active/Completed Connector Line */}
              <div 
                className="absolute top-[18px] left-[32px] h-[2px] bg-indigo-500 -translate-y-1/2 transition-all duration-500 ease-in-out z-0"
                style={{ 
                  width: job.status === 'COMPLETED' ? '100%' 
                       : job.status === 'W2' ? '66.6%' 
                       : job.status === 'W1' ? '33.3%' 
                       : job.status === 'PROCESSING' ? '15%' 
                       : '0%' 
                }}
              />

              {/* Steps */}
              {[
                { title: "Submitted", desc: "Pipeline triggered" },
                { title: "Worker 1", desc: "Image Captioning" },
                { title: "Worker 2", desc: "Label Detection" },
                { title: "Worker 3", desc: "Safety Check" },
              ].map((step, i) => {
                const s = job.status;
                let state: 'completed' | 'active' | 'pending' | 'failed' = 'pending';
                
                if (s === 'FAILED') {
                  const lastCompletedStage: number = job.caption ? 1 : 0; // heuristic check
                  if (i === 0) state = 'completed';
                  else if (i === 1) state = lastCompletedStage >= 1 ? 'completed' : 'failed';
                  else if (i === 2) state = lastCompletedStage >= 2 ? 'completed' : (lastCompletedStage === 1 ? 'failed' : 'pending');
                  else if (i === 3) state = lastCompletedStage === 2 ? 'failed' : 'pending';
                } else {
                  if (i === 0) state = 'completed';
                  else if (i === 1) {
                    state = ['W1', 'W2', 'COMPLETED'].includes(s) ? 'completed' 
                          : s === 'PROCESSING' ? 'active' : 'pending';
                  } else if (i === 2) {
                    state = ['W2', 'COMPLETED'].includes(s) ? 'completed' 
                          : s === 'W1' ? 'active' : 'pending';
                  } else if (i === 3) {
                    state = s === 'COMPLETED' ? 'completed' 
                          : s === 'W2' ? 'active' : 'pending';
                  }
                }

                return (
                  <div key={i} className="flex flex-col items-center relative z-10 w-24">
                    {/* Step bubble */}
                    <div className={cn(
                      "w-9 h-9 rounded-full flex items-center justify-center border-2 text-xs font-semibold transition-all duration-300",
                      state === 'completed' ? "bg-indigo-500 border-indigo-500 text-white shadow-[0_0_12px_rgba(99,102,241,0.4)]"
                      : state === 'active' ? "bg-[#111113] border-indigo-500 text-indigo-400 animate-pulse shadow-[0_0_8px_rgba(99,102,241,0.2)]"
                      : state === 'failed' ? "bg-[#111113] border-red-500 text-red-500"
                      : "bg-[#111113] border-zinc-800 text-zinc-500"
                    )}>
                      {state === 'completed' ? "✓" : i + 1}
                    </div>
                    
                    {/* Title & Desc */}
                    <div className="text-center mt-3">
                      <p className={cn(
                        "text-xs font-medium transition-colors duration-300",
                        state === 'completed' ? "text-zinc-200"
                        : state === 'active' ? "text-indigo-400 font-semibold"
                        : state === 'failed' ? "text-red-400"
                        : "text-zinc-500"
                      )}>
                        {step.title}
                      </p>
                      <p className="text-[10px] text-zinc-500 mt-0.5 whitespace-nowrap">
                        {state === 'failed' ? "Failed" : step.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
