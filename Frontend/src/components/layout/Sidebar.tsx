import { Link, useLocation } from "react-router-dom"
import { Plus, X, PanelLeftClose, LayoutDashboard } from "lucide-react"
import { cn } from "@/lib/utils"
import { SidebarHistory } from "./SidebarHistory"
import { SidebarFooter } from "./SidebarFooter"

import { useDashboard } from "@/context/DashboardContext"

interface SidebarProps {
  isCollapsed: boolean
  onCollapse: () => void
  isOpen: boolean
  setIsOpen: (open: boolean) => void
}

export function Sidebar({ isCollapsed, onCollapse, isOpen, setIsOpen }: SidebarProps) {
  const { jobs, user } = useDashboard()
  const location = useLocation()

  const isDashboardActive = location.pathname === "/dashboard"
  const isUploadActive = location.pathname === "/upload"

  const recentUploads = jobs.map((job) => {
    const rawLabel = job.caption || job.prompt || `Job ${job.id}`;
    const label = rawLabel.length > 30 ? `${rawLabel.substring(0, 27)}...` : rawLabel;
    return {
      id: job.id,
      label,
      date: new Date(job.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
  })

  return (
    <>
      {isOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/60 z-40 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside className={cn(
        "fixed md:static inset-y-0 left-0 z-40 bg-[#111113] flex flex-col transition-[transform,width,opacity] duration-300 ease-in-out overflow-hidden",
        isOpen ? "translate-x-0 w-[260px] border-r border-zinc-800/80" : "-translate-x-full md:translate-x-0",
        isCollapsed 
          ? "md:w-0 md:opacity-0 md:pointer-events-none border-r-0" 
          : "w-[260px] border-r border-zinc-800/80"
      )}>
        <div className="w-[260px] h-full flex flex-col flex-shrink-0">
          <div className="p-3 flex flex-col gap-2">
            <div className="flex items-center justify-between gap-1.5">
              <Link 
                to="/dashboard"
                className={cn(
                  "flex-1 flex items-center gap-3 px-3 py-2 text-sm font-medium transition-colors border rounded-lg",
                  isDashboardActive 
                    ? "bg-zinc-800/60 text-[#FAFAFA] border-zinc-700/80" 
                    : "text-zinc-400 hover:text-[#FAFAFA] hover:bg-zinc-800/40 border-transparent"
                )}
              >
                <LayoutDashboard size={18} className={cn(
                  isDashboardActive ? "text-[#FAFAFA]" : "text-zinc-500"
                )} />
                Dashboard
              </Link>
              
              <button 
                onClick={onCollapse}
                className="hidden md:flex h-9 w-9 items-center justify-center text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/40 rounded-lg transition-colors flex-shrink-0"
                title="Close sidebar"
              >
                <PanelLeftClose size={16} />
              </button>
              
              <button 
                onClick={() => setIsOpen(false)}
                className="md:hidden ml-1 p-2 text-zinc-400 hover:text-zinc-100"
              >
                <X size={20} />
              </button>
            </div>

            <Link 
              to="/upload"
              className={cn(
                "flex items-center gap-3 px-3 py-2 text-sm font-medium transition-colors border rounded-lg",
                isUploadActive 
                  ? "bg-zinc-800/60 text-[#FAFAFA] border-zinc-700/80" 
                  : "text-zinc-400 hover:text-[#FAFAFA] hover:bg-zinc-800/40 border-transparent"
              )}
            >
              <div className={cn(
                "p-1 rounded-md transition-colors",
                isUploadActive ? "bg-zinc-700 text-[#FAFAFA]" : "bg-zinc-800/60 text-zinc-400"
              )}>
                <Plus size={16} />
              </div>
              New Process
            </Link>
          </div>

          <SidebarHistory uploads={recentUploads} />

          <SidebarFooter name={user.name} />
        </div>
      </aside>
    </>
  )
}
