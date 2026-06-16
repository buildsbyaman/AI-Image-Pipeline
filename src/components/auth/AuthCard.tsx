import React from "react"

interface AuthCardProps {
  title: string
  description?: string
  children: React.ReactNode
  footer?: React.ReactNode
}

export function AuthCard({ title, description, children, footer }: AuthCardProps) {
  return (
    <div className="bg-[#111113] border border-zinc-800 rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.35)] p-8 flex flex-col gap-6">
      <div className="flex flex-col gap-2 text-center">
        <h1 className="text-xl font-semibold text-[#FAFAFA] tracking-tight">
          {title}
        </h1>
        {description && (
          <p className="text-sm text-[#A1A1AA]">
            {description}
          </p>
        )}
      </div>

      {children}

      {footer && (
        <div className="text-center text-sm text-[#A1A1AA] mt-2">
          {footer}
        </div>
      )}
    </div>
  )
}
