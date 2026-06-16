import { useState } from "react"
import { AuthLayout } from "@/components/auth/AuthLayout"
import { AuthCard } from "@/components/auth/AuthCard"
import { SocialAuth } from "@/components/auth/SocialAuth"
import { SignupForm, type SignupFormValues } from "@/components/auth/SignupForm"

import { useNavigate } from "react-router-dom"

export default function Signup() {
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()

  const handleSignupSubmit = async (data: SignupFormValues) => {
    setIsLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 1500))
    console.log("Signed up:", data)
    setIsLoading(false)
    navigate("/login")
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
