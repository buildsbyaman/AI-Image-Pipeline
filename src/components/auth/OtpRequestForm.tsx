import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { motion } from "framer-motion"
import { Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const sendOtpSchema = z.object({
  email: z.string().email("Please enter a valid email address."),
})

type SendOtpFormValues = z.infer<typeof sendOtpSchema>

interface OtpRequestFormProps {
  onSubmit: (email: string) => Promise<void>
  isLoading: boolean
}

export function OtpRequestForm({ onSubmit, isLoading }: OtpRequestFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SendOtpFormValues>({
    resolver: zodResolver(sendOtpSchema),
  })

  const handleFormSubmit = async (data: SendOtpFormValues) => {
    await onSubmit(data.email)
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="flex flex-col gap-4">
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

      <Button type="submit" className="w-full mt-2" disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Sending code...
          </>
        ) : (
          "Send Passcode"
        )}
      </Button>
    </form>
  )
}
