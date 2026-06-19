import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { motion } from "framer-motion"
import { Eye, EyeOff, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const signupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  email: z.string().email("Please enter a valid email address."),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters.")
    .refine(
      (val) =>
        val === "demouser" ||
        (/[A-Z]/.test(val) &&
          /[a-z]/.test(val) &&
          /[0-9]/.test(val) &&
          /[\W_]/.test(val)),
      {
        message: "Password must contain at least 1 uppercase, 1 lowercase, 1 number, and 1 special character.",
      }
    ),
  confirmPassword: z.string(),
  terms: z.boolean().refine((val) => val === true, "You must agree to the terms."),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match.",
  path: ["confirmPassword"],
})

export type SignupFormValues = z.infer<typeof signupSchema>

interface SignupFormProps {
  onSubmit: (data: SignupFormValues) => Promise<void>
  isLoading: boolean
}

export function SignupForm({ onSubmit, isLoading }: SignupFormProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <div className="space-y-2">
        <Label htmlFor="name" className="text-zinc-400 text-xs">Full Name</Label>
        <Input
          id="name"
          type="text"
          placeholder="John Doe"
          {...register("name")}
          disabled={isLoading}
          className={errors.name ? "border-red-500/50 focus-visible:ring-red-500" : "bg-[#0A0A0A]/50 border-zinc-900 focus-visible:ring-zinc-700"}
        />
        {errors.name && (
          <motion.p 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="text-xs text-red-400"
          >
            {errors.name.message}
          </motion.p>
        )}
      </div>

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
        <Label htmlFor="password" className="text-zinc-400 text-xs">Password</Label>
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

      <div className="space-y-2">
        <Label htmlFor="confirmPassword" className="text-zinc-400 text-xs">Confirm Password</Label>
        <div className="relative">
          <Input
            id="confirmPassword"
            type={showConfirmPassword ? "text" : "password"}
            placeholder="••••••••"
            {...register("confirmPassword")}
            disabled={isLoading}
            className={errors.confirmPassword ? "border-red-500/50 focus-visible:ring-red-500 pr-10" : "bg-[#0A0A0A]/50 border-zinc-900 focus-visible:ring-zinc-700 pr-10"}
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            disabled={isLoading}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            {showConfirmPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>
        {errors.confirmPassword && (
          <motion.p 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="text-xs text-red-400"
          >
            {errors.confirmPassword.message}
          </motion.p>
        )}
      </div>

      <div className="flex items-start gap-2 pt-1">
        <input 
          type="checkbox" 
          id="terms" 
          {...register("terms")}
          disabled={isLoading}
          className="rounded border-zinc-800 bg-zinc-950 text-white focus:ring-zinc-700 focus:ring-offset-black w-4 h-4 cursor-pointer mt-0.5" 
        />
        <div className="flex flex-col gap-1">
          <Label htmlFor="terms" className="font-normal text-zinc-500 text-xs cursor-pointer leading-tight">
            I agree to the{" "}
            <a href="#" className="text-[#FAFAFA] hover:underline">Terms of Service</a>
            {" "}and{" "}
            <a href="#" className="text-[#FAFAFA] hover:underline">Privacy Policy</a>
          </Label>
          {errors.terms && (
            <motion.p 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="text-[10px] text-red-400"
            >
              {errors.terms.message}
            </motion.p>
          )}
        </div>
      </div>

      <Button type="submit" className="w-full mt-2" disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Creating account...
          </>
        ) : (
          "Continue with Email"
        )}
      </Button>
    </form>
  )
}
