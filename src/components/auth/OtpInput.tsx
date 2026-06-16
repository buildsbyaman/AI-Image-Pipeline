import React, { useRef } from "react"
import { cn } from "@/lib/utils"

interface OtpInputProps {
  value: string[]
  onChange: (value: string[]) => void
  disabled?: boolean
}

export function OtpInput({ value, onChange, disabled }: OtpInputProps) {
  const inputRefs = useRef<HTMLInputElement[]>([])

  const handleOtpChange = (index: number, val: string) => {
    if (isNaN(Number(val))) return

    const newOtp = [...value]
    newOtp[index] = val.substring(val.length - 1)
    onChange(newOtp)

    if (val && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !value[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    } else if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus()
    } else if (e.key === "ArrowRight" && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault()
    if (disabled) return

    const pasteData = e.clipboardData.getData("text").trim()
    if (!/^\d{6}$/.test(pasteData)) return

    const digits = pasteData.split("")
    onChange(digits)
    
    inputRefs.current[5]?.focus()
  }

  return (
    <div className="flex gap-2.5 justify-between">
      {value.map((digit, idx) => (
        <input
          key={idx}
          ref={(el) => {
            if (el) inputRefs.current[idx] = el
          }}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={1}
          value={digit}
          disabled={disabled}
          onChange={(e) => handleOtpChange(idx, e.target.value)}
          onKeyDown={(e) => handleKeyDown(idx, e)}
          onPaste={handlePaste}
          className={cn(
            "w-12 h-12 text-center rounded-xl border border-zinc-800 bg-zinc-900/50 text-white font-semibold text-lg transition-all duration-150 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-400 focus-visible:border-zinc-400 focus-visible:bg-zinc-900/80 disabled:opacity-50",
            digit ? "border-zinc-700 bg-zinc-900" : ""
          )}
        />
      ))}
    </div>
  )
}
