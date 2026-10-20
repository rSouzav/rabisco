import { ClientFileForm } from '@/components/ficha/ClientFileForm'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { useDeleteClient } from '@/context/DeleteClientContext'
import { useStudio } from '@/context/StudioContext'
import type { Client } from '@/types/client'
import { AlertTriangle, CheckCircle2, Loader2 } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'

type SaveState =
  | { step: 'idle' }
  | { step: 'loading'; client: Client }
  | { step: 'success'; client: Client; created: boolean }
  | { step: 'error'; client: Client | null; message: string }

export function ClientFilePage() {
  const { clientId } = useParams()
  const navigate = useNavigate()
  const { clients, clientsLoading, saveClient } = useStudio()
  const requestDelete = useDeleteClient()
  const [saveState, setSaveState] = useState<SaveState>({ step: 'idle' })
  const isNew = clientId === 'novo'
  const client = clients.find((item) => item.id === clientId) ?? null

  async function runSave(next: Client) {
    if (!next.name) {
      setSaveState({ step: 'error', client: null, message: 'Informe o nome do cliente antes de salvar.' })
      return 'Informe o nome do cliente.'
    }
    setSaveState({ step: 'loading', client: next })
    const message = await saveClient(next)
    if (message) {
      setSaveState({ step: 'error', client: next, message })
      return message
    }
    setSaveState({ step: 'success', client: next, created: isNew })
    if (isNew) navigate(`/clientes/${next.id}`, { replace: true })
    return null
  }

  const closeSave = () => setSaveState({ step: 'idle' })

  if (!isNew && !client) {
    if (clientsLoading) {
      return <p className="px-4 py-10 text-[14px] text-[var(--muted)] md:px-9">Carregando…</p>
    }
    return (
      <div className="flex flex-col gap-3 px-4 py-10 md:px-9">
        <h1 className="font-display text-[32px]">Cliente não encontrado</h1>
        <Link to="/clientes" className="text-[14px] text-[var(--muted)]">
          Voltar para clientes
        </Link>
      </div>
    )
  }

  return (
    <>
      <ClientFileForm
        key={client?.id ?? 'novo'}
        client={client}
        onCancel={() => navigate('/clientes')}
        onSave={runSave}
        onDelete={() => {
          if (!client) {
            navigate('/clientes')
            return
          }
          requestDelete(client, () => navigate('/clientes'))
        }}
      />

      <Modal
        open={saveState.step === 'loading'}
        title="Salvando…"
        icon={<Loader2 className="size-7 animate-spin text-[var(--muted)]" strokeWidth={1.5} aria-hidden="true" />}
      >
        Guardando os dados e as parcelas. Só um instante.
      </Modal>

      <Modal
        open={saveState.step === 'success'}
        title={saveState.step === 'success' && saveState.created ? 'Cliente cadastrado' : 'Alterações salvas'}
        icon={<CheckCircle2 className="size-7 text-[var(--status-paid)]" strokeWidth={1.5} aria-hidden="true" />}
        onClose={closeSave}
        actions={
          <>
            <Button variant="outline" className="h-11" onClick={() => navigate('/clientes')}>
              Ir para clientes
            </Button>
            <Button autoFocus className="h-11" onClick={closeSave}>
              OK
            </Button>
          </>
        }
      >
        A ficha de{' '}
        <strong className="font-semibold text-[var(--bone)]">
          {saveState.step === 'success' ? saveState.client.name : ''}
        </strong>{' '}
        foi salva com sucesso.
      </Modal>

      <Modal
        open={saveState.step === 'error'}
        title="Não deu para salvar"
        icon={<AlertTriangle className="size-7 text-[var(--overdue)]" strokeWidth={1.5} aria-hidden="true" />}
        onClose={closeSave}
        actions={
          saveState.step === 'error' && saveState.client ? (
            <>
              <Button variant="outline" className="h-11" onClick={closeSave}>
                Fechar
              </Button>
              <Button
                autoFocus
                className="h-11"
                onClick={() => saveState.step === 'error' && saveState.client && runSave(saveState.client)}
              >
                Tentar de novo
              </Button>
            </>
          ) : (
            <Button autoFocus className="h-11" onClick={closeSave}>
              OK
            </Button>
          )
        }
      >
        {saveState.step === 'error' ? saveState.message : null}
      </Modal>
    </>
  )
}
