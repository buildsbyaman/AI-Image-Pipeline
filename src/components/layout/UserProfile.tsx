interface UserProfileProps {
  name: string
  plan: string
  onClick?: () => void
}

export function UserProfile({ name, plan, onClick }: UserProfileProps) {
  return (
    <button 
      onClick={onClick}
      className="flex items-center gap-2.5 py-1.5 px-2 text-sm font-medium text-zinc-300 hover:bg-zinc-800/30 rounded-lg transition-colors w-full min-w-0 text-left"
    >
      <div className="h-7 w-7 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold flex-shrink-0 text-xs">
        {name.charAt(0).toUpperCase()}
      </div>
      <div className="flex-1 min-w-0">
        <div className="truncate text-xs font-semibold">{name}</div>
        <div className="text-[10px] text-zinc-500 truncate">{plan}</div>
      </div>
    </button>
  )
}
