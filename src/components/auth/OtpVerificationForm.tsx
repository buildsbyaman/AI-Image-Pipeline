import { useState, useEffect } from "react"
import { Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { OtpInput } from "./OtpInput"

interface OtpVerificationFormProps {
  email: string
  onSubmit: (code: string) => Promise<void>
  onResend: () => Promise<void>
  isLoading: boolean
}

export function OtpVerificationForm({ email, onSubmit, onResend, isLoading }: OtpVerificationFormProps) {
  const [otp, setOtp] = useState<string[]>(Array(6).fill(""))
  const [timer, setTimer] = useState(30)
  const [isResending, setIsResending] = useState(false)

  useEffect(() => {
    let interval: any
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [timer])

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    const code = otp.join("")
    if (code.length < 6) return
    await onSubmit(code)
  }

  const handleResendClick = async () => {
    if (timer > 0 || isResending) return
    setIsResending(true)
    await onResend()
    setTimer(30)
    setIsResending(false)
  }

  return (
    <form onSubmit={handleVerify} className="flex flex-col gap-6">
      <div className="space-y-3">
        <Label className="text-zinc-400 text-xs flex justify-center">
          Enter code sent to <span className="text-[#FAFAFA] font-medium ml-1">{email}</span>
        </Label>
        <OtpInput value={otp} onChange={setOtp} disabled={isLoading} />
      </div>

      <div className="flex flex-col gap-4">
        <Button 
          type="submit" 
          className="w-full" 
          disabled={isLoading || otp.join("").length < 6}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Verifying...
            </>
          ) : (
            "Verify & Sign In"
          )}
        </Button>

        <div className="text-center">
          <button
            type="button"
            onClick={handleResendClick}
            disabled={timer > 0 || isResending}
            className={`text-xs transition-colors focus:outline-none ${
              timer > 0 
                ? "text-zinc-600 cursor-not-allowed" 
                : "text-zinc-400 hover:text-white hover:underline"
            }`}
          >
            {isResending ? (
              <Loader2 className="inline mr-1.5 h-3 w-3 animate-spin" />
            ) : null}
            {timer > 0 ? `Resend code in ${timer}s` : "Resend code"}
          </button>
        </div>
      </div>
    </form>
  )
}
