'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

const ORBS = [
  { id: 0,  size: 400, color: '#7C3AED', top: '5%',  left: '-5%', rx: 120,  ry: -80,  dur: 20, opacity: 0.15 },
  { id: 1,  size: 300, color: '#06B6D4', top: '60%', left: '80%', rx: -100, ry: 120,  dur: 25, opacity: 0.13 },
  { id: 2,  size: 350, color: '#10B981', top: '80%', left: '10%', rx: 80,   ry: -120, dur: 18, opacity: 0.12 },
  { id: 3,  size: 250, color: '#8B5CF6', top: '30%', left: '60%', rx: -80,  ry: 60,   dur: 22, opacity: 0.14 },
  { id: 4,  size: 320, color: '#7C3AED', top: '50%', left: '40%', rx: 100,  ry: 80,   dur: 15, opacity: 0.13 },
  { id: 5,  size: 280, color: '#06B6D4', top: '15%', left: '70%', rx: -60,  ry: -100, dur: 19, opacity: 0.12 },
  { id: 6,  size: 200, color: '#10B981', top: '70%', left: '55%', rx: 60,   ry: 80,   dur: 23, opacity: 0.15 },
  { id: 7,  size: 380, color: '#8B5CF6', top: '0%',  left: '40%', rx: -100, ry: 50,   dur: 17, opacity: 0.11 },
  { id: 8,  size: 180, color: '#7C3AED', top: '90%', left: '85%', rx: 80,   ry: -60,  dur: 21, opacity: 0.14 },
  { id: 9,  size: 220, color: '#06B6D4', top: '45%', left: '-8%', rx: 70,   ry: 100,  dur: 16, opacity: 0.13 },
  { id: 10, size: 300, color: '#10B981', top: '25%', left: '25%', rx: -90,  ry: -70,  dur: 24, opacity: 0.12 },
  { id: 11, size: 260, color: '#7C3AED', top: '65%', left: '70%', rx: 110,  ry: -90,  dur: 14, opacity: 0.15 },
];

const BEAM_COLORS = ['#7C3AED', '#06B6D4', '#8B5CF6'];

export default function AnimatedBackground() {
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    setParticles(
      Array.from({ length: 40 }, (_, i) => ({
        id: i,
        size: Math.random() * 2.5 + 2.5,
        top: `${Math.random() * 100}%`,
        left: `${Math.random() * 100}%`,
        color: i % 2 === 0 ? '#7C3AED' : '#06B6D4',
        dur: Math.random() * 3 + 2,
        delay: Math.random() * 3,
        opacity: Math.random() * 0.3 + 0.3,
      }))
    );
  }, []);

  return (
    <div
      className="fixed inset-0 z-0 overflow-hidden pointer-events-none"
      style={{
        background: 'radial-gradient(ellipse at 20% 50%, #1a0533 0%, #0A0A0F 50%, #001a2e 100%)',
      }}
    >
      {/* Layer 1 — Gradient Orbs */}
      {ORBS.map((orb) => (
        <motion.div
          key={orb.id}
          style={{
            position: 'absolute',
            width: orb.size,
            height: orb.size,
            borderRadius: '50%',
            backgroundColor: orb.color,
            top: orb.top,
            left: orb.left,
            filter: `blur(${orb.size * 0.28}px)`,
            opacity: orb.opacity,
          }}
          animate={{
            x: [0, orb.rx, -orb.rx, 0],
            y: [0, orb.ry, -orb.ry, 0],
            scale: [1, 1.2, 0.9, 1],
          }}
          transition={{
            duration: orb.dur,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}

      {/* Layer 2 — Particle Starfield */}
      {particles.map((p) => (
        <motion.div
          key={p.id}
          style={{
            position: 'absolute',
            width: p.size,
            height: p.size,
            borderRadius: '50%',
            backgroundColor: p.color,
            top: p.top,
            left: p.left,
          }}
          animate={{
            opacity: [p.opacity, p.opacity * 2, p.opacity],
            scale: [1, 1.6, 1],
          }}
          transition={{
            duration: p.dur,
            repeat: Infinity,
            delay: p.delay,
            ease: 'easeInOut',
          }}
        />
      ))}

      {/* Layer 3 — Light Beam Sweeps */}
      {BEAM_COLORS.map((color, i) => (
        <motion.div
          key={i}
          style={{
            position: 'absolute',
            top: `${20 + i * 25}%`,
            left: 0,
            width: '60vw',
            height: '1px',
            background: `linear-gradient(90deg, transparent, ${color}18, transparent)`,
            transform: 'rotate(-15deg)',
          }}
          animate={{ x: ['-60vw', '150vw'] }}
          transition={{
            duration: 8,
            repeat: Infinity,
            repeatDelay: 4,
            delay: i * 2.5,
            ease: 'linear',
          }}
        />
      ))}

      {/* Subtle grid overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage:
            'linear-gradient(to right, rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.025) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />
    </div>
  );
}
