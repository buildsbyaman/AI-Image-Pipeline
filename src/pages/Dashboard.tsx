import { AppShell } from "@/components/layout/AppShell"
import { MediaFeed } from "@/components/ui/MediaFeed"
import { UploadComposer } from "@/components/ui/UploadComposer"
import { FileUpload } from "@/components/ui/FileUpload"
import { DashboardProvider, useDashboard } from "@/context/DashboardContext"

function DashboardContent() {
  const { jobs, addJob } = useDashboard()

  return (
    <AppShell>
      <div 
        className="flex-1 flex flex-col relative h-full"
        style={{
          background: "radial-gradient(circle at top, rgba(255,255,255,0.03), transparent 40%)"
        }}
      >
        <MediaFeed jobs={jobs} />

        <div className="absolute bottom-0 left-0 right-0 pt-12 pb-4 px-4 bg-gradient-to-t from-[#0F0F12] via-[#0F0F12] to-transparent pointer-events-none">
          <div className="pointer-events-auto">
            <FileUpload onUploadSuccess={(data) => console.log("Uploaded successfully:", data)} />
            <UploadComposer onUpload={addJob} />
          </div>
        </div>
      </div>
    </AppShell>
  )
}

export default function Dashboard() {
  return (
    <DashboardProvider>
      <DashboardContent />
    </DashboardProvider>
  )
}
