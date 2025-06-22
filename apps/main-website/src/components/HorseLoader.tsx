'use client';

import Lottie from 'lottie-react';
import { useEffect, useState } from 'react';
import horseAnimation from '../../public/animations/horse-walking.json';
import grain from '../../public/grain.png';
import Image from 'next/image';

export default function HorseLoader() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Simulate loading progress
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 2;
      });
    }, 80);

    const timer = setTimeout(() => {
      setFadeOut(true);
      setTimeout(() => setIsLoaded(true), 800);
    }, 4000);

    return () => {
      clearTimeout(timer);
      clearInterval(progressInterval);
    };
  }, []);

  if (isLoaded) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center transition-opacity duration-700 ${
        fadeOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      } bg-gradient-to-br from-sunrise via-gold to-sunrise overflow-hidden`}
    >
      {/* Grain texture overlay */}
      <Image
        src={grain}
        alt="grain"
        className="absolute inset-0 object-cover opacity-10 z-0"
        fill
        priority
      />

      {/* Decorative Circles */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        {[
          { size: 'w-64 h-64', color: 'bg-gold/40', top: '10%', left: '-10%' },
          { size: 'w-96 h-96', color: 'bg-gold/20', top: '40%', right: '-15%' },
          { size: 'w-48 h-48', color: 'bg-gold/20', bottom: '20%', left: '20%' },
          { size: 'w-72 h-72', color: 'bg-gold/20', top: '60%', left: '10%' },
          { size: 'w-32 h-32', color: 'bg-gold/40', bottom: '30%', right: '25%' },
          { size: 'w-56 h-56', color: 'bg-gold/20', top: '20%', left: '50%' },
        ].map((circle, i) => (
          <div
            key={i}
            className={`absolute rounded-full blur-xl ${circle.size} ${circle.color}`}
            style={{
              top: circle.top,
              left: circle.left,
              right: circle.right,
              bottom: circle.bottom,
            }}
          />
        ))}
      </div>

      {/* ✨ Sparkle Stars */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        {[...Array(25)].map((_, i) => {
          const positions = [
            { top: '10%', left: '15%' }, { top: '20%', left: '85%' }, { top: '30%', left: '25%' },
            { top: '40%', left: '75%' }, { top: '50%', left: '45%' }, { top: '60%', left: '65%' },
            { top: '70%', left: '35%' }, { top: '80%', left: '55%' }, { top: '90%', left: '25%' },
            { top: '15%', left: '45%' }, { top: '25%', left: '65%' }, { top: '35%', left: '85%' },
            { top: '45%', left: '15%' }, { top: '55%', left: '35%' }, { top: '65%', left: '55%' },
            { top: '75%', left: '75%' }, { top: '85%', left: '95%' }, { top: '95%', left: '5%' },
            { top: '5%', left: '95%' }, { top: '15%', left: '75%' }, { top: '25%', left: '55%' },
            { top: '35%', left: '35%' }, { top: '45%', left: '15%' }, { top: '55%', left: '95%' },
            { top: '65%', left: '75%' }
          ];
          return (
            <div
              key={i}
              className={`absolute w-1 h-1 bg-gradient-to-r from-yellow-500 via-white to-yellow-500 rounded-full opacity-20 animate-twinkle`}
              style={{
                top: positions[i].top,
                left: positions[i].left,
                animationDelay: `${(i * 0.1) % 3}s`,
              }}
            />
          );
        })}
      </div>

      {/* Horse Lottie with glow effect */}
      <div className="z-10 relative">
        <div className="absolute inset-0 blur-2xl bg-yellow-500/20 rounded-full animate-pulse" />
        <Lottie
          animationData={horseAnimation}
          loop
          style={{ height: 280, width: 280 }}
          className="relative z-10"
        />
      </div>

      {/* THE CHARIOT Text */}
      <h1 className="text-4xl md:text-5xl font-black text-black tracking-[0.2em] uppercase mt-4 mb-2 z-10 font-serif drop-shadow-[0_2px_2px_rgba(0,0,0,0.3)]">
        THE CHARIOT
      </h1>

      {/* Progress bar */}
      <div className="w-48 h-1.5 bg-black/20 rounded-full mt-8 overflow-hidden shadow-lg">
        <div 
          className="h-full bg-gradient-to-r from-[#d4af37] via-[#ffd700] to-[#d4af37] transition-all duration-300 ease-out shadow-inner"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
