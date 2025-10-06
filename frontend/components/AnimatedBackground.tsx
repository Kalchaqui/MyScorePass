'use client';

import { useEffect, useState } from 'react';

export default function AnimatedBackground() {
  const [particles, setParticles] = useState<Array<{ id: number; size: number; left: number; delay: number }>>([]);

  useEffect(() => {
    // Generar partículas aleatorias
    const newParticles = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      size: Math.random() * 100 + 50, // 50-150px
      left: Math.random() * 100, // 0-100%
      delay: Math.random() * 20, // 0-20s
    }));
    setParticles(newParticles);
  }, []);

  return (
    <>
      {/* Gradiente animado de fondo */}
      <div className="animated-gradient" />
      
      {/* Partículas flotantes */}
      <div className="floating-particles">
        {particles.map((particle) => (
          <div
            key={particle.id}
            className="particle"
            style={{
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              left: `${particle.left}%`,
              bottom: '-100px',
              animationDelay: `${particle.delay}s`,
            }}
          />
        ))}
      </div>

      {/* Overlay sutil */}
      <div className="fixed inset-0 bg-black/20 z-[-1]" />
    </>
  );
}

