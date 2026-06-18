import { LogOut } from "lucide-react"

interface LogoutButtonProps {
  onLogout: () => void
}

export function LogoutButton({ onLogout }: LogoutButtonProps) {
  return (
    <button 
      onClick={onLogout}
      className="h-8 w-8 flex items-center justify-center text-zinc-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors flex-shrink-0 self-center"
      title="Log out"
    >
      <LogOut size={16} />
    </button>
  )
}
