import { cn } from '@/lib/cn'
import { ChevronDown } from 'lucide-react'
import { useId } from 'react'

type SelectFieldProps = {
  label: string
  value: string
  options: readonly string[]
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  heightClass?: string
}

export function SelectField({
  label,
  value,
  options,
  onChange,
  placeholder = 'Selecione',
  className,
  heightClass,
}: SelectFieldProps) {
  const id = useId()

  return (
    <div className={cn('flex w-full flex-col gap-2', className)}>
      <label htmlFor={id} className="text-[12px] tracking-[1px] text-[var(--muted)]">
        {label}
      </label>
      <div
        className={cn(
          'relative flex items-center border border-[var(--line)] bg-[var(--surface)] focus-within:border-[var(--bone)]',
          heightClass ?? 'h-12',
        )}
      >
        <select
          id={id}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className={cn(
            'h-full w-full appearance-none bg-transparent pl-3.5 pr-9 text-[16px] outline-none md:text-[14px]',
            value ? 'text-[var(--bone)]' : 'text-[var(--muted)]',
          )}
        >
          <option value="" className="bg-[var(--surface)]">
            {placeholder}
          </option>
          {options.map((option) => (
            <option key={option} value={option} className="bg-[var(--surface)] text-[var(--bone)]">
              {option}
            </option>
          ))}
        </select>
        <ChevronDown
          className="pointer-events-none absolute right-3 size-4 text-[var(--muted)]"
          strokeWidth={1.75}
          aria-hidden="true"
        />
      </div>
    </div>
  )
}
