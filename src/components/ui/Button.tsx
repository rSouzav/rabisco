import { cn } from '@/lib/cn'
import type { ButtonHTMLAttributes } from 'react'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'outline'
}

export function Button({ variant = 'primary', className, type = 'button', ...props }: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        'inline-flex items-center justify-center gap-2 px-4 text-[14px] transition-colors focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-[var(--bone)] disabled:cursor-not-allowed disabled:opacity-50',
        variant === 'primary'
          ? 'bg-[var(--bone)] font-semibold text-[var(--ink)] hover:opacity-90'
          : 'border border-[var(--line)] font-normal text-[var(--bone)] hover:bg-[var(--nav)]',
        className,
      )}
      {...props}
    />
  )
}
