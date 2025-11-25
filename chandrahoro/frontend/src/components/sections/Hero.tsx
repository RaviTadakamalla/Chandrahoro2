import React from 'react';
import Image from 'next/image';
import { SaffronButton } from '@/components/SaffronButton';

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-b from-sand to-offwhite dark:from-ink-80 dark:to-charcoal">
      {/* Background mandala watermark */}
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <svg
          viewBox="0 0 200 200"
          className="w-full h-full"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="100" cy="100" r="95" stroke="currentColor" strokeWidth="1" />
          <circle cx="100" cy="100" r="80" stroke="currentColor" strokeWidth="1" opacity="0.7" />
          <circle cx="100" cy="100" r="65" stroke="currentColor" strokeWidth="1" opacity="0.5" />
        </svg>
      </div>

      <div className="container mx-auto px-4 py-16 md:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left column - Content */}
          <div className="flex flex-col gap-6 z-10">
            {/* Badge */}
            <div className="inline-flex w-fit items-center gap-2 rounded-full bg-saffron-100 px-4 py-2 dark:bg-saffron-900/30">
              <span className="h-2 w-2 rounded-full bg-saffron-500" />
              <span className="text-sm font-inter font-500 text-saffron-700 dark:text-saffron-400">
                Welcome to Vedic Astrology
              </span>
            </div>

            {/* Headline */}
            <h1 className="font-poppins text-4xl md:text-5xl lg:text-6xl font-bold text-charcoal dark:text-white leading-tight">
              Discover Your Cosmic{' '}
              <span className="text-saffron-500 dark:text-saffron-400">Destiny</span>
            </h1>

            {/* Subheading */}
            <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 leading-relaxed max-w-lg">
              ChandraHoro brings ancient Vedic astrology wisdom to the modern world. Generate
              accurate birth charts, explore planetary influences, and understand your life path
              with AI-powered insights.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <SaffronButton
                variant="primary"
                size="lg"
                onClick={() => {
                  window.location.href = '/chart';
                }}
              >
                Generate Your Chart
              </SaffronButton>
              <SaffronButton
                variant="outline"
                size="lg"
                onClick={() => {
                  const element = document.getElementById('features');
                  element?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                Learn More
              </SaffronButton>
            </div>

            {/* Trust indicators */}
            <div className="flex flex-col sm:flex-row gap-6 pt-4 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-saffron-500" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>AI-Powered Insights</span>
              </div>
            </div>
          </div>

          {/* Right column - Hero Image */}
          <div className="hidden lg:flex justify-center items-center relative">
            <img
              src="/hero-mascat.png"
              alt="Vedic Astrology Monk-Bird"
              className="w-96 h-96 object-contain drop-shadow-lg"
            />
          </div>
        </div>

        {/* Mobile image - shown below on smaller screens */}
        <div className="lg:hidden flex justify-center mt-12">
          <img
            src="/hero-mascat.png"
            alt="Vedic Astrology Monk-Bird"
            className="w-64 h-64 object-contain drop-shadow-lg"
          />
        </div>
      </div>
    </section>
  );
}

