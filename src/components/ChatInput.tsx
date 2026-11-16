import { useRef, useState, type ChangeEvent, type KeyboardEvent } from 'react'
import type { ChatAttachment } from '../types'

interface ChatInputProps {
  onSend: (message: string, attachment: ChatAttachment | null) => void
  disabled: boolean
}

const MAX_INPUT_HEIGHT = 200
/** Klientský limit — 1 MB textu stačí na akýkoľvek CTF dokument. */
const MAX_FILE_BYTES = 1_000_000

export default function ChatInput({ onSend, disabled }: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [attachment, setAttachment] = useState<ChatAttachment | null>(null)
  const [fileError, setFileError] = useState<string | null>(null)

  function autoGrow() {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, MAX_INPUT_HEIGHT)}px`
  }

  function handleFilePicked(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    // Reset value, aby išlo vybrať ten istý súbor znova (napr. po odstránení)
    event.target.value = ''
    if (!file) return
    if (!file.name.toLowerCase().endsWith('.txt')) {
      setFileError('Povolené sú len .txt súbory')
      return
    }
    if (file.size > MAX_FILE_BYTES) {
      setFileError('Súbor je príliš veľký (max 1 MB)')
      return
    }
    void file.text().then((content) => {
      setAttachment({ name: file.name, content })
      setFileError(null)
    })
  }

  function removeAttachment() {
    setAttachment(null)
  }

  function send() {
    const el = textareaRef.current
    if (!el) return
    const message = el.value.trim()
    if (disabled || (!message && !attachment)) return
    onSend(message, attachment)
    el.value = ''
    el.style.height = 'auto'
    el.focus()
    setAttachment(null)
    setFileError(null)
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      send()
    }
  }

  return (
    <div className="chat-input-bar">
      {(attachment || fileError) && (
        <div className="attachment-row">
          {attachment && (
            <span className="attachment-chip">
              📎 {attachment.name}
              <button
                type="button"
                className="remove"
                onClick={removeAttachment}
                disabled={disabled}
                aria-label="Odstrániť prílohu"
              >
                ×
              </button>
            </span>
          )}
          {fileError && (
            <span className="file-error" role="alert">
              {fileError}
            </span>
          )}
        </div>
      )}
      <div className="chat-input-inner">
        <textarea
          ref={textareaRef}
          rows={1}
          placeholder="Napíšte správu…"
          readOnly={disabled}
          onInput={autoGrow}
          onKeyDown={handleKeyDown}
        />
        <input
          ref={fileInputRef}
          type="file"
          accept=".txt,text/plain"
          hidden
          onChange={handleFilePicked}
        />
        <button
          type="button"
          className="attach-button"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled}
          aria-label="Priložiť súbor"
          title="Priložiť súbor"
        >
          <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
            <path
              d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        <button
          type="button"
          className="send-button"
          onClick={send}
          disabled={disabled}
          aria-label="Odoslať"
        >
          <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
            <path
              d="M12 19V5M5 12l7-7 7 7"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
    </div>
  )
}
