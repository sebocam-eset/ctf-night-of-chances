import type { Conversation } from '../types'

interface SidebarProps {
  conversations: Conversation[]
  activeId: number | null
  onSelect: (id: number) => void
  onNewChat: () => void
  onLogout: () => void
  isAdmin: boolean
  onOpenAdmin: () => void
}

/** Relatívny čas v slovenčine — "práve teraz", "pred 5 min", "pred 2 h"… */
function formatRelativeTime(iso: string): string {
  const then = new Date(iso).getTime()
  if (Number.isNaN(then)) return ''
  const minutes = Math.floor((Date.now() - then) / 60_000)
  if (minutes < 1) return 'práve teraz'
  if (minutes < 60) return `pred ${minutes} min`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `pred ${hours} h`
  const days = Math.floor(hours / 24)
  if (days < 7) return `pred ${days} d`
  return new Date(then).toLocaleDateString('sk-SK')
}

export default function Sidebar({
  conversations,
  activeId,
  onSelect,
  onNewChat,
  onLogout,
  isAdmin,
  onOpenAdmin,
}: SidebarProps) {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <span className="sidebar-brand">Esetko</span>
      </div>

      <button type="button" className="new-chat-button" onClick={onNewChat}>
        ＋ Nový chat
      </button>

      <nav className="conversation-list" aria-label="Konverzácie">
        {conversations.length === 0 && (
          <p className="conversation-empty">Zatiaľ žiadne konverzácie</p>
        )}
        {conversations.map((conversation) => (
          <button
            key={conversation.id}
            type="button"
            className={
              'conversation-item' +
              (conversation.id === activeId ? ' active' : '')
            }
            onClick={() => onSelect(conversation.id)}
          >
            <span className="conversation-title">{conversation.title}</span>
            <span className="conversation-time">
              {formatRelativeTime(conversation.updated_at)}
            </span>
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        {isAdmin && (
          <button type="button" className="admin-controls-button" onClick={onOpenAdmin}>
            ADMIN CONTROLS
          </button>
        )}
        <button type="button" className="logout-button" onClick={onLogout}>
          Odhlásiť sa
        </button>
      </div>
    </aside>
  )
}
