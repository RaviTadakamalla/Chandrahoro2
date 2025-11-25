import React from 'react';
import { SaffronButton } from '@/components/SaffronButton';

export function CTA() {
  return (
    <section className="py-16 md:py-24 bg-gradient-to-r from-saffron-500 to-saffron-600 dark:from-saffron-600 dark:to-saffron-700 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <svg
          viewBox="0 0 200 200"
          className="w-full h-full"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="100" cy="100" r="95" stroke="white" strokeWidth="1" />
          <circle cx="100" cy="100" r="80" stroke="white" strokeWidth="1" opacity="0.7" />
          <circle cx="100" cy="100" r="65" stroke="white" strokeWidth="1" opacity="0.5" />
        </svg>
      </div>

      {/* Noise texture overlay */}
      <div className="absolute inset-0 opacity-5 pointer-events-none mix-blend-overlay" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-2xl mx-auto text-center">
          {/* Headline */}
          <h2 className="font-poppins text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Explore Your Cosmic Path?
          </h2>

          {/* Description */}
          <p className="text-lg text-white/90 mb-8 leading-relaxed">
            Join thousands of users discovering their destiny through accurate Vedic astrology
            calculations and AI-powered insights.
          </p>

          {/* CTA Button */}
          <SaffronButton
            variant="secondary"
            size="lg"
            className="bg-white text-saffron-600 hover:bg-offwhite"
            onClick={() => {
              window.location.href = '/chart';
            }}
          >
            Get Started Free
          </SaffronButton>

          {/* Secondary text */}
          <p className="text-sm text-white/70 mt-6">
            No credit card required • Instant results • Share your charts
          </p>
        </div>
      </div>
    </section>
  );
}

