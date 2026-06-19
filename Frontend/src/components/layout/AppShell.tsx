import React, { useState } from "react"
import { Sidebar } from "./Sidebar"
import { PanelLeftOpen, Menu } from "lucide-react"
import { DashboardProvider } from "../../context/DashboardContext"
import { NotificationProvider } from "../../context/NotificationContext"
import { NotificationBell } from "../notifications/NotificationBell"

interface AppShellProps {
  children: React.ReactNode
}

export function AppShell({ children }: AppShellProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isOpen, setIsOpen] = useState(false)

  return (
    <NotificationProvider>
      <DashboardProvider>
        <div className="flex h-screen w-full bg-[#09090B] text-[#FAFAFA] font-sans antialiased overflow-hidden">
          <Sidebar 
            isCollapsed={isCollapsed} 
            onCollapse={() => setIsCollapsed(true)} 
            isOpen={isOpen}
            setIsOpen={setIsOpen}
          />
          <main className="flex-1 flex flex-col h-full relative overflow-hidden bg-[#0F0F12]">
            {/* Header / Topbar */}
            <header className="h-16 border-b border-zinc-900/60 bg-[#0B0B0C]/50 backdrop-blur-md px-4 md:px-6 flex items-center justify-between z-30 shrink-0">
              <div className="flex items-center gap-3">
                {/* Mobile menu trigger */}
                <button 
                  onClick={() => setIsOpen(true)}
                  className="md:hidden p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-100 transition-colors"
                  title="Open menu"
                >
                  <Menu size={18} />
                </button>

                {/* Desktop sidebar expand trigger */}
                {isCollapsed && (
                  <button 
                    onClick={() => setIsCollapsed(false)}
                    className="hidden md:flex p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-100 transition-colors"
                    title="Open sidebar"
                  >
                    <PanelLeftOpen size={18} />
                  </button>
                )}
              </div>

              {/* Topbar Actions */}
              <div className="flex items-center gap-3">
                <NotificationBell />
              </div>
            </header>

            {/* Scrollable Page Content */}
            <div className="flex-1 overflow-y-auto">
              {children}
            </div>
          </main>
        </div>
      </DashboardProvider>
    </NotificationProvider>
  )
}
