import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const steps = [
  { title: "Welcome to BookVerse", text: "Discover premium reads, writer tools, and community features in one place." },
  { title: "Mood Lab", text: "Use AI Mood Lab to get tailored books for focus, thrill, calm, and more." },
  { title: "Creator & Admin Tools", text: "Writers publish books. Admins moderate reports and manage catalog quality." },
];

export default function OnboardingTour({ onFinish }) {
  const [index, setIndex] = useState(0);
  const step = useMemo(() => steps[index], [index]);
  const isLast = index === steps.length - 1;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-xl rounded-2xl border border-white/20 bg-[#101021]/90 p-8 text-white backdrop-blur-xl">
        <p className="mb-3 text-xs uppercase tracking-[0.2em] text-violet-300">Onboarding</p>
        <AnimatePresence mode="wait">
          <motion.div
            key={step.title}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -14 }}
            transition={{ duration: 0.25 }}
          >
            <h3 className="text-2xl font-bold">{step.title}</h3>
            <p className="mt-2 text-slate-300">{step.text}</p>
          </motion.div>
        </AnimatePresence>
        <div className="mt-8 flex items-center justify-between">
          <div className="flex gap-2">
            {steps.map((_, i) => (
              <span key={i} className={`h-2 w-8 rounded-full ${i <= index ? "bg-violet-400" : "bg-white/20"}`} />
            ))}
          </div>
          <div className="flex gap-2">
            {index > 0 && (
              <button className="rounded-lg border border-white/20 px-4 py-2" onClick={() => setIndex((p) => p - 1)}>
                Back
              </button>
            )}
            <button
              className="rounded-lg bg-violet-600 px-4 py-2"
              onClick={() => (isLast ? onFinish() : setIndex((p) => p + 1))}
            >
              {isLast ? "Finish" : "Next"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
