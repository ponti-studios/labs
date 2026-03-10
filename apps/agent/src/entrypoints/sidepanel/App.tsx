import { useEffect, useRef, useState } from "react";
import ChatMessage from "../../components/ChatMessage.tsx";
import ChatInput from "../../components/ChatInput.tsx";
import ContextBar from "../../components/ContextBar.tsx";
import { streamChat } from "../../lib/api.ts";
import type { ChatMessage as ChatMsg, PageContent, TabInfo } from "../../lib/types.ts";

export default function App() {
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [currentPage, setCurrentPage] = useState<PageContent | null>(null);
  const [additionalPages, setAdditionalPages] = useState<PageContent[]>([]);
  const [tabs, setTabs] = useState<TabInfo[]>([]);
  const [showTabs, setShowTabs] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadCurrentPage();
    loadTabs();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function loadCurrentPage() {
    try {
      const response = await browser.runtime.sendMessage({ type: "GET_PAGE_CONTENT" });
      setCurrentPage(response?.payload ?? null);
    } catch {}
  }

  async function loadTabs() {
    try {
      const response = await browser.runtime.sendMessage({ type: "GET_TABS" });
      setTabs(response?.payload ?? []);
    } catch {}
  }

  async function addTabToContext(tabId: number) {
    try {
      const response = await browser.runtime.sendMessage({
        type: "GET_TAB_CONTENT",
        tabId,
      });
      if (!response?.payload) return;
      setAdditionalPages((prev) => {
        if (prev.find((p) => p.url === response.payload.url)) return prev;
        return [...prev, response.payload];
      });
      setShowTabs(false);
    } catch {}
  }

  async function sendMessage() {
    if (!input.trim() || isStreaming) return;
    setError(null);

    const userMsg: ChatMsg = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
      timestamp: Date.now(),
    };
    const assistantId = (Date.now() + 1).toString();
    const assistantMsg: ChatMsg = {
      id: assistantId,
      role: "assistant",
      content: "",
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMsg, assistantMsg]);
    setInput("");
    setIsStreaming(true);

    const history = [...messages, userMsg].map((m) => ({
      role: m.role,
      content: m.content,
    }));

    try {
      await streamChat(history, { currentPage, additionalPages, tabs }, (text) => {
        setMessages((prev) =>
          prev.map((m) => (m.id === assistantId ? { ...m, content: m.content + text } : m)),
        );
      });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Unknown error";
      setError(msg);
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId
            ? { ...m, content: "Sorry, something went wrong. Is the Polly server running?" }
            : m,
        ),
      );
    } finally {
      setIsStreaming(false);
    }
  }

  return (
    <div className="flex flex-col h-screen bg-white text-gray-900">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-white">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold">
            P
          </div>
          <span className="font-semibold text-sm">Polly</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setShowTabs(!showTabs);
              loadTabs();
            }}
            className="text-xs text-gray-500 hover:text-gray-800 px-2 py-1 rounded hover:bg-gray-100"
            title="Add tab to context"
          >
            + Tab
          </button>
          <button
            onClick={loadCurrentPage}
            className="text-xs text-gray-500 hover:text-gray-800 px-2 py-1 rounded hover:bg-gray-100"
            title="Refresh current page context"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Context bar */}
      <ContextBar
        currentPage={currentPage}
        additionalPages={additionalPages}
        onRemovePage={(url) => setAdditionalPages((prev) => prev.filter((p) => p.url !== url))}
      />

      {/* Tab picker */}
      {showTabs && (
        <div className="border-b border-gray-100 max-h-48 overflow-y-auto bg-gray-50">
          <div className="px-3 py-2 text-xs font-medium text-gray-500 sticky top-0 bg-gray-50 border-b border-gray-100">
            Add tab to context
          </div>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => addTabToContext(tab.id)}
              className="w-full text-left px-3 py-2 text-xs hover:bg-white flex items-center gap-2 border-b border-gray-50"
            >
              {tab.favIconUrl && (
                <img src={tab.favIconUrl} className="w-4 h-4 flex-shrink-0" alt="" />
              )}
              <span className="truncate text-gray-700">{tab.title}</span>
              <span className="text-gray-400 truncate ml-auto shrink-0 max-w-[120px]">
                {new URL(tab.url).hostname}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Error banner */}
      {error && (
        <div className="px-4 py-2 bg-red-50 text-red-700 text-xs border-b border-red-100">
          {error}
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-6 gap-3">
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-500 text-xl font-bold">
              P
            </div>
            <div>
              <p className="font-medium text-gray-800">Hi, I'm Polly</p>
              <p className="text-sm text-gray-500 mt-1">
                {currentPage
                  ? `I can see "${currentPage.title}". Ask me anything.`
                  : "Ask me anything. I can analyze pages, track spending, and more."}
              </p>
            </div>
          </div>
        ) : (
          messages.map((msg) => <ChatMessage key={msg.id} message={msg} />)
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <ChatInput value={input} onChange={setInput} onSend={sendMessage} disabled={isStreaming} />
    </div>
  );
}
