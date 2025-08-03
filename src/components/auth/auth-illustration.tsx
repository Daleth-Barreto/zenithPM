
'use client';

import { motion } from 'framer-motion';

export function AuthIllustration() {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      className="w-full max-w-lg aspect-square"
    >
      <svg viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="hsl(var(--primary))" />
                <stop offset="100%" stopColor="hsl(var(--accent))" />
            </linearGradient>
            <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="8" result="coloredBlur" />
                <feMerge>
                    <feMergeNode in="coloredBlur" />
                    <feMergeNode in="SourceGraphic" />
                </feMerge>
            </filter>
        </defs>
        
        {/* Background shapes */}
        <motion.circle 
          cx="200" cy="200" r="180" 
          stroke="hsl(var(--border))" 
          strokeWidth="1"
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { duration: 0.8, delay: 0.2 } },
          }}
        />
        <motion.circle 
          cx="200" cy="200" r="140" 
          stroke="hsl(var(--border))" 
          strokeWidth="1"
          strokeDasharray="4 8"
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { duration: 0.8, delay: 0.4 } },
          }}
        />

        {/* Floating task cards */}
        <motion.g
          variants={{
            hidden: { y: -20, opacity: 0 },
            visible: { y: 0, opacity: 1, transition: { duration: 0.5, delay: 0.6 } },
          }}
        >
          <rect x="80" y="120" width="100" height="60" rx="8" fill="hsl(var(--card))" stroke="hsl(var(--border))" />
          <rect x="90" y="135" width="60" height="8" rx="4" fill="hsl(var(--muted))" />
          <rect x="90" y="150" width="40" height="8" rx="4" fill="hsl(var(--muted))" />
        </motion.g>

        <motion.g
          variants={{
            hidden: { y: 20, opacity: 0 },
            visible: { y: 0, opacity: 1, transition: { duration: 0.5, delay: 0.8 } },
          }}
        >
          <rect x="220" y="200" width="100" height="80" rx="8" fill="hsl(var(--card))" stroke="hsl(var(--border))" />
          <rect x="230" y="215" width="70" height="8" rx="4" fill="hsl(var(--primary))" />
          <rect x="230" y="230" width="50" height="8" rx="4" fill="hsl(var(--muted))" />
           <rect x="230" y="245" width="50" height="8" rx="4" fill="hsl(var(--muted))" />
        </motion.g>

        {/* Connecting Lines */}
        <motion.path 
          d="M 180 150 Q 200 180, 220 210" 
          stroke="hsl(var(--border))" 
          strokeWidth="1.5"
          strokeDasharray="3 3"
          variants={{
            hidden: { pathLength: 0, opacity: 0 },
            visible: { pathLength: 1, opacity: 1, transition: { duration: 1, delay: 1 } },
          }}
        />

        <motion.path 
          d="M 130 180 Q 150 250, 220 240" 
          stroke="hsl(var(--border))" 
          strokeWidth="1.5"
          strokeDasharray="3 3"
          variants={{
            hidden: { pathLength: 0, opacity: 0 },
            visible: { pathLength: 1, opacity: 1, transition: { duration: 1, delay: 1.2 } },
          }}
        />

        {/* Central glowing element */}
        <motion.g 
            filter="url(#glow)"
            initial={{ scale: 0, opacity: 0, rotate: -90 }}
            animate={{ scale: 1, opacity: 1, rotate: 0, transition: { duration: 0.8, delay: 1.4, type: 'spring' } }}
        >
            <path d="M200 150 L250 200 L200 250 L150 200Z" fill="url(#grad1)" />
        </motion.g>
      </svg>
    </motion.div>
  );
}
