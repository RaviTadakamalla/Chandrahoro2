'use client';

import { SessionProvider } from 'next-auth/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import { Toaster } from 'sonner';
import './globals.css';

export default function RootLayout({ children }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000, // 1 minute
        retry: 1,
      },
    },
  }));

  return (
    <html lang="en">
      <body>
        <SessionProvider>
          <QueryClientProvider client={queryClient}>
            {children}
            <Toaster position="top-right" />
          </QueryClientProvider>
        </SessionProvider>
      </body>
    </html>
  )
}
