import { useEffect, useId, type ReactNode } from 'react'

type ModalProps = {
  open: boolean
  title: string
  icon?: ReactNode
  children?: ReactNode
  actions?: ReactNode
  onClose?: () => void
}

export function Modal({ open, title, icon, children, actions, onClose }: ModalProps) {
  const titleId = useId()

  useEffect(() => {
    if (!open || !onClose) return
    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose?.()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 px-4 py-4 md:items-center"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(event) => event.stopPropagation()}
        className="flex w-full max-w-[420px] flex-col gap-5 border border-[var(--line)] bg-[var(--surface)] p-6"
      >
        <div className="flex flex-col gap-3">
          {icon}
          <h2 id={titleId} className="font-display text-[24px] leading-tight">
            {title}
          </h2>
          {children && <div className="text-[14px] leading-[1.5] text-[var(--muted)]">{children}</div>}
        </div>
        {actions && <div className="flex flex-col-reverse gap-2.5 md:flex-row md:justify-end">{actions}</div>}
      </div>
    </div>
  )
}
