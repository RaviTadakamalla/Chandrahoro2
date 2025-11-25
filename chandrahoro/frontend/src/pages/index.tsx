import React from 'react';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import { SaffronButton } from '@/components/SaffronButton';
import { BrandMark } from '@/components/BrandMark';

export default function LandingPage() {
  return (
    <>
      <Head>
        <title>ChandraHoro - Vedic Astrology Chart Calculator</title>
        <meta
          name="description"
          content="Discover your cosmic destiny with ChandraHoro. Accurate Vedic astrology charts, AI-powered interpretations, and divisional chart analysis."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta property="og:title" content="ChandraHoro - Vedic Astrology Chart Calculator" />
        <meta
          property="og:description"
          content="Discover your cosmic destiny with ChandraHoro. Accurate Vedic astrology charts, AI-powered interpretations, and divisional chart analysis."
        />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="ChandraHoro - Vedic Astrology Chart Calculator" />
        <meta
          name="twitter:description"
          content="Discover your cosmic destiny with ChandraHoro. Accurate Vedic astrology charts, AI-powered interpretations, and divisional chart analysis."
        />
      </Head>

      {/* Full Viewport Two Column Layout: Image Left (50%), Landing Content Right (50%) */}
      <div className="flex flex-col lg:flex-row min-h-screen w-full">
        {/* Left Section: Landing Page Image - 50% Width */}
        <div className="flex-1 w-full lg:w-1/2 h-64 lg:h-screen overflow-hidden relative bg-gradient-to-br from-saffron-50 to-orange-50 dark:from-saffron-900/20 dark:to-orange-900/20">
          <Image
            src="/images/parrot-robot.jpg"
            alt="ChandraHoro - Vedic Astrology with AI Parrot"
            width={800}
            height={600}
            className="w-full h-full object-cover object-center"
            priority
          />
        </div>

        {/* Right Section: Landing Content - 50% Width */}
        <div className="flex-1 w-full lg:w-1/2 h-auto lg:h-screen flex items-center justify-center p-6 lg:p-10 bg-white dark:bg-gray-900">
          <div className="w-full max-w-lg text-center lg:text-left">
            {/* Logo */}
            <div className="mb-8">
              <BrandMark size="lg" showText={true} />
            </div>

            {/* Hero Content */}
            <div className="space-y-6">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 rounded-full bg-saffron-100 px-4 py-2 dark:bg-saffron-900/30">
                <span className="h-2 w-2 rounded-full bg-saffron-500" />
                <span className="text-sm font-inter font-500 text-saffron-700 dark:text-saffron-400">
                  Welcome to Vedic Astrology
                </span>
              </div>

              {/* Main Heading */}
              <h1 className="font-poppins text-3xl md:text-4xl lg:text-5xl font-bold text-charcoal dark:text-white leading-tight">
                Discover Your{' '}
                <span className="text-saffron-500 dark:text-saffron-400">Cosmic Destiny</span>
              </h1>

              {/* Subheading */}
              <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
                Generate accurate Vedic astrology charts with AI-powered interpretations,
                planetary positions, and comprehensive divisional chart analysis.
              </p>

              {/* Key Features */}
              <div className="space-y-3 text-left">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-saffron-500" />
                  <span className="text-gray-700 dark:text-gray-300">Precise Swiss Ephemeris calculations</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-saffron-500" />
                  <span className="text-gray-700 dark:text-gray-300">AI-powered chart interpretations</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-saffron-500" />
                  <span className="text-gray-700 dark:text-gray-300">Comprehensive divisional charts</span>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Link href="/login">
                  <SaffronButton variant="primary" size="lg" className="w-full sm:w-auto">
                    Sign In
                  </SaffronButton>
                </Link>
              </div>

              {/* Trust Indicators */}
              <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                  Trusted by astrology enthusiasts worldwide
                </p>
                <div className="flex items-center gap-6 text-xs text-gray-400 dark:text-gray-500">
                  <span>✓ Accurate Calculations</span>
                  <span>✓ Privacy Protected</span>
                  <span>✓ Free to Use</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
