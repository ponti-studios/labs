import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@pontistudios/ui";
import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, Keyboard, Loader2, Mic, Square } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { cn } from "~/lib/utils";
import { processVoiceTask } from "~/services/aiService";
import type { VoiceTaskResult } from "~/services/aiService";

const isVoiceSupported =
  typeof navigator !== "undefined" &&
  !!navigator.mediaDevices?.getUserMedia &&
  typeof window !== "undefined" &&
  !!window.MediaRecorder;

interface VoiceRecorderOverlayProps {
  open: boolean;
  onTaskCreated: (task: VoiceTaskResult) => void;
  onClose: () => void;
  onSwitchToManual: () => void;
  existingTags: string[];
}

export function VoiceRecorderOverlay({
  open,
  onTaskCreated,
  onClose,
  onSwitchToManual,
  existingTags,
}: VoiceRecorderOverlayProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const audioContext = new AudioContext();
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);

      audioContextRef.current = audioContext;
      analyserRef.current = analyser;

      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: "audio/webm" });
        await handleAudioProcessing(audioBlob);

        streamRef.current?.getTracks().forEach((track) => track.stop());
        streamRef.current = null;

        if (audioContext.state !== "closed") audioContext.close();
      };

      recorder.start();
      setIsRecording(true);
      setError(null);
      drawWaveform();
    } catch (err) {
      console.error("Failed to start recording:", err);
      setError("Microphone access denied or not available.");
    }
  };

  const drawWaveform = () => {
    if (!canvasRef.current || !analyserRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const analyser = analyserRef.current;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const render = () => {
      animationFrameRef.current = requestAnimationFrame(render);
      analyser.getByteFrequencyData(dataArray);
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const barWidth = (canvas.width / bufferLength) * 2.5;
      let x = 0;
      for (let i = 0; i < bufferLength; i++) {
        const barHeight = (dataArray[i] / 255) * canvas.height;
        ctx.fillStyle = `rgba(0, 0, 0, ${dataArray[i] / 255 + 0.1})`;
        ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
        x += barWidth + 1;
      }
    };

    render();
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    }
  };

  const handleAudioProcessing = async (blob: Blob) => {
    setIsProcessing(true);
    try {
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = async () => {
        const base64Audio = (reader.result as string).split(",")[1];
        const result = await processVoiceTask(base64Audio, "audio/webm", existingTags);

        if (result) {
          onTaskCreated(result);
        } else {
          setError("Could not extract task details. Please speak clearly and try again.");
        }
        setIsProcessing(false);
      };
    } catch (err) {
      console.error("Processing failed:", err);
      setError("Error processing audio.");
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    return () => {
      if (mediaRecorderRef.current?.state !== "inactive") {
        mediaRecorderRef.current?.stop();
      }
      streamRef.current?.getTracks().forEach((track) => track.stop());
      if (audioContextRef.current?.state !== "closed") {
        audioContextRef.current?.close();
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xs font-bold uppercase tracking-[0.3em] text-zinc-400">
            Voice Interface
          </DialogTitle>
          <DialogDescription>
            {isProcessing
              ? "Synthesizing objective..."
              : isRecording
                ? "Transcribing flux..."
                : "Ready to record"}
          </DialogDescription>
        </DialogHeader>

        {!isVoiceSupported ? (
          <div className="py-8 text-center">
            <AlertCircle className="mx-auto mb-3 text-zinc-400" size={24} />
            <p className="text-sm text-zinc-500">
              Voice recording is not supported in this browser.
            </p>
            <button
              onClick={onSwitchToManual}
              className="mt-4 px-4 py-2 bg-zinc-50 border border-zinc-100 rounded-full text-xs font-bold uppercase tracking-widest text-zinc-400"
            >
              Switch to Manual
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center text-center py-4 gap-8">
            <div className="relative w-full aspect-[2/1] flex items-center justify-center">
              <canvas
                ref={canvasRef}
                width={400}
                height={100}
                className="w-full max-w-xs opacity-40"
              />
              <AnimatePresence mode="wait">
                {isProcessing && (
                  <motion.div
                    key="processing"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    className="absolute inset-0 flex items-center justify-center"
                  >
                    <div className="w-16 h-16 rounded-full border border-zinc-100 flex items-center justify-center">
                      <Loader2 className="animate-spin text-zinc-950" size={24} />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <motion.button
              onClick={isRecording ? stopRecording : startRecording}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              aria-label={isRecording ? "Stop recording" : "Start recording"}
              className={cn(
                "w-20 h-20 rounded-full flex items-center justify-center transition-all duration-500",
                isRecording
                  ? "bg-red-500 text-white ring-8 ring-red-50"
                  : "bg-white border border-zinc-200 text-zinc-400 hover:border-zinc-950 hover:text-zinc-950",
              )}
            >
              {isRecording ? <Square size={24} className="fill-current" /> : <Mic size={24} />}
            </motion.button>

            {error && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                role="alert"
                className="flex items-center gap-2 text-red-500 text-sm font-medium"
              >
                <AlertCircle size={16} />
                {error}
              </motion.p>
            )}

            <button
              onClick={onSwitchToManual}
              className="px-4 py-2 bg-zinc-50 border border-zinc-100 rounded-full flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-zinc-400 hover:text-zinc-950 hover:border-zinc-300 transition-all"
            >
              <Keyboard size={12} />
              Manual Override
            </button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
