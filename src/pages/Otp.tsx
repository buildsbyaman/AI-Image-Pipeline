import { useState } from "react"
import { ArrowLeft } from "lucide-react"

import { AuthLayout } from "@/components/auth/AuthLayout"
import { AuthCard } from "@/components/auth/AuthCard"
import { OtpRequestForm } from "@/components/auth/OtpRequestForm"
import { OtpVerificationForm } from "@/components/auth/OtpVerificationForm"

import { useNavigate } from "react-router-dom"

export default function Otp() {
  const [step, setStep] = useState<"send" | "verify">("send")
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()

  const handleSendOtpSubmit = async (targetEmail: string) => {
    setIsLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 1500))
    setEmail(targetEmail)
    setIsLoading(false)
    setStep("verify")
  }

  const handleVerifyOtpSubmit = async (code: string) => {
    setIsLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 1500))
    console.log("Verified OTP:", code, "for:", email)
    setIsLoading(false)
    alert("Verification successful!")
    navigate("/dashboard")
  }

  const handleResendOtp = async () => {
    await new Promise((resolve) => setTimeout(resolve, 1000))
    console.log("Resent OTP to:", email)
  }

  const footer = (
    <button 
      type="button" 
      onClick={() => navigate("/login")}
      className="inline-flex items-center gap-2 text-xs text-[#A1A1AA] hover:text-[#FAFAFA] transition-colors focus:outline-none hover:underline"
    >
      <ArrowLeft className="w-3 h-3" />
      Back to login
    </button>
  )

  return (
    <AuthLayout className="max-w-[400px]">
      <AuthCard
        title={step === "send" ? "Sign in with passcode" : "Verify code"}
        description={
          step === "send"
            ? "We will send a 6-digit one-time passcode to your email."
            : "Please check your inbox for the passcode."
        }
        footer={footer}
      >
        {step === "send" ? (
          <OtpRequestForm 
            onSubmit={handleSendOtpSubmit} 
            isLoading={isLoading} 
          />
        ) : (
          <OtpVerificationForm
            email={email}
            onSubmit={handleVerifyOtpSubmit}
            onResend={handleResendOtp}
            isLoading={isLoading}
          />
        )}
      </AuthCard>
    </AuthLayout>
  )
}
