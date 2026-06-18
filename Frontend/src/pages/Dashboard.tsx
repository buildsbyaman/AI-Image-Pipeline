import { AppShell } from "@/components/layout/AppShell"
import { useJobs } from "@/hooks/useJobs"
import { JobCard } from "@/components/ui/JobCard"
import { BarChart3, CheckCircle2, AlertTriangle, XCircle } from "lucide-react"

export default function Dashboard() {
  const { data: jobs = [], isLoading } = useJobs()

  const stats = [
    { label: "Total Jobs", value: jobs.length, icon: BarChart3, color: "text-blue-500", bg: "bg-blue-500/10" },
    { label: "Completed", value: jobs.filter((j: any) => j.status === 'COMPLETED').length, icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-500/10" },
    { label: "Flagged", value: jobs.filter((j: any) => j.flagged).length, icon: AlertTriangle, color: "text-yellow-500", bg: "bg-yellow-500/10" },
    { label: "Failed", value: jobs.filter((j: any) => j.status === 'FAILED').length, icon: XCircle, color: "text-red-500", bg: "bg-red-500/10" }
  ]

  return (
    <AppShell>
      <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:px-8 max-w-5xl mx-auto w-full">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-zinc-100">Overview</h1>
          <p className="text-zinc-400 mt-1">Your recent activity and pipeline metrics.</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, i) => (
            <div key={i} className="bg-[#111113] border border-zinc-800/80 rounded-2xl p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className={`p-2 rounded-lg ${stat.bg}`}>
                  <stat.icon size={18} className={stat.color} />
                </div>
                <h3 className="text-sm font-medium text-zinc-400">{stat.label}</h3>
              </div>
              <p className="text-3xl font-bold text-zinc-100">{stat.value}</p>
            </div>
          ))}
        </div>

        <h2 className="text-lg font-semibold text-zinc-200 mb-4">Recent Jobs</h2>
        {isLoading ? (
          <div className="flex justify-center p-12">
             <div className="w-8 h-8 border-2 border-zinc-800 border-t-violet-500 rounded-full animate-spin" />
          </div>
        ) : jobs.length === 0 ? (
          <div className="bg-[#111113] border border-zinc-800/50 rounded-xl p-12 text-center">
            <p className="text-zinc-500">No jobs yet. Start a new process to see them here.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {jobs.slice(0, 5).map((job: any) => (
              <JobCard key={job.id} job={job} hideImage={true} hideTimeline={true} />
            ))}
          </div>
        )}
      </div>
    </AppShell>
  )
}
