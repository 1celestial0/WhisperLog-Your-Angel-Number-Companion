import { Stars } from 'lucide-react';

export function AppHeader() {
  return (
    <header className="py-6 px-4 md:px-8 text-center">
      <div className="flex items-center justify-center space-x-3">
        <Stars className="h-10 w-10 text-accent" />
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary via-accent to-primary">
          WhisperLog
        </h1>
      </div>
      <p className="mt-2 text-lg text-muted-foreground font-handwritten">Your Angel Number Companion</p>
    </header>
  );
}
