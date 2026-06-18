import { NotificationBell } from "../notifications/NotificationBell"
import { useAuth } from "@/context/AuthContext"

export function Header() {
  const { user } = useAuth()
  
  return (
    <header className="h-14 border-b border-zinc-800/80 bg-[#111113]/80 backdrop-blur-md flex items-center justify-between px-4 lg:px-8 flex-shrink-0 z-30 sticky top-0">
      <div className="flex items-center gap-4 ml-12 md:ml-0">
        <h1 className="text-sm font-semibold text-zinc-100 hidden sm:block">
          Dashboard
        </h1>
      </div>
      <div className="flex items-center gap-3">
        <NotificationBell />
        <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-violet-600 to-blue-500 border border-zinc-800 flex items-center justify-center text-xs font-bold shadow-inner">
          {((user as any)?.firstName || "G").charAt(0).toUpperCase()}
        </div>
      </div>
    </header>
  )
}
