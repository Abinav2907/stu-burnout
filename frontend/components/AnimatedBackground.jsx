'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

export default function AnimatedBackground() {
  const [orbs, setOrbs] = useState([]);

  useEffect(() => {
    // Generate orbs client-side to prevent hydration mismatch with random values
    const generatedOrbs = Array.from({ length: 20 }, (_, i) => {
      const size = Math.floor(Math.random() * 80) + 40; // 40px to 120px
      const colors = ['#7C3AED', '#06B6D4', '#10B981']; // violet, cyan, emerald
      const color = colors[Math.floor(Math.random() * colors.length)];
      const duration = Math.floor(Math.random() * 12) + 8; // 8s to 20s
      const delay = Math.random() * -20; // negative delay to start immediately in motion

      return {
        id: i,
        size,
        color,
        duration,
        delay,
        randomX1: Math.floor(Math.random() * 300) - 150,
        randomX2: Math.floor(Math.random() * 300) - 150,
        randomY1: Math.floor(Math.random() * 300) - 150,
        randomY2: Math.floor(Math.random() * 300) - 150,
        top: `${Math.random() * 100}%`,
        left: `${Math.random() * 100}%`,
      };
    });
    setOrbs(generatedOrbs);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-[#0A0A0F]">
      {/* Subtle grid overlay */}
      <div 
        className="absolute inset-0 bg-transparent"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(248, 250, 252, 0.03) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(248, 250, 252, 0.03) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
        }}
      />

      {/* Radial ambient glow base */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0F] via-[#0A0A0F]/90 to-[#120F1F]" />

      {/* Floating orbs */}
      {orbs.map((orb) => (
        <motion.div
          key={orb.id}
          style={{
            position: 'absolute',
            width: orb.size,
            height: orb.size,
            backgroundColor: orb.color,
            top: orb.top,
            left: orb.left,
            filter: 'blur(60px)',
            opacity: 0.12,
            borderRadius: '50%',
          }}
          animate={{
            x: [0, orb.randomX1, orb.randomX2, 0],
            y: [0, orb.randomY1, orb.randomY2, 0],
            scale: [1, 1.2, 0.9, 1],
          }}
          transition={{
            duration: orb.duration,
            repeat: Infinity,
            delay: orb.delay,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
}
