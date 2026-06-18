import { useState } from "react"
import { AuthLayout } from "@/components/auth/AuthLayout"
import { AuthCard } from "@/components/auth/AuthCard"
import { SignupForm, type SignupFormValues } from "@/components/auth/SignupForm"
import { useAuth } from "@/context/AuthContext"
import { useToast } from "@/context/ToastContext"
import { useNavigate } from "react-router-dom"

export default function Signup() {
  const [isLoading, setIsLoading] = useState(false)
  const { signup } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()

  const handleSignupSubmit = async (data: SignupFormValues) => {
    setIsLoading(true)
    try {
      await signup(data.email, data.name, data.password)
      toast("Account created successfully!", "success")
      navigate("/dashboard")
    } catch (err: any) {
      const message = err.message || "Failed to create account. Please try again."
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
    <AuthLayout className="max-w-[420px]">
      <AuthCard
        title="Create your account"
        description="Get started for free"
        footer={footer}
      >
        <SignupForm 
          onSubmit={handleSignupSubmit} 
          isLoading={isLoading} 
        />
      </AuthCard>
    </AuthLayout>
  )
}

