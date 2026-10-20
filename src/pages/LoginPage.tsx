import { Button } from '@/components/ui/Button'
import { TextField } from '@/components/ui/TextField'
import { useStudio } from '@/context/StudioContext'
import { useEffect, useState, type FormEvent } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { supabase } from '../../utils/supabase'

export function LoginPage() {
  const { authReady, isAuthenticated, login } = useStudio()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [visible, setVisible] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [todos, setTodos] = useState<any[]>([])

  useEffect(() => {
    async function getTodos() {
      const { data, error } = await supabase.from('Clients').select()
      if (error) {
        console.error('Erro ao buscar todos:', error)
        return
      }
      setTodos(data)
    }
    getTodos()
    console.log(todos)
  }, [])


  if (!authReady) return null
  if (isAuthenticated) return <Navigate to="/clientes" replace />

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setSubmitting(true)
    const message = await login(email, password)
    setSubmitting(false)
    if (message) {
      setError(message)
      return
    }
    navigate('/clientes', { replace: true })
  }

  return (
    <div className="h-full overflow-auto bg-[var(--bg)]">
      <div className="flex min-h-full flex-col md:flex-row">
        <section className="flex flex-col items-center justify-center gap-7 px-6 pb-2 pt-10 md:w-[320px] md:shrink-0 md:gap-8 md:bg-[var(--brand)] md:px-8 xl:w-[540px]">
          <img
            src="/logo.png"
            alt="Rabisco Ink"
            className="size-[168px] rounded-full object-cover md:size-[210px] xl:size-[300px]"
          />
          <p className="font-display text-[13px] tracking-[6px] text-[var(--muted)]">SINCE 2015</p>
        </section>

        <section className="flex flex-1 items-center justify-center px-6 py-9 md:border-l md:border-[var(--line)] md:px-8">
          <form onSubmit={handleSubmit} className="flex w-full max-w-[420px] flex-col gap-[18px] md:max-w-[380px] md:gap-7 xl:max-w-[420px]">
            <div className="flex flex-col gap-2.5">
              <p className="font-display text-[13px] tracking-[4px] text-[var(--bone)]">RABISCO INK</p>
              <h1 className="font-display text-[40px] leading-none xl:text-[48px]">Entrar</h1>
              <p className="text-[15px] leading-[1.45] text-[var(--muted)] xl:hidden">Acesso da equipe do studio.</p>
              <p className="hidden text-[15px] leading-[1.45] text-[var(--muted)] xl:block">
                Acesso da equipe do studio. Clientes, sessões e parcelas ficam aqui.
              </p>
            </div>

            <TextField
              label="E-mail"
              type="email"
              autoComplete="username"
              inputMode="email"
              value={email}
              inputClassName="xl:text-[15px]"
              onChange={setEmail}
            />
            <TextField
              label="Senha"
              type={visible ? 'text' : 'password'}
              autoComplete="current-password"
              value={password}
              inputClassName="xl:text-[15px]"
              onChange={setPassword}
              trailing={
                <button type="button" onClick={() => setVisible((current) => !current)} className="shrink-0 text-[12px] text-[var(--muted)]">
                  {visible ? 'ocultar' : 'mostrar'}
                </button>
              }
            />

            <Button type="submit" disabled={submitting} className="h-12 w-full text-[15px]">
              {submitting ? 'Entrando…' : 'Entrar'}
            </Button>
            {error && <p className="text-[13px] text-[var(--overdue)]">{error}</p>}
            <p className="hidden text-[13px] leading-[1.45] text-[var(--muted)] xl:block">
              Esqueceu a senha? Fale com quem administra o studio.
            </p>
          </form>
        </section>
      </div>
    </div>
  )
}
