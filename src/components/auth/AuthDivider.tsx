export function AuthDivider() {
  return (
    <div className="relative my-2">
      <div className="absolute inset-0 flex items-center">
        <div className="w-full border-t border-zinc-800"></div>
      </div>
      <div className="relative flex justify-center text-xs uppercase">
        <span className="bg-[#111113] px-3 text-[#71717A] tracking-wider text-[10px]">
          OR
        </span>
      </div>
    </div>
  )
}
