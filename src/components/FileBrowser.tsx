import { useState } from 'react'
import type { PublicFileNode } from '../types'

function formatSize(bytes: number | undefined): string {
  if (bytes === undefined) return ''
  if (bytes < 1024) return `${bytes} B`
  return `${(bytes / 1024).toFixed(1)} KB`
}

function formatDate(iso: string | undefined): string {
  if (!iso) return ''
  const date = new Date(iso)
  return Number.isNaN(date.getTime()) ? '' : date.toLocaleDateString('sk-SK')
}

interface NodeProps {
  node: PublicFileNode
  depth: number
  onDownload: (node: PublicFileNode) => void
}

function FileNode({ node, depth, onDownload }: NodeProps) {
  const [open, setOpen] = useState(true)
  const isDir = node.type === 'dir'
  const indent = { paddingLeft: `${depth * 20 + 8}px` }

  return (
    <li>
      {isDir ? (
        <button
          type="button"
          className="file-row file-row-dir"
          style={indent}
          onClick={() => setOpen((prev) => !prev)}
          aria-expanded={open}
        >
          <span className="file-icon">{open ? '📂' : '📁'}</span>
          <span className="file-name">{node.name}/</span>
        </button>
      ) : (
        <div className="file-row" style={indent}>
          <span className="file-icon">📄</span>
          <span className="file-name">{node.name}</span>
          <span className="file-meta">{formatSize(node.size)}</span>
          <span className="file-meta">{formatDate(node.modified)}</span>
          {node.id !== undefined && (
            <button
              type="button"
              className="file-download"
              title="Stiahnuť"
              aria-label={`Stiahnuť ${node.name}`}
              onClick={() => onDownload(node)}
            >
              ⬇
            </button>
          )}
        </div>
      )}
      {isDir && open && node.children && (
        <ul className="file-tree">
          {node.children.map((child) => (
            <FileNode
              key={child.name}
              node={child}
              depth={depth + 1}
              onDownload={onDownload}
            />
          ))}
        </ul>
      )}
    </li>
  )
}

interface FileBrowserProps {
  root: PublicFileNode
  onDownload: (node: PublicFileNode) => void
}

export default function FileBrowser({ root, onDownload }: FileBrowserProps) {
  return (
    <div className="file-browser" aria-label="Verejné súbory">
      <ul className="file-tree">
        <FileNode node={root} depth={0} onDownload={onDownload} />
      </ul>
    </div>
  )
}
