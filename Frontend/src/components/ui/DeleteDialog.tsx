import { useEffect, useState } from "react"
import { Button } from "./button"
import { Trash2 } from "lucide-react"

interface DeleteDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title?: string
  description?: string
  confirmText?: string
  cancelText?: string
  isDeleting?: boolean
}

export function DeleteDialog({
  isOpen,
  onClose,
  onConfirm,
  title = "Delete job?",
  description = "Are you sure you want to delete this job and its processed files? This action cannot be undone.",
  confirmText = "Delete job",
  cancelText = "Cancel",
  isDeleting = false
}: DeleteDialogProps) {
  const [shouldRender, setShouldRender] = useState(isOpen)
  const [isAnimatedIn, setIsAnimatedIn] = useState(false)

  useEffect(() => {
    let timer: any
    if (isOpen) {
      setShouldRender(true)
      // Prevent body scrolling when dialog is open
      document.body.style.overflow = "hidden"
      // Small timeout to allow the browser to register the initial state before transition
      timer = setTimeout(() => {
        setIsAnimatedIn(true)
      }, 10)
    } else {
      setIsAnimatedIn(false)
      timer = setTimeout(() => {
        setShouldRender(false)
      }, 200)
      document.body.style.overflow = "unset"
    }
    return () => clearTimeout(timer)
  }, [isOpen])

  // Handle ESC key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose()
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isOpen, onClose])

  if (!shouldRender) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/60 backdrop-blur-[2px] transition-opacity duration-200 ease-out ${
          isAnimatedIn ? "opacity-100" : "opacity-0"
        }`}
        onClick={onClose}
      />

      {/* Dialog box */}
      <div
        className={`relative w-full max-w-[440px] bg-[#1c1c1f] border border-zinc-800 rounded-xl p-6 shadow-2xl transition-all duration-200 ease-out transform ${
          isAnimatedIn ? "scale-100 opacity-100 translate-y-0" : "scale-95 opacity-0 translate-y-2"
        }`}
      >
        <div className="flex items-start gap-4">
          <div className="p-3 bg-red-950/30 rounded-lg border border-red-900/30 text-red-400">
            <Trash2 size={20} />
          </div>
          <div className="flex-1 space-y-1.5">
            <h3 className="text-base font-semibold text-zinc-100 tracking-tight">
              {title}
            </h3>
            <p className="text-sm text-zinc-400 leading-relaxed">
              {description}
            </p>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            disabled={isDeleting}
            className="text-zinc-400 hover:text-zinc-200 px-4 py-2 hover:bg-zinc-800/50"
          >
            {cancelText}
          </Button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="px-4 py-2 text-sm font-medium bg-red-600 hover:bg-red-500 text-white rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_1px_2px_rgba(0,0,0,0.05)]"
          >
            {isDeleting ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Deleting...
              </>
            ) : (
              confirmText
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
