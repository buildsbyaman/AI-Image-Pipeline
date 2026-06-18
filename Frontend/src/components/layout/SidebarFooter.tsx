import { UserProfile } from "./UserProfile"
import { useNavigate } from "react-router-dom"
import { LogoutButton } from "./LogoutButton"
import { useAuth } from "../../context/AuthContext"

interface SidebarFooterProps {
  name: string
}

export function SidebarFooter({ name }: SidebarFooterProps) {
  const navigate = useNavigate()
  const { logout } = useAuth()

  const handleLogout = async () => {
    try {
      await logout()
      navigate("/login")
    } catch (error) {
      console.warn("Logout redirect failed:", error);
    }
  }

  return (
    <div className="mt-auto border-t border-zinc-800/80 p-3 flex items-center justify-between gap-1.5 bg-zinc-950/20">
      <div className="flex-1 min-w-0">
        <UserProfile name={name} />
      </div>
      <LogoutButton onLogout={handleLogout} />
    </div>
  )
}

