import { motion } from "framer-motion"
import { Upload, Cpu, Sparkles, Shield, ArrowRight } from "lucide-react"

export function WelcomeScreen() {
  return (
    <div className="flex-1 flex items-center justify-center p-6 md:p-8 h-full max-w-4xl mx-auto w-full select-none overflow-y-auto">
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="flex flex-col items-center text-center space-y-8 py-8"
      >
        <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-zinc-100 max-w-2xl leading-tight">
          Analyze images with AI
        </h2>

        <p className="text-base md:text-lg leading-relaxed text-zinc-400 max-w-2xl">
          Analyze images with AI-powered captioning, object detection, and safety moderation in a scalable processing pipeline.
        </p>

        <div className="w-full max-w-2xl border-t border-zinc-800/60 pt-8 mt-2">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-4">
            <div className="flex items-center gap-2.5 text-xs font-medium text-zinc-500">
              <div className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-800/80 text-zinc-400">
                <Upload size={14} />
              </div>
              <span>Upload</span>
            </div>
            <ArrowRight size={12} className="hidden sm:block text-zinc-700" />
            <div className="flex items-center gap-2.5 text-xs font-medium text-zinc-500">
              <div className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-800/80 text-zinc-400">
                <Cpu size={14} />
              </div>
              <span>Queue</span>
            </div>
            <ArrowRight size={12} className="hidden sm:block text-zinc-700" />
            <div className="flex items-center gap-2.5 text-xs font-medium text-zinc-500">
              <div className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-800/80 text-zinc-400 animate-pulse">
                <Sparkles size={14} />
              </div>
              <span>AI Processing</span>
            </div>
            <ArrowRight size={12} className="hidden sm:block text-zinc-700" />
            <div className="flex items-center gap-2.5 text-xs font-medium text-zinc-500">
              <div className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-800/80 text-zinc-400">
                <Shield size={14} />
              </div>
              <span>Results</span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
