import { fetchClients, removeClient, upsertClient } from '@/lib/clientsRepo'
import type { Client } from '@/types/client'
import type { Session } from '@supabase/supabase-js'
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { supabase } from '../../utils/supabase'

function displayName(session: Session | null) {
  if (!session) return ''
  const metadata = session.user.user_metadata
  const name = metadata?.full_name ?? metadata?.name ?? metadata?.display_name
  if (typeof name === 'string' && name.trim()) return name.trim()
  return session.user.email?.split('@')[0] ?? ''
}

type StudioContextValue = {
  authReady: boolean
  isAuthenticated: boolean
  userName: string
  clients: Client[]
  clientsLoading: boolean
  clientsError: string | null
  login: (email: string, password: string) => Promise<string | null>
  logout: () => void
  saveClient: (client: Client) => Promise<string | null>
  deleteClient: (id: string) => Promise<string | null>
}

const StudioContext = createContext<StudioContextValue | null>(null)

export function StudioProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [authReady, setAuthReady] = useState(false)
  const [clients, setClients] = useState<Client[]>([])
  const [clientsLoading, setClientsLoading] = useState(false)
  const [clientsError, setClientsError] = useState<string | null>(null)
  const userId = session?.user.id ?? null

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setAuthReady(true)
    })
    const { data } = supabase.auth.onAuthStateChange((_event, next) => setSession(next))
    return () => data.subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (!userId) {
      setClients([])
      return
    }
    let cancelled = false
    setClientsLoading(true)
    setClientsError(null)
    fetchClients()
      .then((loaded) => {
        if (!cancelled) setClients(loaded)
      })
      .catch((error) => {
        console.error('Erro ao carregar clientes:', error)
        if (!cancelled) setClientsError('Não foi possível carregar os clientes.')
      })
      .finally(() => {
        if (!cancelled) setClientsLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [userId])

  const login = useCallback(async (email: string, password: string) => {
    const trimmed = email.trim()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed) || !password) {
      return 'Confira o e-mail e a senha.'
    }
    const { error } = await supabase.auth.signInWithPassword({ email: trimmed, password })
    if (error) return 'E-mail ou senha incorretos.'
    return null
  }, [])

  const logout = useCallback(() => {
    supabase.auth.signOut()
  }, [])

  const saveClient = useCallback(async (next: Client) => {
    try {
      await upsertClient(next)
    } catch (error) {
      console.error('Erro ao salvar cliente:', error)
      return 'Não foi possível salvar. Tente de novo.'
    }
    setClients((current) => {
      const exists = current.some((client) => client.id === next.id)
      return exists ? current.map((client) => (client.id === next.id ? next : client)) : [next, ...current]
    })
    return null
  }, [])

  const deleteClient = useCallback(async (id: string) => {
    try {
      await removeClient(id)
    } catch (error) {
      console.error('Erro ao excluir cliente:', error)
      return 'Não foi possível excluir. Tente de novo.'
    }
    setClients((current) => current.filter((client) => client.id !== id))
    return null
  }, [])

  const value = useMemo(
    () => ({
      authReady,
      isAuthenticated: session !== null,
      userName: displayName(session),
      clients,
      clientsLoading,
      clientsError,
      login,
      logout,
      saveClient,
      deleteClient,
    }),
    [authReady, session, clients, clientsLoading, clientsError, login, logout, saveClient, deleteClient],
  )

  return <StudioContext.Provider value={value}>{children}</StudioContext.Provider>
}

export function useStudio() {
  const context = useContext(StudioContext)
  if (!context) throw new Error('useStudio deve ficar dentro de StudioProvider')
  return context
}
