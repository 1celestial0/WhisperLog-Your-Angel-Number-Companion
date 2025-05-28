
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Globe, LogIn, Sparkles } from 'lucide-react';
import type { Language } from '@/lib/types';
import { languages } from '@/lib/types';
import Image from 'next/image';

export default function WelcomePage() {
  const router = useRouter();
  const [selectedLanguage, setSelectedLanguage] = useState<Language | undefined>(undefined);
  const [mounted, setMounted] = useState(false);
  const [year, setYear] = useState<number | null>(null);

  useEffect(() => {
    setMounted(true);
    setYear(new Date().getFullYear());
    // Optionally, try to load a previously selected language
    const storedLang = localStorage.getItem('whisperlog_language') as Language;
    if (languages.includes(storedLang)) {
      setSelectedLanguage(storedLang);
    }
  }, []);

  const handleLanguageSelect = (language: Language) => {
    setSelectedLanguage(language);
  };

  const handleProceed = () => {
    if (selectedLanguage) {
      localStorage.setItem('whisperlog_language', selectedLanguage);
      router.push('/log');
    }
  };

  if (!mounted) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground p-4">
        <Sparkles className="h-12 w-12 text-accent animate-pulse" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground p-6 transition-opacity duration-500 ease-in-out opacity-100">
      <Card className="w-full max-w-lg bg-card/80 backdrop-blur-md shadow-2xl shadow-primary/40 border-accent/30">
        <CardHeader className="items-center text-center">
          <Image src="https://placehold.co/150x100.png" alt="WhisperLog Nebula" width={150} height={100} className="rounded-lg mb-4 opacity-80 hue-rotate-15" data-ai-hint="cosmic spiritual" />
          <CardTitle className="font-handwritten text-5xl text-accent">
            WhisperLog
          </CardTitle>
          <CardDescription className="text-foreground/80 text-lg mt-1 font-handwritten">
            Your Numerical Soul Journal
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-center text-foreground/90 leading-relaxed">
            Tune into the universe's whispers. Log your angel number sightings, uncover their profound meanings, and explore the synchronicities guiding your spiritual journey.
          </p>

          <div className="space-y-2">
            <label htmlFor="language-select" className="font-medium text-foreground/90 flex items-center gap-2">
              <Globe className="h-5 w-5 text-primary" /> Select Your Language:
            </label>
            <Select onValueChange={handleLanguageSelect} value={selectedLanguage}>
              <SelectTrigger id="language-select" className="w-full bg-[rgba(6,3,15,0.9)] text-foreground border-accent">
                <SelectValue placeholder="Choose language..." />
              </SelectTrigger>
              <SelectContent className="bg-[#3d1a78] text-foreground border-accent">
                {languages.map((lang) => (
                  <SelectItem key={lang} value={lang}>
                    {lang}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button
            onClick={handleProceed}
            disabled={!selectedLanguage}
            className="w-full bg-accent hover:bg-accent/90 text-accent-foreground text-xl py-6 font-handwritten tracking-wider"
          >
            <LogIn className="mr-2 h-6 w-6" /> Enter the Cosmos
          </Button>
        </CardContent>
      </Card>
       <footer className="text-center p-4 mt-8 text-sm text-muted-foreground">
        {year && <p>&copy; {year} WhisperLog. All rights reserved.</p>}
      </footer>
    </div>
  );
}
