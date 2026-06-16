import React from "react"
import { motion } from "framer-motion"
import { Command } from "lucide-react"
import { cn } from "@/lib/utils"

interface AuthLayoutProps {
  children: React.ReactNode
  className?: string
}

export function AuthLayout({ children, className = "max-w-[400px]" }: AuthLayoutProps) {
  return (
    <div className="min-h-screen w-full flex bg-[#000000] relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-white/[0.03] blur-[80px] rounded-full pointer-events-none" />

      <div className="flex-1 flex flex-col justify-center items-center p-6 relative z-10">
        
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className={cn("w-full z-10 flex flex-col gap-6", className)}
        >
          <div className="flex justify-center mb-2">
            <Command className="w-8 h-8 text-white" />
          </div>

          {children}
        </motion.div>
      </div>
    </div>
  )
}
