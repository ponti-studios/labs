interface ChatInputProps {
  value: string
  onChange: (value: string) => void
  onSend: () => void
  disabled: boolean
}

export default function ChatInput({ value, onChange, onSend, disabled }: ChatInputProps) {
  return (
    <div className="border-t border-gray-100 p-3 bg-white">
      <div className="flex items-end gap-2 bg-gray-50 rounded-2xl px-3 py-2 border border-gray-200 focus-within:border-blue-400 focus-within:ring-1 focus-within:ring-blue-100">
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              onSend()
            }
          }}
          placeholder="Ask anything..."
          rows={1}
          className="flex-1 bg-transparent text-sm resize-none outline-none placeholder-gray-400 max-h-32 min-h-[1.5rem]"
          style={{ height: 'auto' }}
          onInput={(e) => {
            const el = e.currentTarget
            el.style.height = 'auto'
            el.style.height = `${el.scrollHeight}px`
          }}
        />
        <button
          onClick={onSend}
          disabled={disabled || !value.trim()}
          className="w-7 h-7 bg-blue-500 rounded-full flex items-center justify-center text-white flex-shrink-0 disabled:opacity-40 hover:bg-blue-600 transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M12 19V5M5 12l7-7 7 7" />
          </svg>
        </button>
      </div>
      <p className="text-center text-[10px] text-gray-400 mt-1">Enter to send · Shift+Enter for new line</p>
    </div>
  )
}
