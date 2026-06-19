import React, { createContext, useContext, useState, useEffect } from "react"
import { useAuth } from "./AuthContext"
import { sseService } from "../services/sse"
import { useQueryClient } from "@tanstack/react-query"
import toast from "react-hot-toast"

export interface Notification {
  id: string
  title: string
  message: string
  read: boolean
  createdAt: string
  jobId?: string
}

interface NotificationContextType {
  notifications: Notification[]
  unreadCount: number
  markAsRead: (id: string) => void
  clearAll: () => void
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient()
  const { user } = useAuth()
  const [notifications, setNotifications] = useState<Notification[]>([])

  const storageKey = user ? `notifications_${(user as any).id || (user as any).userId}` : null

  // Load from localStorage on mount/user change
  useEffect(() => {
    if (storageKey) {
      const stored = localStorage.getItem(storageKey)
      if (stored) {
        try {
          setNotifications(JSON.parse(stored))
        } catch (e) {
          console.error("Failed to parse stored notifications", e)
        }
      } else {
        setNotifications([])
      }
    } else {
      setNotifications([])
    }
  }, [storageKey])

  // Save to localStorage when notifications change
  const saveNotifications = (newNotifs: Notification[]) => {
    setNotifications(newNotifs)
    if (storageKey) {
      localStorage.setItem(storageKey, JSON.stringify(newNotifs))
    }
  }

  useEffect(() => {
    if (!user) {
      sseService.disconnect()
      return
    }

    sseService.connect((message) => {
      // Invalidate queries so that dashboard/details update in real-time
      queryClient.invalidateQueries({ queryKey: ["jobs"] })
      if (message.jobId) {
        queryClient.invalidateQueries({ queryKey: ["job", message.jobId] })
      }

      // Check if this is a terminal job event
      const titleLower = message.title?.toLowerCase() || ""
      const isSuccess = titleLower.includes("successfully")
      const isFailed = titleLower.includes("failed")
      const isFlagged = titleLower.includes("flagged")
      const isTerminal = isSuccess || isFailed || isFlagged

      if (isTerminal) {
        const pathname = window.location.pathname
        const isViewingJob = message.jobId && pathname.includes(`/jobs/${message.jobId}`)

        // Only show notification/toast if the job page is NOT currently opened
        if (!isViewingJob) {
          const newNotif: Notification = {
            id: message.notificationId || Math.random().toString(36).substring(7),
            title: message.title || "Job Update",
            message: message.message || "",
            read: false,
            createdAt: new Date().toISOString(),
            jobId: message.jobId
          }

          // Add to notifications state and persist
          const updated = [newNotif, ...notifications]
          saveNotifications(updated)

          // Trigger toast
          const toastMsg = message.message || message.title || "Pipeline update"
          if (isFailed) {
            toast.error(toastMsg, { duration: 6000 })
          } else if (isFlagged) {
            toast(toastMsg, { duration: 5000, icon: "⚠️" })
          } else {
            toast.success(toastMsg, { duration: 4000 })
          }
        }
      }
    })

    return () => {
      sseService.disconnect()
    }
  }, [user, queryClient, notifications, storageKey])

  const markAsRead = (id: string) => {
    const updated = notifications.map((n) => (n.id === id ? { ...n, read: true } : n))
    saveNotifications(updated)
  }

  const clearAll = () => {
    saveNotifications([])
  }

  const unreadCount = notifications.filter((n) => !n.read).length

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, markAsRead, clearAll }}>
      {children}
    </NotificationContext.Provider>
  )
}

export function useLocalNotifications() {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error("useLocalNotifications must be used within a NotificationProvider")
  }
  return context
}
