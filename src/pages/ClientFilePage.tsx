import { ClientFileForm } from '@/components/ficha/ClientFileForm'
import { useStudio } from '@/context/StudioContext'
import { Link, useNavigate, useParams } from 'react-router-dom'

export function ClientFilePage() {
  const { clientId } = useParams()
  const navigate = useNavigate()
  const { clients, clientsLoading, saveClient, deleteClient } = useStudio()
  const isNew = clientId === 'novo'
  const client = clients.find((item) => item.id === clientId) ?? null

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
    <ClientFileForm
      key={client?.id ?? 'novo'}
      client={client}
      onCancel={() => navigate('/clientes')}
      onSave={async (next) => {
        const message = await saveClient(next)
        if (!message && isNew) navigate(`/Clients/${next.id}`, { replace: true })
        return message
      }}
      onDelete={async () => {
        if (!client) {
          navigate('/clientes')
          return null
        }
        const confirmed = window.confirm('Excluir este cliente? Os dados e as parcelas saem da lista.')
        if (!confirmed) return null
        const message = await deleteClient(client.id)
        if (!message) navigate('/clientes')
        return message
      }}
    />
  )
}
