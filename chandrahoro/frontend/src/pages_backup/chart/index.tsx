import React from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

export default function ChartIndexPage() {
  const router = useRouter();

  React.useEffect(() => {
    // Redirect to the main app or a chart creation page
    router.push('/');
  }, [router]);

  return (
    <>
      <Head>
        <title>Redirecting...</title>
      </Head>
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Loading...</h1>
          <p className="text-gray-600">Redirecting to home page...</p>
        </div>
      </div>
    </>
  );
}

