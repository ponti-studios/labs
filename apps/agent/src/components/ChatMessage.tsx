import type { ChatMessage } from "../lib/types.ts";

export default function ChatMessage({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user";

  return (
    <div className={`flex gap-2 px-4 py-2 ${isUser ? "justify-end" : "justify-start"}`}>
      {!isUser && (
        <div className="w-6 h-6 rounded-full bg-blue-500 flex-shrink-0 flex items-center justify-center text-white text-xs font-bold mt-0.5">
          P
        </div>
      )}
      <div
        className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm leading-relaxed whitespace-pre-wrap ${
          isUser
            ? "bg-blue-500 text-white rounded-tr-sm"
            : "bg-gray-100 text-gray-900 rounded-tl-sm"
        }`}
      >
        {message.content || (
          <span className="flex gap-1 items-center">
            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0ms]" />
            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:150ms]" />
            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:300ms]" />
          </span>
        )}
      </div>
    </div>
  );
}
