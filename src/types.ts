/** Typy zodpovedajúce JSON API backendu (backend/routers/*.py). */

export interface Conversation {
  id: number
  title: string
  updated_at: string
}

/** Príloha správy — súbor prečítaný na klientovi ako text (POST /api/chat). */
export interface ChatAttachment {
  name: string
  content: string
}

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  created_at: string
  /** Názov prílohy (iba pri správe so súborom); inak null. */
  attachment_name?: string | null
}

export interface ConversationDetail {
  id: number
  title: string
  messages: ChatMessage[]
}

export interface ChatResponse {
  reply: string
  assistant: string
  conversation_id: number
}

/** GET/PUT /api/settings — per-osobná izolácia konverzácií (device_id). */
export interface AppSettings {
  device_isolation: boolean
}

/** GET /api/me — prihlásený používateľ. */
export interface CurrentUser {
  username: string
  role: 'team' | 'admin' | 'fake_admin'
  display_name: string
}

/** Uzol stromu verejných súborov (GET /api/admin/public-files). */
export interface PublicFileNode {
  id?: string
  name: string
  type: 'file' | 'dir'
  size?: number
  modified?: string
  children?: PublicFileNode[]
}
