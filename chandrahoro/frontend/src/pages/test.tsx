import React from 'react';
import Head from 'next/head';
import { Star, Sun, Sparkles } from 'lucide-react';

export default function Test() {
  return (
    <>
      <Head>
        <title>Test Page - Vedic Horoscope Chart Pack</title>
      </Head>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-center mb-8 text-gray-800 dark:text-white">
            Test Page
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
              <Star className="h-10 w-10 text-blue-600 dark:text-blue-400 mb-4" />
              <h2 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Star Icon Test</h2>
              <p className="text-gray-600 dark:text-gray-300">This tests the Star icon from lucide-react.</p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
              <Sun className="h-10 w-10 text-yellow-600 dark:text-yellow-400 mb-4" />
              <h2 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Sun Icon Test</h2>
              <p className="text-gray-600 dark:text-gray-300">This tests the Sun icon from lucide-react.</p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
              <Sparkles className="h-10 w-10 text-purple-600 dark:text-purple-400 mb-4" />
              <h2 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Sparkles Icon Test</h2>
              <p className="text-gray-600 dark:text-gray-300">This tests the Sparkles icon from lucide-react.</p>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">Component Test Status</h2>
            <p className="text-green-600 dark:text-green-400 font-medium">
              ✅ If you can see this page, basic React components are working!
            </p>
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              This test page uses minimal imports to verify that the basic setup is functional.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
