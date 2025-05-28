
"use client";

import React from 'react';

export function Providers({ children }: { children: React.ReactNode }) {
  // In the future, you can add React Query Provider, Theme Provider, etc. here
  return <>{children}</>;
}
