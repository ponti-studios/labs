import type { PageContent } from '../lib/types.ts'

const PAGE_ICONS: Record<string, string> = {
  youtube: '▶',
  ubereats: '🛵',
  generic: '📄',
}

const PAGE_COLORS: Record<string, string> = {
  youtube: 'bg-red-50 text-red-700 border-red-200',
  ubereats: 'bg-green-50 text-green-700 border-green-200',
  generic: 'bg-blue-50 text-blue-700 border-blue-200',
}

interface ContextBarProps {
  currentPage: PageContent | null
  additionalPages: PageContent[]
  onRemovePage: (url: string) => void
}

export default function ContextBar({ currentPage, additionalPages, onRemovePage }: ContextBarProps) {
  const allPages = [
    ...(currentPage ? [{ ...currentPage, isCurrent: true }] : []),
    ...additionalPages.map((p) => ({ ...p, isCurrent: false })),
  ]

  if (allPages.length === 0) return null

  return (
    <div className="flex flex-wrap gap-1.5 px-3 py-2 border-b border-gray-100 bg-gray-50">
      {allPages.map((page) => (
        <div
          key={page.url}
          className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-xs border ${PAGE_COLORS[page.type]}`}
        >
          <span>{PAGE_ICONS[page.type]}</span>
          <span className="truncate max-w-[140px]">{page.title}</span>
          {!page.isCurrent && (
            <button
              onClick={() => onRemovePage(page.url)}
              className="ml-0.5 opacity-60 hover:opacity-100 font-bold leading-none"
            >
              ×
            </button>
          )}
        </div>
      ))}
    </div>
  )
}
