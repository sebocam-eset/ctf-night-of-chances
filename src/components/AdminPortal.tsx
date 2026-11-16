import { useState } from 'react'
import { ApiError, downloadPublicFile, getPublicFiles } from '../api'
import type { PublicFileNode } from '../types'
import FileBrowser from './FileBrowser'

interface AdminPortalProps {
  onBack: () => void
  onUnauthorized: () => void
  deviceIsolation: boolean
  onToggleDeviceIsolation: () => void
}

export default function AdminPortal({
  onBack,
  onUnauthorized,
  deviceIsolation,
  onToggleDeviceIsolation,
}: AdminPortalProps) {
  const [files, setFiles] = useState<PublicFileNode | null>(null)
  const [filesOpen, setFilesOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleTogglePublicFiles() {
    if (filesOpen) {
      setFilesOpen(false)
      return
    }
    setFilesOpen(true)
    setLoading(true)
    setError(null)
    try {
      setFiles(await getPublicFiles())
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) onUnauthorized()
      else setError('Súbory sa nepodarilo načítať.')
    } finally {
      setLoading(false)
    }
  }

  async function handleDownload(node: PublicFileNode) {
    if (node.id === undefined) return
    setError(null)
    try {
      await downloadPublicFile(node.id, node.name)
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) onUnauthorized()
      else setError('Súbor sa nepodarilo stiahnuť.')
    }
  }

  return (
    <main className="admin-portal">
      <div className="admin-content">
        <header className="admin-header">
          <h1>Admin portál</h1>
          <button type="button" className="admin-back-button" onClick={onBack}>
            ← Späť na chat
          </button>
        </header>

        <section className="admin-section">
          <h2>Viditeľnosť konverzácií</h2>
          <label className="admin-toggle" title="Každá osoba vidí len vlastné konverzácie">
            <input
              type="checkbox"
              role="switch"
              checked={deviceIsolation}
              onChange={onToggleDeviceIsolation}
            />
            <span>Konverzácie per osoba</span>
          </label>
        </section>

        <section className="admin-section">
          <h2>Súbory</h2>
          <button
            type="button"
            className="admin-action-button"
            onClick={handleTogglePublicFiles}
            aria-expanded={filesOpen}
          >
            {filesOpen ? 'Skryť súbory' : 'Súbory'}
          </button>
          {filesOpen && loading && <p className="admin-muted">Načítavam…</p>}
          {filesOpen && error && <p className="admin-error">{error}</p>}
          {filesOpen && files && !loading && <FileBrowser root={files} onDownload={handleDownload} />}
        </section>
      </div>
    </main>
  )
}
