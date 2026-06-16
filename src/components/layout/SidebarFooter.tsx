import { UserProfile } from "./UserProfile"
import { useNavigate } from "react-router-dom"
import { LogoutButton } from "./LogoutButton"

interface SidebarFooterProps {
  name: string
  plan: string
}

export function SidebarFooter({ name, plan }: SidebarFooterProps) {
  const navigate = useNavigate()

  return (
    <div className="mt-auto border-t border-zinc-800/80 p-3 flex items-center justify-between gap-1.5 bg-zinc-950/20">
      <div className="flex-1 min-w-0">
        <UserProfile name={name} plan={plan} />
      </div>
      <LogoutButton onLogout={() => navigate("/login")} />
    </div>
  )
}
