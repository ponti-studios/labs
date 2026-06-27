import { AnimatePresence, motion } from "framer-motion";
import type { Variants } from "framer-motion";
import {
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Code2,
  LayoutGrid,
  Mail,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";

export function meta() {
  return [{ title: "Career Resume Animated | Labyrinth" }];
}

export default function CareerResumeAnimated() {
  const [step, setStep] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const totalSteps = 5;

  const nextStep = useCallback(() => {
    setIsAutoPlaying(false);
    setStep((prev) => Math.min(prev + 1, totalSteps - 1));
  }, []);

  const prevStep = useCallback(() => {
    setIsAutoPlaying(false);
    setStep((prev) => Math.max(prev - 1, 0));
  }, []);

  const reset = useCallback(() => {
    setStep(0);
    setIsAutoPlaying(true);
  }, []);

  useEffect(() => {
    if (!isAutoPlaying || step >= totalSteps - 1) return;

    const timings = [2500, 2500, 2500, 2500, 0];
    const timer = window.setTimeout(() => {
      setStep((prev) => prev + 1);
    }, timings[step]);

    return () => window.clearTimeout(timer);
  }, [step, isAutoPlaying]);

  const videoCaptionVars: Variants = {
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
    <div className="relative min-h-[calc(100dvh-6rem)] w-full touch-none overflow-hidden bg-black text-white selection:bg-yellow-400 selection:text-black">
      <div className="fixed top-0 left-0 z-50 h-1.5 w-full bg-zinc-900">
        <motion.div
          className="h-full bg-yellow-400 shadow-[0_0_10px_#facc15]"
          initial={{ width: "0%" }}
          animate={{ width: `${((step + 1) / totalSteps) * 100}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      <div className="fixed top-1/2 right-4 z-40 flex -translate-y-1/2 flex-col items-center gap-6">
        <button
          onClick={prevStep}
          disabled={step === 0}
          className={`rounded-full border border-zinc-800 bg-zinc-900/80 p-3 transition-all ${step === 0 ? "opacity-20" : "hover:scale-110 active:bg-yellow-400 active:text-black"}`}
        >
          <ChevronUp size={24} />
        </button>
        <span className="text-[10px] font-black tracking-widest text-zinc-500 uppercase [writing-mode:vertical-rl]">
          {step + 1} / {totalSteps}
        </span>
        <button
          onClick={nextStep}
          disabled={step === totalSteps - 1}
          className={`rounded-full border border-zinc-800 bg-zinc-900/80 p-3 transition-all ${step === totalSteps - 1 ? "opacity-20" : "hover:scale-110 active:bg-yellow-400 active:text-black"}`}
        >
          <ChevronDown size={24} />
        </button>
      </div>

      <div className="relative mx-auto flex h-full max-w-xl flex-col items-center justify-center p-6">
        <AnimatePresence mode="wait">
          {step === 0 && (
            <motion.div
              key="s0"
              variants={videoCaptionVars}
              initial="initial"
              animate="animate"
              exit="exit"
              className="space-y-4 text-center"
            >
              <div className="mb-4 flex justify-center text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.5)]">
                <AlertCircle size={64} />
              </div>
              <h2 className="text-4xl leading-tight font-black tracking-tighter uppercase italic">
                POV: you&apos;ve seen <br />
                <span className={highlightClass}>47 resumes today</span> <br />
                and need a break
              </h2>
            </motion.div>
          )}

          {step === 1 && (
            <motion.div
              key="s1"
              variants={videoCaptionVars}
              initial="initial"
              animate="animate"
              exit="exit"
              className="space-y-4 text-center"
            >
              <h2 className="text-5xl leading-[0.9] font-black tracking-tighter uppercase italic">
                let&apos;s skip the <br />
                <span className="text-zinc-600 line-through">boring stuff</span>
              </h2>
              <p className="mt-6 text-2xl font-bold tracking-tight text-yellow-400">
                hi, i&apos;m charles joseph ponti.
              </p>
              <p className="text-zinc-500 lowercase italic">product lead | ai builder | human</p>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="s2"
              variants={videoCaptionVars}
              initial="initial"
              animate="animate"
              exit="exit"
              className="w-full space-y-4"
            >
              <h2 className="mb-8 text-center text-2xl font-black tracking-tight uppercase italic">
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
                    className="flex items-center gap-4 rounded-3xl border-2 border-zinc-800 bg-zinc-900/50 p-5 transition-colors hover:border-yellow-400"
                  >
                    <span className="text-3xl">{item.icon}</span>
                    <span className="text-xl leading-tight font-black lowercase italic">
                      {item.t}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="s3"
              variants={videoCaptionVars}
              initial="initial"
              animate="animate"
              exit="exit"
              className="w-full space-y-6 text-center"
            >
              <h2 className="mb-4 text-3xl font-black tracking-tighter uppercase italic">
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
                    className="rotate-1 transform rounded-2xl bg-white p-4 font-black text-black uppercase italic transition-all hover:rotate-0"
                  >
                    {job.name}
                    <span className="block text-xs font-bold tracking-normal lowercase opacity-60">
                      {job.sub}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div
              key="s4"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="no-scrollbar h-full w-full overflow-y-auto pt-12 pb-20"
            >
              <div className="space-y-8 text-center">
                <div className="inline-flex items-center gap-2 rounded-full bg-zinc-900 px-4 py-1 text-xs font-bold tracking-widest text-zinc-400 uppercase">
                  <LayoutGrid size={12} /> The Full Picture
                </div>

                <h2 className="text-4xl leading-none font-black tracking-tighter uppercase italic">
                  Charles <br /> Joseph Ponti
                </h2>

                <div className="grid grid-cols-2 gap-3 text-left">
                  <div className="col-span-2 rounded-2xl border border-zinc-800 bg-zinc-900 p-4">
                    <p className="mb-2 text-xs font-black text-yellow-400 uppercase">
                      Core Philosophy
                    </p>
                    <p className="text-lg font-bold lowercase italic">
                      making complex systems feel like an extension of thought.
                    </p>
                  </div>

                  <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4">
                    <p className="mb-2 text-[10px] font-black text-zinc-500 uppercase">
                      Experience
                    </p>
                    <ul className="space-y-1 text-xs font-bold italic">
                      <li>• Peterson Academy</li>
                      <li>• Prolog AI</li>
                      <li>• Altar RAG</li>
                    </ul>
                  </div>

                  <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4">
                    <p className="mb-2 text-[10px] font-black text-zinc-500 uppercase">Technical</p>
                    <ul className="space-y-1 text-xs font-bold italic">
                      <li>• Python / React</li>
                      <li>• Vector DBs</li>
                      <li>• Product Strategy</li>
                    </ul>
                  </div>
                </div>

                <div className="space-y-4 pt-4">
                  <p className="text-sm text-zinc-400">
                    ready to hire a{" "}
                    <span className="font-bold text-white italic underline decoration-yellow-400">
                      frictionless
                    </span>{" "}
                    leader?
                  </p>
                  <div className="flex flex-col gap-3">
                    <button className="w-full rounded-2xl bg-yellow-400 py-4 text-xl font-black text-black uppercase shadow-[0_10px_20px_rgba(250,204,21,0.2)] transition-all hover:scale-[1.02] active:scale-95">
                      Hire Charles <Sparkles className="ml-2 inline-block" size={20} />
                    </button>
                    <div className="flex justify-center gap-8 py-4">
                      <a href="#" className="group flex flex-col items-center gap-1">
                        <Mail className="transition-colors group-hover:text-yellow-400" />
                        <span className="text-[10px] font-bold text-zinc-500 uppercase">Email</span>
                      </a>
                      <a href="#" className="group flex flex-col items-center gap-1">
                        <Code2 className="transition-colors group-hover:text-yellow-400" />
                        <span className="text-[10px] font-bold text-zinc-500 uppercase">Code</span>
                      </a>
                      <button onClick={reset} className="group flex flex-col items-center gap-1">
                        <RotateCcw className="transition-colors group-hover:text-yellow-400" />
                        <span className="text-[10px] font-bold text-zinc-500 uppercase">
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

      <div className="pointer-events-none fixed inset-0 opacity-30">
        <div className="absolute top-1/4 -left-20 h-64 w-64 rounded-full bg-yellow-400/10 blur-[100px]" />
        <div className="absolute -right-20 bottom-1/4 h-64 w-64 rounded-full bg-blue-500/10 blur-[100px]" />
      </div>

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}
