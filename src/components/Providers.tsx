
"use client";

import React from 'react';
import { LanguageProvider } from "@/context/LanguageContext";

export function Providers({ children }: { children: React.ReactNode }) {
  // Wraps the application with shared context providers
  return <LanguageProvider>{children}</LanguageProvider>;
}
