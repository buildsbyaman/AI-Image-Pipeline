import { useState, useEffect } from "react"
import { AlertTriangle, Clock, RefreshCw, Trash2, Eye } from "lucide-react"
import { StatusBadge, type ProcessingStatus } from "./StatusBadge"
import type { Job } from "@/api/jobs"
import { useRetryJob, useDeleteJob } from "@/hooks/useJobs"
import { useNavigate } from "react-router-dom"
import { API_URL } from "@/lib/auth"
import { cn } from "@/lib/utils"
import { DeleteDialog } from "./DeleteDialog"

interface JobCardProps {
  job: Job
  hideImage?: boolean
  hideTimeline?: boolean
  hideViewButton?: boolean
}

export function JobCard({ job, hideImage = false, hideTimeline = false, hideViewButton = false }: JobCardProps) {
  const { mutate: retryJob, isPending: isRetrying } = useRetryJob()
  const { mutate: deleteJob, isPending: isDeleting } = useDeleteJob()
  const navigate = useNavigate()
  const [imageError, setImageError] = useState(false)
  const [elapsed, setElapsed] = useState(0)

  useEffect(() => {
    if (['PENDING', 'PROCESSING', 'W1', 'W2'].includes(job.status)) {
      const start = new Date(job.updatedAt || job.createdAt).getTime()
      setElapsed(Math.max(0, Math.floor((Date.now() - start) / 1000)))
      
      const interval = setInterval(() => {
        setElapsed(Math.max(0, Math.floor((Date.now() - start) / 1000)))
      }, 1000)
      return () => clearInterval(interval)
    }
  }, [job.status, job.updatedAt, job.createdAt])

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  const handleDelete = () => {
    setIsDeleteDialogOpen(true)
  }

  const handleConfirmDelete = () => {
    deleteJob(job.id, {
      onSuccess: () => {
        setIsDeleteDialogOpen(false)
        navigate("/dashboard")
      },
      onError: () => {
        setIsDeleteDialogOpen(false)
      }
    })
  }


  return (
    <div className={`w-full bg-[#111113] border ${job.flagged ? 'border-red-900/50 hover:border-red-800/50' : 'border-zinc-800/50 hover:border-zinc-700/50'} rounded-2xl overflow-hidden transition-colors`}>
      <div className={`p-4 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${job.flagged ? 'border-red-900/30 bg-red-950/10' : 'border-zinc-900/20 bg-zinc-900/20'}`}>
        <div className="flex items-center justify-between sm:justify-start gap-3 w-full sm:w-auto">
          <StatusBadge status={(job.status.toLowerCase() as ProcessingStatus) || "pending"} />
          <span className="text-xs text-zinc-500 flex items-center gap-1 whitespace-nowrap">
            <Clock size={12} className="flex-shrink-0" />
            <span className="hidden sm:inline">
              {new Date(job.createdAt).toLocaleString()}
            </span>
            <span className="sm:hidden">
              {new Date(job.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}, {new Date(job.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </span>
        </div>
        <div className="flex items-center justify-end gap-2 w-full sm:w-auto">
          {!hideViewButton && (
            <button 
              onClick={() => navigate(`/jobs/${job.id}`)}
              className="px-3 py-1.5 text-xs font-medium text-zinc-300 hover:text-white bg-zinc-800 hover:bg-zinc-700 rounded-md transition-colors flex items-center gap-2"
            >
              <Eye size={14} />
              View
            </button>
          )}

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
                    src={`${API_URL}/files/${job.fileKey}?token=${localStorage.getItem("accessToken") || ""}`} 
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
              {['PENDING', 'PROCESSING'].includes(job.status) ? (
                 <div className="flex items-center gap-2 mt-1">
                  <div className="w-4 h-4 border-2 border-zinc-600 border-t-indigo-400 rounded-full animate-spin" />
                  <span className="text-sm text-zinc-400">Analyzing…</span>
                </div>
              ) : job.status === 'FAILED' && job.flagged === undefined ? (
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
            <div className="flex items-center justify-between mb-6">
              <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Processing Timeline</span>
              {['PENDING', 'PROCESSING', 'W1', 'W2'].includes(job.status) && (
                <span className="flex items-center gap-2">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500" />
                  </span>
                  <span className="text-[10px] font-mono text-indigo-400">{elapsed}s elapsed</span>
                </span>
              )}
            </div>
            
            <div className="relative flex flex-col sm:flex-row items-stretch sm:items-start justify-between w-full max-w-3xl mx-auto px-4 mb-2 gap-6 sm:gap-0">
              {/* Vertical background rail (mobile) */}
              <div className="absolute left-[34px] top-4 bottom-4 w-[2px] bg-zinc-800/60 z-0 sm:hidden" />
              {/* Vertical progress (mobile) */}
              <div
                className="absolute left-[34px] top-4 w-[2px] z-0 transition-[height] duration-700 ease-in-out sm:hidden"
                style={{
                  height: job.flagged           ? 'calc(33.3% - 10px)'
                       : job.status === 'COMPLETED' ? 'calc(100% - 32px)'
                       : job.status === 'W2'         ? 'calc(66.6% - 20px)'
                       : job.status === 'W1'         ? 'calc(33.3% - 10px)'
                       : job.status === 'PROCESSING' ? '12%'
                       : '0%',
                  background: job.flagged ? 'linear-gradient(180deg, #ef4444, #f87171)' : 'linear-gradient(180deg, #6366f1, #818cf8)',
                }}
              />

              {/* Horizontal background rail (desktop) */}
              <div className="hidden sm:block absolute top-[18px] left-8 right-8 h-[2px] bg-zinc-800/60 z-0" />
              {/* Horizontal progress (desktop) */}
              <div
                className="hidden sm:block absolute top-[18px] left-8 h-[2px] z-0 transition-[width] duration-700 ease-in-out"
                style={{
                  width: job.flagged           ? 'calc(33.3% - 21px)'
                       : job.status === 'COMPLETED' ? 'calc(100% - 64px)'
                       : job.status === 'W2'         ? 'calc(66.6% - 42px)'
                       : job.status === 'W1'         ? 'calc(33.3% - 21px)'
                       : job.status === 'PROCESSING' ? '12%'
                       : '0%',
                  background: job.flagged ? 'linear-gradient(90deg, #ef4444, #f87171)' : 'linear-gradient(90deg, #6366f1, #818cf8)',
                }}
              />
              {/* Scan shimmer overlay (desktop) */}
              {['PENDING', 'PROCESSING', 'W1', 'W2'].includes(job.status) && !job.flagged && (
                <div
                  className="hidden sm:block absolute top-[18px] left-8 h-[2px] z-0 overflow-hidden pointer-events-none"
                  style={{
                    width: job.status === 'COMPLETED' ? 'calc(100% - 64px)'
                         : job.status === 'W2'         ? 'calc(66.6% - 42px)'
                         : job.status === 'W1'         ? 'calc(33.3% - 21px)'
                         : job.status === 'PROCESSING' ? '12%'
                         : '0%',
                  }}
                >
                  <div
                    className="h-full w-16 absolute"
                    style={{
                      background: 'linear-gradient(90deg, transparent, rgba(200,210,255,0.7), transparent)',
                      animation: 'tlScan 1.8s ease-in-out infinite',
                    }}
                  />
                </div>
              )}

              {[
                { title: "Submitted",  desc: "Pipeline triggered" },
                { title: "Worker 1",   desc: "Safety Check"       },
                { title: "Worker 2",   desc: "Image Captioning"   },
                { title: "Worker 3",   desc: "Label Detection"    },
              ].map((step, i) => {
                const s = job.status;
                let state: 'completed' | 'active' | 'pending' | 'failed' = 'pending';
                if (job.flagged) {
                  if (i === 0) state = 'completed';
                  else if (i === 1) state = 'failed';
                  else state = 'pending';
                } else if (s === 'FAILED') {
                  const lastCompletedStage: number = job.caption ? 2 : (job.flagged === false ? 1 : 0);
                  if (i === 0) state = 'completed';
                  else if (i === 1) state = lastCompletedStage >= 1 ? 'completed' : 'failed';
                  else if (i === 2) state = lastCompletedStage >= 2 ? 'completed' : (lastCompletedStage === 1 ? 'failed' : 'pending');
                  else if (i === 3) state = lastCompletedStage === 2 ? 'failed' : 'pending';
                } else {
                  if (i === 0) state = 'completed';
                  else if (i === 1) state = ['W1', 'W2', 'COMPLETED'].includes(s) ? 'completed' : s === 'PROCESSING' ? 'active' : 'pending';
                  else if (i === 2) state = ['W2', 'COMPLETED'].includes(s) ? 'completed' : s === 'W1' ? 'active' : 'pending';
                  else if (i === 3) state = s === 'COMPLETED' ? 'completed' : s === 'W2' ? 'active' : 'pending';
                }

                return (
                  <div key={i} className="flex flex-row sm:flex-col items-center relative z-10 w-full sm:w-24 gap-4 sm:gap-0">
                    {/* Bubble */}
                    <div className={cn(
                      "w-9 h-9 rounded-full flex items-center justify-center border-2 text-xs font-bold transition-all duration-300 relative flex-shrink-0",
                      state === 'completed' ? "bg-indigo-500 border-indigo-500 text-white shadow-[0_0_14px_rgba(99,102,241,0.5)]"
                      : state === 'active'  ? "bg-[#0e0e11] border-indigo-500 text-indigo-300"
                      : state === 'failed'  ? "bg-red-500 border-red-500 text-white shadow-[0_0_14px_rgba(239,68,68,0.5)]"
                      : "bg-[#0e0e11] border-zinc-700 text-zinc-600"
                    )}>
                      {state === 'active' && (
                        <>
                          <span className="absolute inset-0 rounded-full border-2 border-indigo-400 animate-ping opacity-60" />
                          <span className="absolute inset-[-5px] rounded-full border border-indigo-500/25 animate-pulse" />
                        </>
                      )}
                      {state === 'failed' ? '✗' : (state === 'completed' ? '✓' : i + 1)}
                    </div>
                    {/* Labels */}
                    <div className="text-left sm:text-center sm:mt-2">
                      <p className={cn(
                        "text-xs sm:text-[10px] font-semibold leading-tight",
                        state === 'completed' ? "text-zinc-200"
                        : state === 'active'  ? "text-indigo-300"
                        : state === 'failed'  ? "text-red-400"
                        : "text-zinc-500"
                      )}>
                        {step.title}
                      </p>
                      <p className="text-[10px] sm:text-[9px] text-zinc-600 mt-0.5 whitespace-nowrap">
                        {state === 'failed' ? 'Failed' : step.desc}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Bottom status bar — active jobs only */}
            {['PENDING', 'PROCESSING', 'W1', 'W2'].includes(job.status) && (
              <div className="mt-5 flex items-center gap-3 bg-indigo-950/20 border border-indigo-900/30 rounded-xl px-4 py-2.5">
                <div className="w-4 h-4 border-2 border-indigo-700 border-t-indigo-400 rounded-full animate-spin flex-shrink-0" />
                <p className="text-xs text-indigo-300/80">
                  Your image is being processed by the AI pipeline.
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Keyframe for scan shimmer */}
      <style>{`
        @keyframes tlScan {
          0%   { left: -64px; }
          100% { left: 100%; }
        }
      `}</style>

      <DeleteDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete job?"
        description="Are you sure you want to delete this job and all of its processed files? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        isDeleting={isDeleting}
      />
    </div>
  )
}
