interface LogoProps {
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

export function Logo({ className = '', size = 'md' }: LogoProps) {
  const sizeClasses = {
    sm: 'h-6',
    md: 'h-8',
    lg: 'h-10',
  }

  return (
    <div className={`flex items-center ${className}`}>
      {/* Logo Text */}
      <div className="flex flex-col">
        <span className="bg-gradient-to-r from-zinc-900 via-zinc-700 to-zinc-900 bg-clip-text text-xl font-bold leading-none tracking-tight text-transparent dark:from-zinc-50 dark:via-zinc-300 dark:to-zinc-50">
          DAR
        </span>
        <span className="text-[10px] font-medium leading-none text-zinc-500 dark:text-zinc-400">
          Daily Reports
        </span>
      </div>
    </div>
  )
}
