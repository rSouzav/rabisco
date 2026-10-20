import { cn } from '@/lib/cn'
import { useId, type ReactNode } from 'react'

type TextFieldProps = {
  label: string
  value: string
  onChange: (value: string) => void
  onBlur?: () => void
  type?: 'text' | 'email' | 'password'
  autoComplete?: string
  placeholder?: string
  inputMode?: 'text' | 'decimal' | 'numeric' | 'email' | 'tel'
  multiline?: boolean
  trailing?: ReactNode
  className?: string
  heightClass?: string
  inputClassName?: string
}

export function TextField({
  label,
  value,
  onChange,
  onBlur,
  type = 'text',
  autoComplete,
  placeholder,
  inputMode,
  multiline = false,
  trailing,
  className,
  heightClass,
  inputClassName,
}: TextFieldProps) {
  const id = useId()

  return (
    <div className={cn('flex w-full flex-col gap-2', className)}>
      <label htmlFor={id} className="text-[12px] tracking-[1px] text-[var(--muted)]">
        {label}
      </label>
      <div
        className={cn(
          'flex border border-[var(--line)] bg-[var(--surface)] px-3.5 focus-within:border-[var(--bone)]',
          multiline ? 'items-start py-3.5' : 'items-center',
          heightClass ?? (multiline ? 'h-24' : 'h-12'),
        )}
      >
        {multiline ? (
          <textarea
            id={id}
            value={value}
            placeholder={placeholder}
            onChange={(event) => onChange(event.target.value)}
            onBlur={onBlur}
            className={cn(
              'h-full w-full resize-none bg-transparent text-[16px] leading-[1.45] text-[var(--bone)] outline-none placeholder:text-[var(--muted)] md:text-[14px]',
              inputClassName,
            )}
          />
        ) : (
          <>
            <input
              id={id}
              type={type}
              value={value}
              autoComplete={autoComplete}
              placeholder={placeholder}
              inputMode={inputMode}
              onChange={(event) => onChange(event.target.value)}
              onBlur={onBlur}
              className={cn(
                'min-w-0 flex-1 bg-transparent text-[16px] text-[var(--bone)] outline-none placeholder:text-[var(--muted)] md:text-[14px]',
                inputClassName,
              )}
            />
            {trailing}
          </>
        )}
      </div>
    </div>
  )
}
