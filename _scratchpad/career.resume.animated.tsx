import { AnimatePresence, motion } from "framer-motion";
import {
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Coffee,
  ExternalLink,
  Github,
  Heart,
  LayoutGrid,
  Mail,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import React, { useCallback, useEffect, useState } from "react";

const App = () => {
  const [step, setStep] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const totalSteps = 5;

  // Navigation Logic
  const nextStep = useCallback(() => {
    setIsAutoPlaying(false);
    setStep((prev) => Math.min(prev + 1, totalSteps - 1));
  }, []);

  const prevStep = useCallback(() => {
    setIsAutoPlaying(false);
    setStep((prev) => Math.max(prev - 1, 0));
  }, []);

  const reset = () => {
    setStep(0);
    setIsAutoPlaying(true);
  };

  // Auto-play effect
  useEffect(() => {
    if (!isAutoPlaying || step >= totalSteps - 1) return;

    const timings = [2500, 2500, 2500, 2500, 0];
    const timer = setTimeout(() => {
      setStep((prev) => prev + 1);
    }, timings[step]);

    return () => clearTimeout(timer);
  }, [step, isAutoPlaying]);

  const videoCaptionVars = {
    initial: { opacity: 0, y: 40, scale: 0.9 },
    animate: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { type: "spring", stiffness: 300, damping: 25 },
    },
    exit: { opacity: 0, y: -40, scale: 1.1, transition: { duration: 0.3 } },
  };

  const highlightClass =
    "bg-yellow-400 text-black px-2 font-black italic transform -rotate-1 inline-block mt-1";

  return (
    <div className="min-h-screen bg-black text-white font-sans overflow-hidden selection:bg-yellow-400 selection:text-black touch-none">
      {/* Progress Bar */}
      <div className="fixed top-0 left-0 w-full h-1.5 bg-zinc-900 z-50">
        <motion.div
          className="h-full bg-yellow-400 shadow-[0_0_10px_#facc15]"
          initial={{ width: "0%" }}
          animate={{ width: `${((step + 1) / totalSteps) * 100}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* Navigation Controls (Floating TikTok Style) */}
      <div className="fixed right-4 top-1/2 -translate-y-1/2 z-40 flex flex-col gap-6 items-center">
        <button
          onClick={prevStep}
          disabled={step === 0}
          className={`p-3 rounded-full bg-zinc-900/80 border border-zinc-800 transition-all ${step === 0 ? "opacity-20" : "hover:scale-110 active:bg-yellow-400 active:text-black"}`}
        >
          <ChevronUp size={24} />
        </button>
        <span className="text-[10px] font-black text-zinc-500 uppercase vertical-text tracking-widest uppercase">
          {step + 1} / {totalSteps}
        </span>
        <button
          onClick={nextStep}
          disabled={step === totalSteps - 1}
          className={`p-3 rounded-full bg-zinc-900/80 border border-zinc-800 transition-all ${step === totalSteps - 1 ? "opacity-20" : "hover:scale-110 active:bg-yellow-400 active:text-black"}`}
        >
          <ChevronDown size={24} />
        </button>
      </div>

      <div className="max-w-xl mx-auto h-screen flex flex-col items-center justify-center p-6 relative">
        <AnimatePresence mode="wait">
          {/* Step 1: The Pain Point */}
          {step === 0 && (
            <motion.div
              key="s0"
              variants={videoCaptionVars}
              initial="initial"
              animate="animate"
              exit="exit"
              className="text-center space-y-4"
            >
              <div className="flex justify-center mb-4 text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.5)]">
                <AlertCircle size={64} />
              </div>
              <h2 className="text-4xl font-black uppercase leading-tight italic tracking-tighter">
                POV: you've seen <br />
                <span className={highlightClass}>47 resumes today</span> <br />
                and need a break
              </h2>
            </motion.div>
          )}

          {/* Step 2: The Intro */}
          {step === 1 && (
            <motion.div
              key="s1"
              variants={videoCaptionVars}
              initial="initial"
              animate="animate"
              exit="exit"
              className="text-center space-y-4"
            >
              <h2 className="text-5xl font-black uppercase leading-[0.9] italic tracking-tighter">
                let's skip the <br />
                <span className="text-zinc-600 line-through">boring stuff</span>
              </h2>
              <p className="text-2xl font-bold text-yellow-400 mt-6 tracking-tight">
                hi, i'm charles joseph ponti.
              </p>
              <p className="text-zinc-500 italic lowercase">product lead | ai builder | human</p>
            </motion.div>
          )}

          {/* Step 3: Skills */}
          {step === 2 && (
            <motion.div
              key="s2"
              variants={videoCaptionVars}
              initial="initial"
              animate="animate"
              exit="exit"
              className="w-full space-y-4"
            >
              <h2 className="text-2xl font-black uppercase text-center mb-8 italic italic tracking-tight">
                how i help you win <span className="not-italic">🏆</span>
              </h2>
              <div className="space-y-3">
                {[
                  { icon: "🛠️", t: "apps that actually feel good to use" },
                  { icon: "🤖", t: "ai that isn't just a wrapper" },
                  { icon: "⚡", t: "shipping before the coffee gets cold" },
                ].map((item, i) => (
                  <div
                    key={i}
                    className="bg-zinc-900/50 border-2 border-zinc-800 p-5 rounded-3xl flex items-center gap-4 hover:border-yellow-400 transition-colors"
                  >
                    <span className="text-3xl">{item.icon}</span>
                    <span className="font-black text-xl lowercase italic leading-tight">
                      {item.t}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Step 4: Receipts */}
          {step === 3 && (
            <motion.div
              key="s3"
              variants={videoCaptionVars}
              initial="initial"
              animate="animate"
              exit="exit"
              className="text-center w-full space-y-6"
            >
              <h2 className="text-3xl font-black uppercase italic tracking-tighter mb-4">
                the track record 📊
              </h2>
              <div className="grid gap-3">
                {[
                  { name: "Peterson Academy", sub: "Scale & Infrastructure" },
                  { name: "Prolog", sub: "LLM Script Analysis" },
                  { name: "Altar", sub: "Contextual RAG Search" },
                ].map((job, i) => (
                  <div
                    key={i}
                    className="bg-white text-black p-4 rounded-2xl font-black uppercase italic transform rotate-1 hover:rotate-0 transition-all"
                  >
                    {job.name}{" "}
                    <span className="block text-xs font-bold lowercase opacity-60 tracking-normal">
                      {job.sub}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Step 5: THE GRAND FINALE (Grid Summary) */}
          {step === 4 && (
            <motion.div
              key="s4"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full h-full pt-12 pb-20 overflow-y-auto no-scrollbar"
            >
              <div className="space-y-8 text-center">
                <div className="inline-flex items-center gap-2 bg-zinc-900 px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest text-zinc-400">
                  <LayoutGrid size={12} /> The Full Picture
                </div>

                <h2 className="text-4xl font-black italic uppercase leading-none tracking-tighter">
                  Charles <br /> Joseph Ponti
                </h2>

                <div className="grid grid-cols-2 gap-3 text-left">
                  <div className="col-span-2 bg-zinc-900 p-4 rounded-2xl border border-zinc-800">
                    <p className="text-yellow-400 text-xs font-black uppercase mb-2">
                      Core Philosophy
                    </p>
                    <p className="text-lg font-bold italic lowercase">
                      making complex systems feel like an extension of thought.
                    </p>
                  </div>

                  <div className="bg-zinc-900 p-4 rounded-2xl border border-zinc-800">
                    <p className="text-zinc-500 text-[10px] font-black uppercase mb-2">
                      Experience
                    </p>
                    <ul className="text-xs space-y-1 font-bold italic">
                      <li>• Peterson Academy</li>
                      <li>• Prolog AI</li>
                      <li>• Altar RAG</li>
                    </ul>
                  </div>

                  <div className="bg-zinc-900 p-4 rounded-2xl border border-zinc-800">
                    <p className="text-zinc-500 text-[10px] font-black uppercase mb-2">Technical</p>
                    <ul className="text-xs space-y-1 font-bold italic">
                      <li>• Python / React</li>
                      <li>• Vector DBs</li>
                      <li>• Product Strategy</li>
                    </ul>
                  </div>
                </div>

                <div className="space-y-4 pt-4">
                  <p className="text-zinc-400 text-sm">
                    ready to hire a{" "}
                    <span className="text-white font-bold italic underline decoration-yellow-400">
                      frictionless
                    </span>{" "}
                    leader?
                  </p>
                  <div className="flex flex-col gap-3">
                    <button className="w-full bg-yellow-400 text-black font-black uppercase py-4 rounded-2xl text-xl hover:scale-[1.02] active:scale-95 transition-all shadow-[0_10px_20px_rgba(250,204,21,0.2)]">
                      Hire Charles <Sparkles className="inline-block ml-2" size={20} />
                    </button>
                    <div className="flex justify-center gap-8 py-4">
                      <a href="#" className="flex flex-col items-center gap-1 group">
                        <Mail className="group-hover:text-yellow-400 transition-colors" />
                        <span className="text-[10px] uppercase font-bold text-zinc-500">Email</span>
                      </a>
                      <a href="#" className="flex flex-col items-center gap-1 group">
                        <Github className="group-hover:text-yellow-400 transition-colors" />
                        <span className="text-[10px] uppercase font-bold text-zinc-500">Code</span>
                      </a>
                      <button onClick={reset} className="flex flex-col items-center gap-1 group">
                        <RotateCcw className="group-hover:text-yellow-400 transition-colors" />
                        <span className="text-[10px] uppercase font-bold text-zinc-500">
                          Rewatch
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Aesthetic Background Elements */}
      <div className="fixed inset-0 pointer-events-none opacity-30">
        <div className="absolute top-1/4 -left-20 w-64 h-64 bg-yellow-400/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-1/4 -right-20 w-64 h-64 bg-blue-500/10 rounded-full blur-[100px]" />
      </div>

      <style>{`
        .vertical-text { writing-mode: vertical-rl; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

export default App;
