
'use client';

import { QueryClient, QueryClientProvider as RQProvider } from '@tanstack/react-query';
import type React from 'react';
// Ensuring React is imported for React.useState
import { useState } from 'react';

export function TanstackQueryProvider({ children }: { children: React.ReactNode }) {
  // Use useState to ensure QueryClient is only created once per component instance,
  // and only on the client side.
  const [queryClient] = useState(() => new QueryClient());

  return (
    <RQProvider client={queryClient}>
      {children}
    </RQProvider>
  );
}
