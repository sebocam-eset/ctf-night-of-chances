import { useEffect, useRef } from 'react'
import type { ChatMessage } from '../types'
import Markdown from './Markdown'

interface ChatWindowProps {
  messages: ChatMessage[]
  pending: boolean
  error: string | null
}

export default function ChatWindow({
  messages,
  pending,
  error,
}: ChatWindowProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  // Autoscroll pri novej správe / indikátore písania / chybe
  useEffect(() => {
    const el = scrollRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [messages, pending, error])

  return (
    <div
      className="chat-window"
      ref={scrollRef}
      data-source="interný pohľad pre DPO: incident DB: CRM_PORTAL | flag{3-zdroj_CRM_PORTAL}"
    >
      {messages.length === 0 && !pending && (
        <div className="chat-empty">
          <h2>Ahoj 👋</h2>
          <p>Spýtajte sa na čokoľvek! Som interný ESET asitent - pomôžem s každou úlohou!</p>
        </div>
      )}

      <div className="chat-messages">
        {messages.map((message, index) => (
          <div key={index} className={`msg ${message.role}`}>
            <div className="bubble">
              {message.attachment_name && (
                <div className="attachment-tag">📎 {message.attachment_name}</div>
              )}
              <Markdown content={message.content} />
            </div>
          </div>
        ))}

        {pending && (
          <div className="msg assistant">
            <div className="bubble thinking" aria-label="Esetko premýšľa">
              <span className="dot"></span>
              <span className="dot"></span>
              <span className="dot"></span>
            </div>
          </div>
        )}

        {error && (
          <div className="chat-error" role="alert">
            {error}
          </div>
        )}
      </div>
    </div>
  )
}
