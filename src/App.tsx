import { useEffect, useState } from 'react'
import {
  ApiError,
  getConversation,
  getMe,
  getSettings,
  listConversations,
  logout as apiLogout,
  sendChat,
  updateSettings,
} from './api'
import type {
  AppSettings,
  ChatAttachment,
  ChatMessage,
  Conversation,
  CurrentUser,
} from './types'
import AdminPortal from './components/AdminPortal'
import ChatInput from './components/ChatInput'
import ChatWindow from './components/ChatWindow'
import Login from './components/Login'
import Sidebar from './components/Sidebar'
import './App.css'

type AuthState = 'checking' | 'loggedOut' | 'loggedIn'
type View = 'chat' | 'admin'

const ADMIN_ROLES: CurrentUser['role'][] = ['admin', 'fake_admin']

function App() {
  const [authState, setAuthState] = useState<AuthState>('checking')
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [activeId, setActiveId] = useState<number | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [pending, setPending] = useState(false)
  const [chatError, setChatError] = useState<string | null>(null)
  const [settings, setSettings] = useState<AppSettings | null>(null)
  const [user, setUser] = useState<CurrentUser | null>(null)
  const [view, setView] = useState<View>('chat')
  const isAdmin = user !== null && ADMIN_ROLES.includes(user.role)
  // Session probe — 401 z /api/conversations znamená neprihlásený.
  useEffect(() => {
    let cancelled = false
    listConversations()
      .then((list) => {
        if (!cancelled) {
          setConversations(list)
          setAuthState('loggedIn')
        }
      })
      .catch(() => {
        if (!cancelled) setAuthState('loggedOut')
      })
    getMe()
      .then((me) => {
        if (cancelled) return
        setUser(me)
        if (!ADMIN_ROLES.includes(me.role)) return
        return getSettings().then((loaded) => {
          if (!cancelled) setSettings(loaded)
        })
      })
      .catch(() => {
        // neprihlásený — rieši listConversations
      })
    return () => {
      cancelled = true
    }
  }, [])

  function resetToLoggedOut() {
    setAuthState('loggedOut')
    setConversations([])
    setActiveId(null)
    setMessages([])
    setChatError(null)
    setSettings(null)
    setUser(null)
    setView('chat')
  }

  async function refreshConversations() {
    try {
      setConversations(await listConversations())
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) resetToLoggedOut()
    }
  }

  function handleLoginSuccess() {
    setAuthState('loggedIn')
    void refreshConversations()
    void loadUser()
  }

  // Nastavenia (toggle izolácie) sú len pre admin roly — iným ich nenačítavame.
  function applyUser(me: CurrentUser) {
    setUser(me)
    if (ADMIN_ROLES.includes(me.role)) void loadSettings()
  }

  async function loadUser() {
    try {
      applyUser(await getMe())
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) resetToLoggedOut()
    }
  }

  async function loadSettings() {
    try {
      setSettings(await getSettings())
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) resetToLoggedOut()
    }
  }

  async function handleToggleDeviceIsolation() {
    if (settings === null) return
    const next: AppSettings = { device_isolation: !settings.device_isolation }
    try {
      const saved = await updateSettings(next)
      setSettings(saved)
      // Viditeľnosť konverzácií sa mení s izoláciou — aktívny chat už
      // nemusí byť viditeľný, začneme čistý zoznam.
      setActiveId(null)
      setMessages([])
      setChatError(null)
      await refreshConversations()
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) resetToLoggedOut()
    }
  }

  function handleNewChat() {
    setView('chat')
    if (pending) return
    setActiveId(null)
    setMessages([])
    setChatError(null)
  }

  async function handleSelect(id: number) {
    setView('chat')
    if (pending || id === activeId) return
    setChatError(null)
    try {
      const detail = await getConversation(id)
      setActiveId(id)
      setMessages(detail.messages)
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) resetToLoggedOut()
      else setChatError('Konverzáciu sa nepodarilo načítať.')
    }
  }

  async function handleSend(message: string, attachment: ChatAttachment | null) {
    if (pending) return
    setChatError(null)
    // Optimistická správa — používateľ ju vidí hneď (pri chybe zostáva,
    // aby vedel, čo poslal).
    setMessages((prev) => [
      ...prev,
      {
        role: 'user',
        content: message,
        created_at: new Date().toISOString(),
        attachment_name: attachment?.name ?? null,
      },
    ])
    setPending(true)
    try {
      const response = await sendChat(message, activeId, attachment)
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: response.reply,
          created_at: new Date().toISOString(),
        },
      ])
      // Nová konverzácia — backend pridelil id, zapamätáme si ho.
      if (activeId === null) setActiveId(response.conversation_id)
      void refreshConversations()
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        resetToLoggedOut()
      } else if (err instanceof ApiError && err.status === 503) {
        setChatError('Asistent je momentálne nedostupný — skúste to o chvíľu znova.')
      } else {
        setChatError('Správu sa nepodarilo odoslať.')
      }
    } finally {
      setPending(false)
    }
  }

  async function handleLogout() {
    try {
      await apiLogout()
    } catch {
      // aj tak pokračujeme na login
    }
    resetToLoggedOut()
  }

  if (authState === 'checking') {
    return <div className="app-loading">Načítavam…</div>
  }

  if (authState === 'loggedOut') {
    return <Login onSuccess={handleLoginSuccess} />
  }

  return (
    <div className="app-layout">
      <Sidebar
        conversations={conversations}
        activeId={activeId}
        onSelect={handleSelect}
        onNewChat={handleNewChat}
        onLogout={handleLogout}
        isAdmin={isAdmin}
        onOpenAdmin={() => setView('admin')}
      />
      {view === 'admin' && isAdmin ? (
        <AdminPortal
          onBack={() => setView('chat')}
          onUnauthorized={resetToLoggedOut}
          deviceIsolation={settings?.device_isolation ?? false}
          onToggleDeviceIsolation={handleToggleDeviceIsolation}
        />
      ) : (
        <main className="chat-area">
          <ChatWindow messages={messages} pending={pending} error={chatError} />
          <ChatInput onSend={handleSend} disabled={pending} />
        </main>
      )}
    </div>
  )
}

export default App

