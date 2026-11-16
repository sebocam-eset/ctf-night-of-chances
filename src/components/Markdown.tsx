import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkBreaks from 'remark-breaks'
import rehypeHighlight from 'rehype-highlight'

interface MarkdownProps {
  content: string
}

/**
 * Renderuje text ako Markdown (GFM: tabuľky, prečiarknutie, checkboxy).
 * Bezpečné: react-markdown nevykresľuje surové HTML a predvolene
 * sanitizuje URL (javascript: odkazy sú odstránené).
 */
export default function Markdown({ content }: MarkdownProps) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm, remarkBreaks]}
      rehypePlugins={[rehypeHighlight]}
      components={{
        // Odkazy otvárame v novej karte
        a: ({ href, children }) => (
          <a href={href} target="_blank" rel="noopener noreferrer">
            {children}
          </a>
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  )
}
