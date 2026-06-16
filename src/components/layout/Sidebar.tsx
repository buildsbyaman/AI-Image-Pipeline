import { useState } from "react"
import { Link } from "react-router-dom"
import { Plus, Menu, X, PanelLeftClose } from "lucide-react"
import { cn } from "@/lib/utils"
import { SidebarHistory } from "./SidebarHistory"
import { SidebarFooter } from "./SidebarFooter"

import { useDashboard } from "@/context/DashboardContext"

interface SidebarProps {
  isCollapsed: boolean
  onCollapse: () => void
}

export function Sidebar({ isCollapsed, onCollapse }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false)
  const { jobs, user } = useDashboard()

  const recentUploads = jobs.map((job) => ({
    label: job.prompt || `Upload ${job.id}`,
    date: job.createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }))

  const toggleSidebar = () => setIsOpen(!isOpen)

  return (
    <>
      <button 
        onClick={toggleSidebar}
        className={cn(
          "md:hidden fixed top-4 left-4 z-50 p-2 rounded-md bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-100",
          isOpen && "hidden"
        )}
      >
        <Menu size={20} />
      </button>

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
          <div className="p-3 flex items-center justify-between gap-1.5">
            <Link 
              to="/dashboard"
              className="flex-1 flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-zinc-200 bg-zinc-800/30 hover:bg-zinc-800/50 rounded-lg transition-colors border border-zinc-800/80"
            >
              <div className="bg-zinc-800 p-1 rounded-md">
                <Plus size={16} className="text-zinc-300" />
              </div>
              New Process
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

          <SidebarHistory uploads={recentUploads} />

          <SidebarFooter name={user.name} plan={user.plan} />
        </div>
      </aside>
    </>
  )
}
