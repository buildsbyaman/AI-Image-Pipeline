import { useState } from "react"
import { AuthLayout } from "@/components/auth/AuthLayout"
import { AuthCard } from "@/components/auth/AuthCard"
import { LoginForm, type LoginFormValues } from "@/components/auth/LoginForm"
import { useAuth } from "@/context/AuthContext"
import { useToast } from "@/context/ToastContext"
import { useNavigate } from "react-router-dom"

export default function Login() {
  const [isLoading, setIsLoading] = useState(false)
  const { login } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()

  const handleLoginSubmit = async (data: LoginFormValues) => {
    setIsLoading(true)
    try {
      await login(data.email, data.password)
      toast("Welcome back!", "success")
      navigate("/dashboard")
    } catch (err: any) {
      const message = err.message || "Failed to log in. Please try again."
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
    <AuthLayout className="max-w-[420px]">
      <AuthCard
        title="Log in"
        description="Brainstorm in chat, build in pipeline"
        footer={footer}
      >
        <LoginForm 
          onSubmit={handleLoginSubmit} 
          isLoading={isLoading} 
        />
      </AuthCard>
    </AuthLayout>
  )
}

