import React, { useState } from "react"
import { Sidebar } from "./Sidebar"
import { PanelLeftOpen } from "lucide-react"

interface AppShellProps {
  children: React.ReactNode
}

export function AppShell({ children }: AppShellProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)

  return (
    <div className="flex h-screen w-full bg-[#09090B] text-[#FAFAFA] font-sans antialiased overflow-hidden">
      <Sidebar isCollapsed={isCollapsed} onCollapse={() => setIsCollapsed(true)} />
      <main className="flex-1 flex flex-col h-full relative overflow-hidden bg-[#0F0F12]">
        {isCollapsed && (
          <button 
            onClick={() => setIsCollapsed(false)}
            className="absolute top-4 left-4 z-50 p-2 rounded-lg bg-[#111113] border border-zinc-800/80 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50 transition-all shadow-md"
            title="Open sidebar"
          >
            <PanelLeftOpen size={18} />
          </button>
        )}
        {children}
      </main>
    </div>
  )
}
