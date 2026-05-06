import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, Sparkles, User, Bot, Loader2, Search, Camera, Mic, MicOff, Paperclip, Smile } from 'lucide-react';
import { cn } from '../lib/utils';
import { startChat, searchGrounding, detectIntent, analyzeImage, transcribeAudio } from '../services/gemini';

interface Message {
  id?: string;
  role: 'user' | 'model';
  type: 'text' | 'voice' | 'image' | 'suggestion';
  content: string;
  timestamp: number;
  metadata?: any;
}

interface ChatInterfaceProps {
  onCameraOpen: () => void;
  pendingImage?: string | null;
  onClearPendingImage?: () => void;
}

const STORAGE_KEY = 'nexus-thoughts';
const MAX_STORED_MESSAGES = 100;

function loadStoredMessages(): Message[] {
  if (typeof window === 'undefined') return [];

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed.filter((item) => {
      return item
        && typeof item === 'object'
        && (item.role === 'user' || item.role === 'model')
        && typeof item.type === 'string'
        && typeof item.content === 'string'
        && typeof item.timestamp === 'number';
    }) as Message[];
  } catch {
    return [];
  }
}

function persistMessages(messages: Message[]) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(messages.slice(-MAX_STORED_MESSAGES)));
}

export default function ChatInterface({ onCameraOpen, pendingImage, onClearPendingImage }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>(() => loadStoredMessages());
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [suggestion, setSuggestion] = useState<{ type: string; label: string } | null>(null);
  const [chatSession, setChatSession] = useState<any>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);

  // Initialize Chat Session
  useEffect(() => {
    const init = async () => {
      const session = await startChat('You are Nexus, a multi-modal AI assistant. You can process text, images, and voice. You are concise and proactive. If a question needs live web access, say that you cannot browse the web and provide the best offline answer you can.');
      setChatSession(session);
    };
    init();
  }, []);

  useEffect(() => {
    persistMessages(messages);
  }, [messages]);

  // Auto-expand textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [input]);

  // Intent detection
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (input.trim().length > 10) {
        const intent = await detectIntent(input);
        setSuggestion(intent);
      } else {
        setSuggestion(null);
      }
    }, 800);
    return () => clearTimeout(timer);
  }, [input]);

  // Scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const appendMessage = (msg: Omit<Message, 'id'>) => {
    setMessages((prev) => [...prev, msg]);
  };

  const handleSend = async (overrideInput?: string, overrideType?: 'text' | 'voice' | 'image') => {
    const hasPendingImage = Boolean(pendingImage);
    const type = overrideType || (hasPendingImage ? 'image' : 'text');
    const content = type === 'image' ? (pendingImage || overrideInput || input) : (overrideInput || input);

    if (!content.trim()) return;
    if (!chatSession || isLoading) return;

    setIsLoading(true);
    setInput('');
    setSuggestion(null);
    if (onClearPendingImage) onClearPendingImage();

    const userMsg: Omit<Message, 'id'> = {
      role: 'user',
      type,
      content,
      timestamp: Date.now(),
    };
    appendMessage(userMsg);

    try {
      let responseText = '';

      if (type === 'image') {
        responseText = (await analyzeImage(content)) || "I've analyzed the image.";
      } else if (content.toLowerCase().includes('search') || content.toLowerCase().includes('who is') || content.toLowerCase().includes('what is')) {
        responseText = (await searchGrounding(content)) || "I couldn't find anything on that.";
      } else {
        const result = await chatSession.sendMessage({ message: content });
        responseText = result.text;
      }

      const modelMsg: Omit<Message, 'id'> = {
        role: 'model',
        type: 'text',
        content: responseText,
        timestamp: Date.now(),
      };
      appendMessage(modelMsg);
    } catch (error) {
      console.error('Chat error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleRecording = async () => {
    if (isRecording) {
      mediaRecorder.current?.stop();
      setIsRecording(false);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const recorder = new MediaRecorder(stream);
        audioChunks.current = [];

        recorder.ondataavailable = (e) => audioChunks.current.push(e.data);
        recorder.onstop = async () => {
          const blob = new Blob(audioChunks.current, { type: 'audio/wav' });
          const reader = new FileReader();
          reader.readAsDataURL(blob);
          reader.onloadend = async () => {
            const base64 = (reader.result as string).split(',')[1];
            const text = await transcribeAudio(base64);
            if (text) handleSend(text, 'voice');
          };
        };

        recorder.start();
        mediaRecorder.current = recorder;
        setIsRecording(true);
      } catch (err) {
        console.error('Mic access denied:', err);
      }
    }
  };

  return (
    <div className="flex flex-col h-[80vh] glass rounded-[40px] overflow-hidden border border-white/10 shadow-2xl">
      {/* Header */}
      <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/5 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-blue-400" />
          </div>
          <div>
            <h2 className="text-sm font-bold tracking-tight text-white/90">NEXUS INTELLIGENCE</h2>
            <div className="text-[9px] font-mono text-blue-400/50 uppercase tracking-widest">Multi-Modal Active</div>
          </div>
        </div>
        <div className="flex gap-2">
          <div className="px-3 py-1 rounded-full glass-light text-[9px] font-mono text-white/40 uppercase tracking-widest">
            {messages.length} Fragments
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-8 space-y-8 no-scrollbar scroll-smooth">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-6 opacity-20">
            <Bot className="w-16 h-16" />
            <div className="space-y-2">
              <p className="text-xl font-medium">Nexus is ready</p>
              <p className="text-sm max-w-xs">Capture a photo, speak, or type to begin your multi-modal journey.</p>
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <motion.div
            key={msg.id || i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
              'flex gap-4 group',
              msg.role === 'user' ? 'flex-row-reverse' : 'flex-row',
            )}
          >
            <div
              className={cn(
                'w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110',
                msg.role === 'user' ? 'bg-blue-500/20 border border-blue-500/20' : 'bg-white/5 border border-white/10',
              )}
            >
              {msg.role === 'user' ? <User className="w-5 h-5 text-blue-400" /> : <Bot className="w-5 h-5 text-white/60" />}
            </div>

            <div
              className={cn(
                'flex flex-col gap-2 max-w-[80%]',
                msg.role === 'user' ? 'items-end' : 'items-start',
              )}
            >
              <div
                className={cn(
                  'p-5 rounded-[24px] text-[15px] leading-relaxed shadow-lg',
                  msg.role === 'user'
                    ? 'glass-light text-blue-50 rounded-tr-none border-blue-500/10'
                    : 'glass text-white/90 rounded-tl-none border-white/5',
                )}
              >
                {msg.type === 'image' ? (
                  <div className="space-y-3">
                    <img
                      src={msg.content}
                      alt="Captured"
                      className="rounded-xl max-h-64 w-full object-cover border border-white/10"
                      referrerPolicy="no-referrer"
                    />
                    <div className="flex items-center gap-2 text-[10px] text-white/40 uppercase tracking-widest">
                      <Camera className="w-3 h-3" /> Vision Capture
                    </div>
                  </div>
                ) : msg.type === 'voice' ? (
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
                      <Mic className="w-4 h-4 text-red-400" />
                    </div>
                    <div className="flex-1">
                      <div className="text-[10px] text-white/40 uppercase tracking-widest mb-1">Voice Fragment</div>
                      <p>{msg.content}</p>
                    </div>
                  </div>
                ) : (
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                )}
              </div>
              <span className="text-[9px] font-mono text-white/20 uppercase tracking-widest px-2">
                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </motion.div>
        ))}

        {isLoading && (
          <div className="flex gap-4 mr-auto">
            <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
              <Loader2 className="w-5 h-5 text-white/20 animate-spin" />
            </div>
            <div className="p-5 rounded-[24px] rounded-tl-none glass text-white/20 text-sm italic border border-white/5">
              Nexus is processing intent...
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-8 bg-white/5 border-t border-white/5 backdrop-blur-xl">
        {/* Suggestion Bar */}
        <AnimatePresence>
          {suggestion && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="mb-4 flex gap-2"
            >
              <button
                onClick={() => handleSend(`[${suggestion.type.toUpperCase()}] ${suggestion.label}: ${input}`)}
                className="glass-light px-4 py-2 rounded-full flex items-center gap-2 text-[11px] font-bold text-blue-400 hover:bg-blue-500/10 transition-all border border-blue-500/20"
              >
                <Sparkles className="w-3.5 h-3.5" />
                {suggestion.label}
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Pending Image Preview */}
        <AnimatePresence>
          {pendingImage && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="mb-4 relative w-24 h-24 group"
            >
              <img src={pendingImage} className="w-full h-full object-cover rounded-2xl border-2 border-blue-500/50" referrerPolicy="no-referrer" />
              <button
                onClick={onClearPendingImage}
                className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Paperclip className="w-3 h-3 rotate-45" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="relative flex items-end gap-4">
          <div className="flex-1 glass-light rounded-[28px] p-2 flex items-end gap-2 border border-white/10 focus-within:border-blue-500/30 transition-all">
            <button
              onClick={onCameraOpen}
              className="p-3 rounded-2xl hover:bg-white/5 text-white/40 hover:text-white transition-colors"
            >
              <Camera className="w-6 h-6" />
            </button>

            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={isRecording ? 'Listening...' : 'Message Nexus...'}
              rows={1}
              className="flex-1 bg-transparent border-none focus:ring-0 text-white placeholder:text-white/20 resize-none max-h-48 py-3 text-lg leading-tight no-scrollbar font-sans"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
            />

            <button
              onClick={toggleRecording}
              className={cn(
                'p-3 rounded-2xl transition-all duration-300',
                isRecording ? 'bg-red-500 text-white shadow-lg' : 'hover:bg-white/5 text-white/40 hover:text-white',
              )}
            >
              {isRecording ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
            </button>
          </div>

          <button
            onClick={() => handleSend()}
            disabled={isLoading || (!input.trim() && !pendingImage)}
            className="p-4 rounded-[24px] bg-white text-black hover:bg-white/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-xl hover:scale-105 active:scale-95 flex-shrink-0"
          >
            <Send className="w-6 h-6" />
          </button>
        </div>

        <div className="mt-4 flex items-center justify-between px-2">
          <div className="flex gap-4">
            <button className="text-[10px] font-mono text-white/20 hover:text-white/40 transition-colors flex items-center gap-1.5 uppercase tracking-widest">
              <Search className="w-3 h-3" /> Search Mode
            </button>
            <button className="text-[10px] font-mono text-white/20 hover:text-white/40 transition-colors flex items-center gap-1.5 uppercase tracking-widest">
              <Smile className="w-3 h-3" /> Emojis
            </button>
          </div>
          <div className="text-[9px] font-mono text-white/10 uppercase tracking-[0.3em]">
            Nexus Core v2.0
          </div>
        </div>
      </div>
    </div>
  );
}
