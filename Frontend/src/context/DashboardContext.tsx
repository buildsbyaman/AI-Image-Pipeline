import React, { createContext, useContext } from "react"
import type { Job } from "@/api/jobs"
import { useAuth } from "./AuthContext"
import { useJobs, useUploadJob } from "@/hooks/useJobs"

interface UserProfileData {
  name: string
  email: string
}

interface DashboardContextType {
  jobs: Job[]
  isLoadingJobs: boolean
  addJob: (file: File) => Promise<{ jobId: string, status: string }>
  user: UserProfileData
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined)

export function DashboardProvider({ children }: { children: React.ReactNode }) {
  const { user: authUser } = useAuth()
  const { data: jobs = [], isLoading: isLoadingJobs } = useJobs()
  const { mutateAsync: uploadJobAsync } = useUploadJob()

  const user: UserProfileData = {
    name: authUser ? `${(authUser as any).firstName || ''} ${(authUser as any).lastName || ''}`.trim() : "Guest",
    email: (authUser as any)?.email || ""
  }

  const addJob = async (file: File) => {
    return await uploadJobAsync(file)
  }

  return (
    <DashboardContext.Provider value={{ jobs, isLoadingJobs, addJob, user }}>
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
