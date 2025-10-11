'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

interface SplashScreenProps {
  onComplete: () => void;
}

export default function SplashScreen({ onComplete }: SplashScreenProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  const steps = [
    { text: 'Loanet', delay: 1500, size: 'text-8xl md:text-9xl' },
    { text: 'Préstamos', delay: 1500, size: 'text-6xl md:text-7xl' },
    { text: 'Sin Colateral', delay: 1500, size: 'text-4xl md:text-5xl bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent' },
    { text: 'Tu identidad y reputación son tu garantía.', delay: 2000, size: 'text-3xl md:text-4xl' },
  ];

  useEffect(() => {
    let timeout: NodeJS.Timeout;

    console.log('SplashScreen - currentStep:', currentStep, 'steps.length:', steps.length);

    if (currentStep < steps.length) {
      console.log('SplashScreen - Next step in:', steps[currentStep].delay, 'ms');
      timeout = setTimeout(() => {
        setCurrentStep(prev => prev + 1);
      }, steps[currentStep].delay);
    } else {
      console.log('SplashScreen - All steps completed, starting fade out');
      // Ir directo a la transición sin logo
      timeout = setTimeout(() => {
        console.log('SplashScreen - Starting fade out');
        setIsVisible(false);
        setTimeout(onComplete, 1000); // Transición rápida
      }, 2000); // Solo 2 segundos antes de desaparecer
    }

    return () => clearTimeout(timeout);
  }, [currentStep, onComplete]);

  if (!isVisible) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
      {/* Logo de fondo */}
      <div className="absolute inset-0 flex items-center justify-center opacity-10">
        <Image
          src="/loanet-logo.png"
          alt="Loanet Logo"
          width={400}
          height={400}
          className="w-96 h-96 animate-pulse"
        />
      </div>

      {/* Contenido principal */}
      <div className="text-center space-y-8 relative z-10">
        {/* Mostrar solo el texto actual */}
        {currentStep < steps.length && (
          <div
            className={`${steps[currentStep].size} font-bold text-white animate-pulse`}
            style={{
              opacity: 1,
              transform: 'translateY(0)',
              transition: 'all 0.5s ease-in-out'
            }}
          >
            {steps[currentStep].text}
          </div>
        )}
      </div>

      {/* Efectos de partículas */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-white/20 rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${3 + Math.random() * 2}s`,
            }}
          />
        ))}
      </div>
    </div>
  );
}
