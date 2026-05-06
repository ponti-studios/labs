import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mic, MicOff, Volume2, Sparkles, Loader2 } from 'lucide-react';
import { cn } from '../lib/utils';
import { transcribeAudio, generateSpeech, startChat } from '../services/gemini';

export default function VoiceLive() {
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState('');
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);
  const chatSession = useRef<any>(null);

  useEffect(() => {
    const init = async () => {
      chatSession.current = await startChat("You are Nexus Live. You are a voice assistant. Keep your responses very short and conversational, as if we are talking in real-time.");
    };
    init();
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      
      recorder.ondataavailable = (e) => {
        audioChunks.current.push(e.data);
      };

      recorder.onstop = async () => {
        const audioBlob = new Blob(audioChunks.current, { type: 'audio/wav' });
        audioChunks.current = [];
        processAudio(audioBlob);
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsListening(true);
      setTranscript('Listening...');
    } catch (err) {
      console.error("Mic access denied:", err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
      setIsListening(false);
    }
  };

  const processAudio = async (blob: Blob) => {
    setIsProcessing(true);
    try {
      // 1. Convert blob to base64
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = async () => {
        const base64Audio = (reader.result as string).split(',')[1];
        
        // 2. Transcribe
        const text = await transcribeAudio(base64Audio);
        if (text) {
          setTranscript(text);
          
          // 3. Get AI Response
          const result = await chatSession.current.sendMessage({ message: text });
          const aiText = result.text;
          setResponse(aiText);
          
          // 4. TTS Response
          const ttsAudio = await generateSpeech(aiText);
          if (ttsAudio) {
            const audio = new Audio(`data:audio/wav;base64,${ttsAudio}`);
            audio.play();
          }
        }
      };
    } catch (error) {
      console.error("Live processing error:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-[60vh] space-y-12">
      <div className="relative">
        <AnimatePresence>
          {isListening && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1.5, opacity: 0.2 }}
              exit={{ scale: 2, opacity: 0 }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="absolute inset-0 bg-blue-500 rounded-full blur-3xl"
            />
          )}
        </AnimatePresence>
        
        <button
          onClick={isListening ? stopRecording : startRecording}
          disabled={isProcessing}
          className={cn(
            "relative w-32 h-32 rounded-full flex items-center justify-center transition-all duration-500 shadow-2xl",
            isListening ? "bg-red-500 scale-110" : "bg-white/10 hover:bg-white/20",
            isProcessing && "opacity-50 cursor-not-allowed"
          )}
        >
          {isProcessing ? (
            <Loader2 className="w-12 h-12 text-white animate-spin" />
          ) : isListening ? (
            <MicOff className="w-12 h-12 text-white" />
          ) : (
            <Mic className="w-12 h-12 text-white/80" />
          )}
        </button>
      </div>

      <div className="text-center space-y-4 max-w-md">
        <div className="flex items-center justify-center gap-2 text-blue-400">
          <Sparkles className="w-4 h-4" />
          <span className="text-[10px] font-mono uppercase tracking-[0.3em]">Nexus Live Mode</span>
        </div>
        
        <div className="space-y-2">
          <p className={cn(
            "text-lg font-medium transition-opacity duration-300",
            transcript ? "text-white/90" : "text-white/20"
          )}>
            {transcript || "Tap to start talking"}
          </p>
          <AnimatePresence>
            {response && (
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-blue-300/80 text-sm italic"
              >
                "{response}"
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <motion.div
            key={i}
            animate={isListening ? { height: [10, 40, 10] } : { height: 10 }}
            transition={{ repeat: Infinity, duration: 0.5, delay: i * 0.1 }}
            className="w-1.5 bg-blue-500/40 rounded-full"
          />
        ))}
      </div>
    </div>
  );
}
