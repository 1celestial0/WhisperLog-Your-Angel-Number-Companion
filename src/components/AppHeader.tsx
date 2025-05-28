
"use client";
import { Stars } from 'lucide-react';
import { useEffect, useState } from 'react';

export function AppHeader() {
  const [animateStars, setAnimateStars] = useState(false);

  useEffect(() => {
    // Trigger animation shortly after mount
    const timer = setTimeout(() => setAnimateStars(true), 300);
    return () => clearTimeout(timer);
  }, []);

  return (
    <header className="py-6 px-4 md:px-8 text-center">
      <div className="flex items-center justify-center space-x-3">
        <Stars 
          className={`h-10 w-10 text-accent transition-all duration-1000 ease-out ${animateStars ? 'opacity-100 scale-110 rotate-[30deg]' : 'opacity-0 scale-50 -rotate-[30deg]'}`} 
        />
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary via-accent to-primary font-handwritten">
          WhisperLog
        </h1>
      </div>
      <p className="mt-2 text-lg text-muted-foreground font-handwritten">Your Angel Number Companion</p>
    </header>
  );
}
