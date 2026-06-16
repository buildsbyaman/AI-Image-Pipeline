import { useState } from "react"
import { AuthLayout } from "@/components/auth/AuthLayout"
import { AuthCard } from "@/components/auth/AuthCard"
import { SocialAuth } from "@/components/auth/SocialAuth"
import { LoginForm, type LoginFormValues } from "@/components/auth/LoginForm"
import { useAuth } from "@/context/AuthContext"
import { useToast } from "@/context/ToastContext"
import { useNavigate } from "react-router-dom"

export default function Login() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { login } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()

  const handleLoginSubmit = async (data: LoginFormValues) => {
    setIsLoading(true)
    setError(null)
    try {
      await login(data.email, data.password)
      toast("Welcome back!", "success")
      navigate("/dashboard")
    } catch (err: any) {
      const message = err.message || "Failed to log in. Please try again."
      setError(message)
      toast(message, "error")
    } finally {
      setIsLoading(false)
    }
  }

  const footer = (
    <>
      Don't have an account?{" "}
      <button 
        type="button" 
        onClick={() => navigate("/signup")}
        className="text-[#FAFAFA] hover:text-zinc-300 transition-colors font-medium hover:underline focus:outline-none"
      >
        Sign up
      </button>
    </>
  )

  return (
    <AuthLayout className="max-w-[680px]">
      <AuthCard
        title="Log in"
        description="Brainstorm in chat, build in pipeline"
        footer={footer}
      >


        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center mt-2">
          <div className="md:pr-8 md:border-r md:border-zinc-800 flex flex-col gap-4">
            <LoginForm 
              onSubmit={handleLoginSubmit} 
              onNavigateToOtp={() => navigate("/otp")}
              isLoading={isLoading} 
            />
          </div>

          <div className="flex flex-col gap-4">
            <p className="text-zinc-400 text-xs text-center md:text-left mb-1">Or continue with</p>
            <SocialAuth />
          </div>
        </div>
      </AuthCard>
    </AuthLayout>
  )
}
