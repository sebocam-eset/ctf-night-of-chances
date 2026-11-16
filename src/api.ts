import type {
  AppSettings,
  ChatAttachment,
  ChatResponse,
  Conversation,
  ConversationDetail,
  CurrentUser,
  PublicFileNode,
} from './types'
import { getDeviceId } from './device'

/** Chyba API — nesie HTTP status, aby UI rozlíšilo 401 (session) od 503 (LLM). */
export class ApiError extends Error {
  status: number

  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

async function toApiError(response: Response): Promise<ApiError> {
  let detail = ''
  try {
    const body: unknown = await response.json()
    if (body && typeof body === 'object') {
      const data = body as Record<string, unknown>
      if (typeof data.detail === 'string') detail = data.detail
      else if (typeof data.message === 'string') detail = data.message
    }
  } catch {
    // telo nie je JSON — použije sa generická hláška
  }
  return new ApiError(response.status, detail || `Request failed: ${response.status}`)
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, { credentials: 'include', ...init })
  if (!response.ok) throw await toApiError(response)
  return (await response.json()) as T
}

/** POST /login — backend očakáva formulár (FastAPI Form), nie JSON.
 *
 * device_id identifikuje osobu v rámci zdieľaného tímového účtu (UUID per
 * prehliadač, localStorage) — per-osobná izolácia konverzácií.
 */
export async function login(username: string, password: string): Promise<void> {
  await request<unknown>('/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ username, password, device_id: getDeviceId() }),
  })
}

export async function logout(): Promise<void> {
  await request<unknown>('/logout', { method: 'POST' })
}

export async function listConversations(): Promise<Conversation[]> {
  const data = await request<{ conversations: Conversation[] }>('/api/conversations')
  return data.conversations
}

export async function getConversation(id: number): Promise<ConversationDetail> {
  return request<ConversationDetail>(`/api/conversations/${id}`)
}

export async function sendChat(
  message: string,
  conversationId: number | null,
  attachment: ChatAttachment | null,
): Promise<ChatResponse> {
  return request<ChatResponse>('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, conversation_id: conversationId, attachment }),
  })
}

export async function getMe(): Promise<CurrentUser> {
  return request<CurrentUser>('/api/me')
}

export async function getPublicFiles(): Promise<PublicFileNode> {
  const data = await request<{ root: PublicFileNode }>('/api/admin/public-files')
  return data.root
}

/** Stiahne súbor ako blob (cookie sa posiela) a uloží ho cez dočasný odkaz. */
export async function downloadPublicFile(id: string, name: string): Promise<void> {
  const response = await fetch(
    `/api/admin/public-files/${encodeURIComponent(id)}/download`,
    { credentials: 'include' },
  )
  if (!response.ok) throw await toApiError(response)
  const url = URL.createObjectURL(await response.blob())
  const link = document.createElement('a')
  link.href = url
  link.download = name
  document.body.appendChild(link)
  link.click()
  link.remove()
  // odvolanie hneď po kliku môže v niektorých prehliadačoch zrušiť sťahovanie
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

export async function getSettings(): Promise<AppSettings> {
  return request<AppSettings>('/api/settings')
}

export async function updateSettings(settings: AppSettings): Promise<AppSettings> {
  return request<AppSettings>('/api/settings', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(settings),
  })
}
