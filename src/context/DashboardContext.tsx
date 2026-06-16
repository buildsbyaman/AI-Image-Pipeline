import React, { createContext, useContext, useState } from "react"
import type { Job } from "@/components/ui/JobCard"
import { useAuth } from "./AuthContext"

interface UserProfileData {
  name: string
  email: string
  plan: string
}

interface DashboardContextType {
  jobs: Job[]
  addJob: (file: File, prompt: string) => void
  user: UserProfileData
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined)

export function DashboardProvider({ children }: { children: React.ReactNode }) {
  const [jobs, setJobs] = useState<Job[]>([])
  const { user: authUser } = useAuth()

  const user: UserProfileData = {
    name: authUser ? `${authUser.firstName} ${authUser.lastName}`.trim() : "Guest",
    email: authUser?.email || "",
    plan: "Pro Plan"
  }

  const addJob = (file: File, prompt: string) => {
    const newJob: Job = {
      id: Math.random().toString(36).substring(7),
      originalImage: URL.createObjectURL(file),
      prompt,
      status: "processing",
      createdAt: new Date(),
    }
    
    setJobs(prev => [...prev, newJob])

    setTimeout(() => {
      setJobs(prev => prev.map(job => 
        job.id === newJob.id 
          ? { ...job, status: "completed", resultImage: job.originalImage }
          : job
      ))
    }, 4000)
  }

  return (
    <DashboardContext.Provider value={{ jobs, addJob, user }}>
      {children}
    </DashboardContext.Provider>
  )
}

export function useDashboard() {
  const context = useContext(DashboardContext)
  if (!context) {
    throw new Error("useDashboard must be used within a DashboardProvider")
  }
  return context
}
