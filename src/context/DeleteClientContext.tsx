import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { useStudio } from '@/context/StudioContext'
import type { Client } from '@/types/client'
import { AlertTriangle, CheckCircle2, Loader2, Trash2 } from 'lucide-react'
import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from 'react'

type RequestDelete = (client: Client, onDeleted?: () => void) => void

type DeleteState =
  | { step: 'idle' }
  | { step: 'confirm' | 'loading' | 'success'; client: Client }
  | { step: 'error'; client: Client; message: string }

const DeleteClientContext = createContext<RequestDelete | null>(null)

const iconClass = 'size-7'

export function DeleteClientProvider({ children }: { children: ReactNode }) {
  const { deleteClient } = useStudio()
  const [state, setState] = useState<DeleteState>({ step: 'idle' })
  const onDeletedRef = useRef<(() => void) | undefined>(undefined)

  const requestDelete = useCallback<RequestDelete>((client, onDeleted) => {
    onDeletedRef.current = onDeleted
    setState({ step: 'confirm', client })
  }, [])

  const close = useCallback(() => setState({ step: 'idle' }), [])

  async function runDelete(client: Client) {
    setState({ step: 'loading', client })
    const message = await deleteClient(client.id)
    if (message) {
      setState({ step: 'error', client, message })
      return
    }
    onDeletedRef.current?.()
    onDeletedRef.current = undefined
    setState({ step: 'success', client })
  }

  const name = state.step === 'idle' ? '' : state.client.name || 'este cliente'

  return (
    <DeleteClientContext.Provider value={requestDelete}>
      {children}

      <Modal
        open={state.step === 'confirm'}
        title="Excluir cliente?"
        icon={<Trash2 className={`${iconClass} text-[var(--overdue)]`} strokeWidth={1.5} aria-hidden="true" />}
        onClose={close}
        actions={
          <>
            <Button variant="outline" className="h-11" onClick={close}>
              Cancelar
            </Button>
            <Button
              autoFocus
              className="h-11 bg-[var(--overdue)] text-[var(--ink)]"
              onClick={() => state.step === 'confirm' && runDelete(state.client)}
            >
              Excluir
            </Button>
          </>
        }
      >
        <strong className="font-semibold text-[var(--bone)]">{name}</strong> e todas as parcelas vão sair da lista.
        Essa ação não pode ser desfeita.
      </Modal>

      <Modal
        open={state.step === 'loading'}
        title="Excluindo…"
        icon={<Loader2 className={`${iconClass} animate-spin text-[var(--muted)]`} strokeWidth={1.5} aria-hidden="true" />}
      >
        Removendo {name} e as parcelas. Só um instante.
      </Modal>

      <Modal
        open={state.step === 'success'}
        title="Cliente excluído"
        icon={
          <CheckCircle2 className={`${iconClass} text-[var(--status-paid)]`} strokeWidth={1.5} aria-hidden="true" />
        }
        onClose={close}
        actions={
          <Button autoFocus className="h-11" onClick={close}>
            OK
          </Button>
        }
      >
        {name} foi excluído com sucesso.
      </Modal>

      <Modal
        open={state.step === 'error'}
        title="Não deu para excluir"
        icon={<AlertTriangle className={`${iconClass} text-[var(--overdue)]`} strokeWidth={1.5} aria-hidden="true" />}
        onClose={close}
        actions={
          <>
            <Button variant="outline" className="h-11" onClick={close}>
              Fechar
            </Button>
            <Button autoFocus className="h-11" onClick={() => state.step === 'error' && runDelete(state.client)}>
              Tentar de novo
            </Button>
          </>
        }
      >
        {state.step === 'error' ? state.message : null}
      </Modal>
    </DeleteClientContext.Provider>
  )
}

export function useDeleteClient() {
  const context = useContext(DeleteClientContext)
  if (!context) throw new Error('useDeleteClient precisa estar dentro de DeleteClientProvider')
  return context
}
