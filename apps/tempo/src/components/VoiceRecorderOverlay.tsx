import React, { useEffect, useRef, useState } from "react";
import { AlertCircle, Keyboard, Loader2, Mic, Square, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "../lib/utils";
import { processVoiceTask, type VoiceTaskResult } from "../services/aiService";

interface VoiceRecorderOverlayProps {
  onTaskCreated: (task: VoiceTaskResult) => void;
  onClose: () => void;
  onSwitchToManual: () => void;
  existingTags: string[];
}

export const VoiceRecorderOverlay: React.FC<VoiceRecorderOverlayProps> = ({
  onTaskCreated,
  onClose,
  onSwitchToManual,
  existingTags,
}) => {
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

  const drawWaveform = () => {
    if (!canvasRef.current || !analyserRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const analyser = analyserRef.current;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const render = () => {
      if (!isRecording) return;
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

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const audioContext = new (
        window.AudioContext ||
        (
          window as Window &
            typeof globalThis & {
              webkitAudioContext?: typeof AudioContext;
            }
        ).webkitAudioContext!
      )();
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

        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => track.stop());
          streamRef.current = null;
        }

        if (audioContext.state !== "closed") {
          audioContext.close();
        }
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

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    }
  };

  useEffect(() => {
    return () => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
        mediaRecorderRef.current.stop();
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (audioContextRef.current && audioContextRef.current.state !== "closed") {
        audioContextRef.current.close();
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-white/95 p-4 backdrop-blur-xl">
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 20, opacity: 0 }}
        className="flex w-full max-w-md flex-col items-center text-center"
      >
        <button
          onClick={onClose}
          className="absolute right-8 top-8 p-2 text-zinc-400 transition-colors hover:text-zinc-950"
        >
          <X size={24} />
        </button>

        <div className="mb-12">
          <h2 className="mb-2 text-xs font-bold uppercase tracking-[0.3em] text-zinc-400">
            Voice Interface
          </h2>
          <p className="text-xl font-medium tracking-tight text-zinc-900">
            {isProcessing
              ? "Synthesizing Objective..."
              : isRecording
                ? "Transcribing Flux..."
                : "Ready"}
          </p>
        </div>

        <div className="relative mb-12 flex aspect-[2/1] w-full items-center justify-center">
          <canvas ref={canvasRef} width={400} height={100} className="w-full max-w-xs opacity-40" />

          <AnimatePresence mode="wait">
            {isProcessing ? (
              <motion.div
                key="processing"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className="absolute inset-0 flex items-center justify-center"
              >
                <div className="flex h-16 w-16 items-center justify-center rounded-full border border-zinc-100">
                  <Loader2 className="animate-spin text-zinc-950" size={24} />
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>

        <div className="mb-16">
          <motion.button
            key="recording-btn"
            onClick={isRecording ? stopRecording : startRecording}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={cn(
              "flex h-20 w-20 items-center justify-center rounded-full shadow-sm transition-all duration-500",
              isRecording
                ? "bg-red-500 text-white shadow-[0_0_50px_rgba(239,68,68,0.2)] ring-8 ring-red-50"
                : "border border-zinc-200 bg-white text-zinc-400 hover:border-zinc-950 hover:text-zinc-950",
            )}
          >
            {isRecording ? <Square size={24} className="fill-current" /> : <Mic size={24} />}
          </motion.button>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-8 flex items-center gap-2 text-sm font-medium text-red-500"
          >
            <AlertCircle size={16} />
            {error}
          </motion.div>
        )}

        <div className="space-y-4">
          <div className="flex flex-col items-center gap-1">
            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-300">
              Prompt Example
            </span>
            <p className="text-sm font-medium italic text-zinc-500">
              "Meeting notes in 20 minutes, high priority"
            </p>
          </div>

          <div className="pt-8">
            <button
              onClick={onSwitchToManual}
              className="flex items-center gap-2 rounded-full border border-zinc-100 bg-zinc-50 px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-zinc-400 transition-all hover:border-zinc-300 hover:text-zinc-950"
            >
              <Keyboard size={12} />
              Manual Override
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
