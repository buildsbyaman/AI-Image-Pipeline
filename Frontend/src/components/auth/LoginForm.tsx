import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { motion } from "framer-motion"
import { Eye, EyeOff, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address."),
  password: z.string().min(8, "Password must be at least 8 characters."),
})

export type LoginFormValues = z.infer<typeof loginSchema>

interface LoginFormProps {
  onSubmit: (data: LoginFormValues) => Promise<void>
  isLoading: boolean
}

export function LoginForm({ onSubmit, isLoading }: LoginFormProps) {
  const [showPassword, setShowPassword] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <div className="space-y-2">
        <Label htmlFor="email" className="text-zinc-400 text-xs">Email Address</Label>
        <Input
          id="email"
          type="email"
          placeholder="name@example.com"
          {...register("email")}
          disabled={isLoading}
          className={errors.email ? "border-red-500/50 focus-visible:ring-red-500" : "bg-[#0A0A0A]/50 border-zinc-900 focus-visible:ring-zinc-700"}
        />
        {errors.email && (
          <motion.p 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="text-xs text-red-400"
          >
            {errors.email.message}
          </motion.p>
        )}
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="password" className="text-zinc-400 text-xs">Password</Label>
        </div>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            {...register("password")}
            disabled={isLoading}
            className={errors.password ? "border-red-500/50 focus-visible:ring-red-500 pr-10" : "bg-[#0A0A0A]/50 border-zinc-900 focus-visible:ring-zinc-700 pr-10"}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            disabled={isLoading}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>
        {errors.password && (
          <motion.p 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="text-xs text-red-400"
          >
            {errors.password.message}
          </motion.p>
        )}
      </div>

      <div className="flex items-center gap-2 pt-1">
        <input 
          type="checkbox" 
          id="remember" 
          disabled={isLoading}
          className="rounded border-zinc-800 bg-zinc-950 text-white focus:ring-zinc-700 focus:ring-offset-black w-4 h-4 cursor-pointer" 
        />
        <Label htmlFor="remember" className="font-normal text-zinc-500 text-xs cursor-pointer">
          Remember me for 30 days
        </Label>
      </div>

      <div className="flex flex-col gap-2">
        <Button type="submit" className="w-full mt-2" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Signing in...
            </>
          ) : (
            "Continue with Email"
          )}
        </Button>
      </div>
    </form>

  )
}
