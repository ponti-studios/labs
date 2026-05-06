/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import CameraLayer from './components/CameraLayer';
import ChatInterface from './components/ChatInterface';
import VoiceLive from './components/VoiceLive';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [activeMode, setActiveMode] = useState<'chat' | 'live'>('chat');
  const [pendingImage, setPendingImage] = useState<string | null>(null);

  return (
    <div className="min-h-screen selection:bg-blue-500/30 font-sans">
      <div className="atmosphere" />

      {/* Status Bar */}
      <header className="fixed top-0 left-0 right-0 z-40 p-6 md:p-10 flex items-center justify-between pointer-events-none">
        <div className="flex flex-col gap-1 pointer-events-auto">
          <div className="text-[11px] font-sans font-medium text-white/40 uppercase tracking-[0.2em]">
            Nexus v2.0.0 — Local Mode
          </div>
          <div className="text-[10px] text-blue-400/60 font-mono uppercase tracking-widest">
            No sign-in required
          </div>
        </div>

        <div className="flex items-center gap-4 pointer-events-auto">
          <div className="hidden md:flex items-center gap-8 mr-8">
            <button
              onClick={() => setActiveMode('chat')}
              className={cn(
                'text-[11px] font-bold uppercase tracking-[0.3em] transition-all relative',
                activeMode === 'chat' ? 'text-white' : 'text-white/20 hover:text-white/40',
              )}
            >
              Chat
              {activeMode === 'chat' && (
                <motion.div layoutId="nav-pill" className="absolute -bottom-2 left-0 right-0 h-0.5 bg-blue-500" />
              )}
            </button>
            <button
              onClick={() => setActiveMode('live')}
              className={cn(
                'text-[11px] font-bold uppercase tracking-[0.3em] transition-all relative',
                activeMode === 'live' ? 'text-white' : 'text-white/20 hover:text-white/40',
              )}
            >
              Live
              {activeMode === 'live' && (
                <motion.div layoutId="nav-pill" className="absolute -bottom-2 left-0 right-0 h-0.5 bg-blue-500" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-32 pb-12 min-h-screen flex flex-col items-center px-4">
        <AnimatePresence mode="wait">
          {activeMode === 'chat' && (
            <motion.div
              key="chat"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="w-full max-w-4xl"
            >
              <ChatInterface
                onCameraOpen={() => setIsCameraActive(true)}
                pendingImage={pendingImage}
                onClearPendingImage={() => setPendingImage(null)}
              />
            </motion.div>
          )}
          {activeMode === 'live' && (
            <motion.div
              key="live"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="w-full"
            >
              <VoiceLive />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Inferred Intent Chip */}
      <div className="fixed bottom-10 right-10 z-40 pointer-events-none">
        <div className="bg-black/40 backdrop-blur-md border border-white/10 px-4 py-2 rounded-xl text-[10px] text-white/60 uppercase tracking-[0.3em] pointer-events-auto shadow-2xl">
          Core Mode: {activeMode.toUpperCase()}
        </div>
      </div>

      {/* Camera Overlay */}
      <CameraLayer
        isActive={isCameraActive}
        onClose={() => setIsCameraActive(false)}
        onCapture={(base64) => {
          setPendingImage(base64);
          setIsCameraActive(false);
        }}
      />
    </div>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}
