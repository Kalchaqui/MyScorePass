'use client';

import { useEffect, useState } from 'react';

export default function AnimatedBackground() {
  const [particles, setParticles] = useState<Array<{ id: number; size: number; left: number; delay: number; top: number }>>([]);
  const [geometricShapes, setGeometricShapes] = useState<Array<{ id: number; type: string; left: number; top: number; size: number; rotation: number }>>([]);

  useEffect(() => {
    // Generar partículas aleatorias - más pequeñas y brillantes como en la imagen
    const newParticles = Array.from({ length: 30 }, (_, i) => ({
      id: i,
      size: Math.random() * 8 + 2, // 2-10px (más pequeñas)
      left: Math.random() * 100, // 0-100%
      top: Math.random() * 100, // 0-100%
      delay: Math.random() * 20, // 0-20s
    }));
    setParticles(newParticles);

    // Generar formas geométricas (triángulos, cuadrados, círculos)
    const newShapes = Array.from({ length: 15 }, (_, i) => ({
      id: i,
      type: ['triangle', 'square', 'circle'][Math.floor(Math.random() * 3)],
      left: Math.random() * 100,
      top: Math.random() * 100,
      size: Math.random() * 20 + 10, // 10-30px
      rotation: Math.random() * 360,
    }));
    setGeometricShapes(newShapes);
  }, []);

  return (
    <>
      {/* Gradiente animado de fondo */}
      <div className="animated-gradient" />
      
      {/* Partículas flotantes brillantes */}
      <div className="floating-particles">
        {particles.map((particle) => (
          <div
            key={particle.id}
            className="particle"
            style={{
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              left: `${particle.left}%`,
              top: `${particle.top}%`,
              animationDelay: `${particle.delay}s`,
            }}
          />
        ))}
      </div>

      {/* Formas geométricas con glow teal/cyan */}
      <div className="fixed inset-0 z-[-1] pointer-events-none">
        {geometricShapes.map((shape) => {
          const baseStyle = {
            position: 'absolute' as const,
            left: `${shape.left}%`,
            top: `${shape.top}%`,
            width: `${shape.size}px`,
            height: `${shape.size}px`,
            opacity: 0.3,
            filter: 'blur(1px)',
            animation: 'float 15s infinite ease-in-out',
            animationDelay: `${shape.id * 0.5}s`,
          };

          if (shape.type === 'triangle') {
            return (
              <div
                key={shape.id}
                style={{
                  ...baseStyle,
                  clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)',
                  background: 'rgba(0, 255, 255, 0.4)',
                  boxShadow: '0 0 10px rgba(0, 255, 255, 0.5)',
                }}
              />
            );
          } else if (shape.type === 'square') {
            return (
              <div
                key={shape.id}
                style={{
                  ...baseStyle,
                  background: 'rgba(0, 206, 209, 0.3)',
                  boxShadow: '0 0 8px rgba(0, 206, 209, 0.4)',
                  transform: `rotate(${shape.rotation}deg)`,
                }}
              />
            );
          } else {
            return (
              <div
                key={shape.id}
                style={{
                  ...baseStyle,
                  borderRadius: '50%',
                  background: 'rgba(0, 255, 255, 0.2)',
                  boxShadow: '0 0 12px rgba(0, 255, 255, 0.4)',
                }}
              />
            );
          }
        })}
      </div>

      {/* Líneas de conexión sutiles */}
      <svg className="fixed inset-0 z-[-1] pointer-events-none opacity-20" style={{ width: '100%', height: '100%' }}>
        {geometricShapes.slice(0, 5).map((shape, idx) => {
          if (idx < geometricShapes.length - 1) {
            const nextShape = geometricShapes[idx + 1];
            return (
              <line
                key={`line-${shape.id}`}
                x1={`${shape.left}%`}
                y1={`${shape.top}%`}
                x2={`${nextShape.left}%`}
                y2={`${nextShape.top}%`}
                stroke="rgba(0, 255, 255, 0.3)"
                strokeWidth="1"
              />
            );
          }
          return null;
        })}
      </svg>

      {/* Overlay sutil */}
      <div className="fixed inset-0 bg-black/10 z-[-1]" />
    </>
  );
}

