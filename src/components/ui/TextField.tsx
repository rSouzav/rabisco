import { cn } from '@/lib/cn'
import { commitMask, maskInputMode, type MaskKind } from '@/lib/mask'
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
  mask?: MaskKind
  multiline?: boolean
  trailing?: ReactNode
  className?: string
  heightClass?: string
  inputClassName?: string
  required?: boolean
  error?: string | null
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
  mask,
  multiline = false,
  trailing,
  className,
  heightClass,
  inputClassName,
  required = false,
  error,
}: TextFieldProps) {
  const id = useId()
  const errorId = `${id}-error`

  return (
    <div className={cn('flex w-full flex-col gap-2', className)}>
      <label htmlFor={id} className="text-[12px] tracking-[1px] text-[var(--muted)]">
        {label}
        {required && <span aria-hidden="true"> *</span>}
      </label>
      <div
        className={cn(
          'flex border border-[var(--line)] bg-[var(--surface)] px-3.5 focus-within:border-[var(--bone)]',
          error && 'border-[var(--overdue)] focus-within:border-[var(--overdue)]',
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
              inputMode={inputMode ?? maskInputMode(mask)}
              onChange={(event) => onChange(mask ? commitMask(event.currentTarget, mask) : event.target.value)}
              onBlur={onBlur}
              aria-required={required || undefined}
              aria-invalid={error ? true : undefined}
              aria-describedby={error ? errorId : undefined}
              className={cn(
                'min-w-0 flex-1 bg-transparent text-[16px] text-[var(--bone)] outline-none placeholder:text-[var(--muted)] md:text-[14px]',
                inputClassName,
              )}
            />
            {trailing}
          </>
        )}
      </div>
      {error && (
        <p id={errorId} className="text-[12px] text-[var(--overdue)]">
          {error}
        </p>
      )}
    </div>
  )
}
