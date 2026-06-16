import { useEffect, useRef } from "react"
import { WelcomeScreen } from "./WelcomeScreen"
import type { Job } from "./JobCard"
import { JobCard } from "./JobCard"

interface MediaFeedProps {
  jobs: Job[]
}

export function MediaFeed({ jobs }: MediaFeedProps) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [jobs])

  if (jobs.length === 0) {
    return <WelcomeScreen />
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:px-8 max-w-5xl mx-auto w-full">
      <div className="space-y-6 pb-24">
        {jobs.map((job) => (
          <JobCard key={job.id} job={job} />
        ))}
        <div ref={bottomRef} />
      </div>
    </div>
  )
}
