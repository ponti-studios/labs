import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Camera, X, Zap } from 'lucide-react';
import { cn } from '../lib/utils';

interface CameraLayerProps {
  isActive: boolean;
  onClose: () => void;
  onCapture: (base64: string) => void;
}

export default function CameraLayer({ isActive, onClose, onCapture }: CameraLayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isActive) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [isActive]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' },
        audio: false 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      setError("Camera access denied");
      console.error(err);
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
  };

  const capture = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      if (context) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0);
        const data = canvasRef.current.toDataURL('image/jpeg');
        onCapture(data);
        onClose();
      }
    }
  };

  return (
    <AnimatePresence>
      {isActive && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black flex flex-col"
        >
          <div className="relative flex-1 bg-neutral-900 overflow-hidden">
            {error ? (
              <div className="absolute inset-0 flex items-center justify-center p-8 text-center">
                <p className="text-white/60">{error}</p>
              </div>
            ) : (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="absolute inset-0 w-full h-full object-cover"
              />
            )}
            
            {/* Camera UI Overlays */}
            <div className="absolute inset-0 pointer-events-none border-[1px] border-white/10 m-4 rounded-3xl" />
            
            <button 
              onClick={onClose}
              className="absolute top-8 right-8 p-3 rounded-full glass hover:bg-white/10 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="h-48 bg-black flex items-center justify-around px-12">
            <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center">
              <Zap className="w-5 h-5 text-white/40" />
            </div>
            
            <button 
              onClick={capture}
              className="w-20 h-20 rounded-full border-4 border-white flex items-center justify-center p-1 group"
            >
              <div className="w-full h-full rounded-full bg-white group-active:scale-90 transition-transform" />
            </button>

            <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center">
              <div className="w-6 h-6 rounded bg-white/10" />
            </div>
          </div>
          
          <canvas ref={canvasRef} className="hidden" />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
