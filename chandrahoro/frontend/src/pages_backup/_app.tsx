import '@/styles/globals.css';
import type { AppProps, NextWebVitalsMetric } from 'next/app'
import { useEffect } from 'react'
import { initializeServiceWorker } from '@/lib/serviceWorker';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, Component, ErrorInfo, ReactNode } from 'react';
import { FullPageError } from '@/components/ui/error-alert';
import { AuthProvider } from '@/contexts/AuthContext';
import Head from 'next/head';

// Error boundary component
class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by error boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <FullPageError
          title="Application Error"
          message="We're having trouble loading this page. Please try again later."
          onRetry={() => this.setState({ hasError: false })}
          onGoHome={() => window.location.href = '/'}
          type="error"
        />
      );
    }

    return this.props.children;
  }
}

export function reportWebVitals(metric: NextWebVitalsMetric) {
  // You can send these metrics to an analytics service
  console.log(metric);
}

export default function App({ Component, pageProps }: AppProps) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
        refetchOnWindowFocus: false,
        retry: 2,
      },
    },
  }));

  useEffect(() => {
    // Initialize service worker for offline functionality
    if (typeof window !== 'undefined') {
      initializeServiceWorker();
    }
  }, []);

  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes" />
        <meta httpEquiv="Content-Security-Policy" content="style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; script-src 'self' 'unsafe-inline' 'unsafe-eval'; img-src 'self' data: https:; connect-src 'self' http://localhost:8000 https:;" />
      </Head>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <ErrorBoundary>
            <Component {...pageProps} />
          </ErrorBoundary>
        </AuthProvider>
      </QueryClientProvider>
    </>
  );
}