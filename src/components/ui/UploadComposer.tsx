import { useState, useRef } from "react"
import { ImagePlus, Send, X } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"

interface UploadComposerProps {
  onUpload: (file: File, prompt: string) => void
}

export function UploadComposer({ onUpload }: UploadComposerProps) {
  const [prompt, setPrompt] = useState("")
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0])
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (selectedFile) {
      onUpload(selectedFile, prompt)
      setPrompt("")
      setSelectedFile(null)
    }
  }

  return (
    <div className="w-full max-w-3xl mx-auto p-4">
      <div className="bg-[#18181B] rounded-2xl border border-zinc-800 shadow-lg shadow-black/20 focus-within:ring-1 focus-within:ring-zinc-700 transition-shadow">
        <AnimatePresence>
          {selectedFile && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              <div className="px-4 pt-4 pb-2 border-b border-zinc-800/50 flex items-center gap-3">
                <div className="relative h-12 w-12 rounded-md overflow-hidden bg-zinc-900 border border-zinc-800 flex-shrink-0">
                  <img 
                    src={URL.createObjectURL(selectedFile)} 
                    alt="Selected" 
                    className="h-full w-full object-cover"
                  />
                  <button 
                    type="button"
                    onClick={() => setSelectedFile(null)}
                    className="absolute top-0.5 right-0.5 p-0.5 bg-black/50 hover:bg-black/80 rounded-full text-white backdrop-blur-sm"
                  >
                    <X size={12} />
                  </button>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-zinc-300 truncate">{selectedFile.name}</p>
                  <p className="text-xs text-zinc-500">Ready to process</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSubmit} className="relative flex items-center min-h-[56px] px-2">
          <input 
            type="file" 
            className="hidden" 
            ref={fileInputRef} 
            accept="image/*"
            onChange={handleFileSelect}
          />
          <button 
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-2 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded-xl transition-colors ml-1"
          >
            <ImagePlus size={20} />
          </button>
          
          <input
            type="text"
            placeholder={selectedFile ? "What would you like to do with this image?" : "Upload an image to get started..."}
            className="flex-1 bg-transparent border-0 px-3 py-3 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-0"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            disabled={!selectedFile}
          />

          <div className="flex items-center gap-1 pr-1">
            <button 
              type="submit"
              disabled={!selectedFile}
              className={cn(
                "p-2 rounded-xl transition-colors",
                selectedFile 
                  ? "bg-zinc-100 text-zinc-900 hover:bg-zinc-300" 
                  : "bg-zinc-800 text-zinc-500 cursor-not-allowed"
              )}
            >
              <Send size={18} className={cn(selectedFile && "translate-x-[-1px] translate-y-[1px]")} />
            </button>
          </div>
        </form>
      </div>
      <div className="text-center mt-3">
        <p className="text-[11px] text-zinc-600">
          AI processing may take a few moments. Do not close the window during generation.
        </p>
      </div>
    </div>
  )
}
