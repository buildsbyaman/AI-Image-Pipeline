import { useState } from "react"
import { AuthLayout } from "@/components/auth/AuthLayout"
import { AuthCard } from "@/components/auth/AuthCard"
import { SocialAuth } from "@/components/auth/SocialAuth"
import { SignupForm, type SignupFormValues } from "@/components/auth/SignupForm"
import { useAuth } from "@/context/AuthContext"
import { useToast } from "@/context/ToastContext"
import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"

export default function Signup() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { signup } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()

  const handleSignupSubmit = async (data: SignupFormValues) => {
    setIsLoading(true)
    setError(null)
    try {
      await signup(data.email, data.name, data.password)
      toast("Account created successfully!", "success")
      navigate("/dashboard")
    } catch (err: any) {
      const message = err.message || "Failed to create account. Please try again."
      setError(message)
      toast(message, "error")
    } finally {
      setIsLoading(false)
    }
  }

  const footer = (
    <>
      Already have an account?{" "}
      <button 
        type="button" 
        onClick={() => navigate("/login")}
        className="text-[#FAFAFA] hover:text-zinc-300 transition-colors font-medium hover:underline focus:outline-none"
      >
        Log in
      </button>
    </>
  )

  return (
    <AuthLayout className="max-w-[760px]">
      <AuthCard
        title="Create your account"
        description="Get started for free"
        footer={footer}
      >


        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start mt-2">
          <div className="md:pr-8 md:border-r md:border-zinc-800 flex flex-col gap-4">
            <SignupForm 
              onSubmit={handleSignupSubmit} 
              isLoading={isLoading} 
            />
          </div>

          <div className="flex flex-col gap-4 h-full justify-center">
            <p className="text-zinc-400 text-xs text-center md:text-left mb-1">Or continue with</p>
            <SocialAuth />
          </div>
        </div>
      </AuthCard>
    </AuthLayout>
  )
}
