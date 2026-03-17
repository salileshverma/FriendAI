"use client";

import { motion, AnimatePresence, Variants } from "framer-motion";

export type AvatarStatus = 'idle' | 'thinking' | 'responding';

interface AIAvatarProps {
  status?: AvatarStatus;
}

export const AIAvatar = ({ status = 'idle' }: AIAvatarProps) => {
  // Animation variants for the core
  const coreVariants: Variants = {
    idle: {
      scale: [1, 1.05, 1],
      opacity: 0.9,
      transition: {
        duration: 4,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
    thinking: {
      scale: [1, 1.15, 1],
      opacity: 1,
      transition: {
        duration: 1.5,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
    responding: {
      scale: [1, 1.08, 1],
      opacity: 1,
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
  };

  // Pulse ring variants
  const pulseVariants: Variants = {
    idle: {
      scale: [1, 1.4],
      opacity: [0.3, 0],
      transition: {
        duration: 4,
        repeat: Infinity,
        ease: "easeOut",
      },
    },
    thinking: {
      scale: [1, 1.8],
      opacity: [0.5, 0],
      transition: {
        duration: 1,
        repeat: Infinity,
        ease: "easeOut",
      },
    },
    responding: {
      scale: [1, 1.5],
      opacity: [0.4, 0],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "easeOut",
      },
    },
  };

  return (
    <div className="flex flex-col items-center justify-center py-10">
      <div className="relative w-48 h-48 flex items-center justify-center">
        {/* Ambient background glow */}
        <div className="absolute inset-0 bg-indigo-500/10 blur-[90px] rounded-full" />
        
        {/* Pulse Rings */}
        <AnimatePresence mode="wait">
          <motion.div
            key={status}
            variants={pulseVariants}
            animate={status}
            className="absolute inset-0 border border-indigo-500/30 rounded-full"
          />
          <motion.div
            key={`${status}-outer`}
            variants={pulseVariants}
            animate={status}
            transition={{ delay: 0.5, duration: 4, repeat: Infinity }}
            className="absolute inset-0 border border-purple-500/20 rounded-full"
          />
        </AnimatePresence>

        {/* Central Core */}
        <motion.div
          variants={coreVariants}
          animate={status}
          className="relative w-24 h-24 rounded-full bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] shadow-[0_0_50px_rgba(99,102,241,0.5)] flex items-center justify-center overflow-hidden"
        >
          {/* Inner Light Reflection */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.4)_0%,transparent_60%)]" />
          
          {/* Breathing Layer */}
          <motion.div
            animate={{ 
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{ duration: 3, repeat: Infinity }}
            className="absolute inset-0 bg-white/10"
          />

          {/* Rounded Expressive Eyes */}
          <div className="flex gap-4 z-10">
            {[0, 1].map((i) => (
              <motion.div
                key={i}
                animate={{
                  scaleY: [1, 1, 1, 0, 1, 1],
                  scaleX: status === 'thinking' ? [1, 1.3, 1] : 1,
                  opacity: status === 'thinking' ? [0.7, 1, 0.7] : 0.9
                }}
                transition={{
                  scaleY: {
                    duration: 4,
                    repeat: Infinity,
                    times: [0, 0.7, 0.72, 0.75, 0.78, 1],
                  },
                  scaleX: { duration: 1.5, repeat: Infinity, ease: "easeInOut" }
                }}
                className="w-3.5 h-3.5 bg-white rounded-full shadow-[0_0_10px_white]"
              />
            ))}
          </div>
        </motion.div>

        {/* Orbiting Particles */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: status === 'thinking' ? 4 : 10, repeat: Infinity, ease: "linear" }}
          className="absolute inset-[-15%] z-0"
        >
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-indigo-400 rounded-full blur-[1.5px] shadow-[0_0_12px_rgba(129,140,248,0.8)]" />
        </motion.div>
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: status === 'thinking' ? 6 : 15, repeat: Infinity, ease: "linear" }}
          className="absolute inset-[-20%] z-0"
        >
          <div className="absolute bottom-0 right-1/4 w-2 h-2 bg-purple-400 rounded-full blur-[1px] opacity-60" />
        </motion.div>
      </div>

      {/* Status Label (Optional/Subtle) */}
      <AnimatePresence mode="wait">
        <motion.p
          key={status}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -5 }}
          className="mt-6 text-[11px] font-black uppercase tracking-[0.5em] text-indigo-400/40"
        >
          {status === 'thinking' ? 'Analyzing Neural Patterns' : status === 'responding' ? 'Generating Response' : 'Neural Link Active'}
        </motion.p>
      </AnimatePresence>
    </div>
  );
};
