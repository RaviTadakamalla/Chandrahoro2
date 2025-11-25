/**
 * Design Tokens Showcase Component
 * 
 * Demonstrates all ChandraHoro V2.1 design tokens including:
 * - Colors (primary, celestial, semantic)
 * - Typography scale
 * - Spacing system
 * - Animations
 * - Gradients
 * 
 * @author ChandraHoro Development Team
 * @version 2.1.0
 */

'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export function DesignTokensShowcase() {
  return (
    <div className="space-y-12 p-8 bg-background">
      {/* ========================================
          Color Palette Section
          ======================================== */}
      <section>
        <h2 className="text-3xl font-bold font-heading mb-6 text-foreground">
          Color Palette
        </h2>

        {/* Primary Colors */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-4 text-foreground">
            Primary Palette
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <div className="h-24 bg-saffron rounded-lg shadow-card" />
              <p className="text-sm font-medium">Saffron</p>
              <p className="text-xs text-muted-foreground">#FF6B35</p>
            </div>
            <div className="space-y-2">
              <div className="h-24 bg-gold rounded-lg shadow-card" />
              <p className="text-sm font-medium">Gold</p>
              <p className="text-xs text-muted-foreground">#F7931E</p>
            </div>
            <div className="space-y-2">
              <div className="h-24 bg-marigold rounded-lg shadow-card" />
              <p className="text-sm font-medium">Marigold</p>
              <p className="text-xs text-muted-foreground">#FDB827</p>
            </div>
            <div className="space-y-2">
              <div className="h-24 bg-celestial-deep rounded-lg shadow-card" />
              <p className="text-sm font-medium">Celestial Deep</p>
              <p className="text-xs text-muted-foreground">#1E3A5F</p>
            </div>
          </div>
        </div>

        {/* Semantic Colors */}
        <div>
          <h3 className="text-xl font-semibold mb-4 text-foreground">
            Semantic Colors
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <div className="h-24 bg-success rounded-lg shadow-card" />
              <p className="text-sm font-medium">Success</p>
              <p className="text-xs text-muted-foreground">#4CAF50</p>
            </div>
            <div className="space-y-2">
              <div className="h-24 bg-warning rounded-lg shadow-card" />
              <p className="text-sm font-medium">Warning</p>
              <p className="text-xs text-muted-foreground">#FF9800</p>
            </div>
            <div className="space-y-2">
              <div className="h-24 bg-danger rounded-lg shadow-card" />
              <p className="text-sm font-medium">Danger</p>
              <p className="text-xs text-muted-foreground">#F44336</p>
            </div>
            <div className="space-y-2">
              <div className="h-24 bg-info rounded-lg shadow-card" />
              <p className="text-sm font-medium">Info</p>
              <p className="text-xs text-muted-foreground">#2196F3</p>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================
          Typography Section
          ======================================== */}
      <section>
        <h2 className="text-3xl font-bold font-heading mb-6 text-foreground">
          Typography Scale
        </h2>
        <div className="space-y-4">
          <div>
            <p className="text-5xl font-bold font-heading">Display 5XL</p>
            <p className="text-xs text-muted-foreground">3.815rem (61px)</p>
          </div>
          <div>
            <p className="text-4xl font-bold font-heading">Display 4XL</p>
            <p className="text-xs text-muted-foreground">3.052rem (49px)</p>
          </div>
          <div>
            <p className="text-3xl font-bold font-heading">Display 3XL</p>
            <p className="text-xs text-muted-foreground">2.441rem (39px)</p>
          </div>
          <div>
            <p className="text-2xl font-semibold font-heading">Heading 2XL</p>
            <p className="text-xs text-muted-foreground">1.953rem (31px)</p>
          </div>
          <div>
            <p className="text-xl font-semibold font-heading">Heading XL</p>
            <p className="text-xs text-muted-foreground">1.563rem (25px)</p>
          </div>
          <div>
            <p className="text-lg font-medium">Body Large</p>
            <p className="text-xs text-muted-foreground">1.25rem (20px)</p>
          </div>
          <div>
            <p className="text-base font-normal">Body Base</p>
            <p className="text-xs text-muted-foreground">1rem (16px)</p>
          </div>
          <div>
            <p className="text-sm font-normal">Body Small</p>
            <p className="text-xs text-muted-foreground">0.875rem (14px)</p>
          </div>
          <div>
            <p className="text-xs font-normal">Body XS</p>
            <p className="text-xs text-muted-foreground">0.75rem (12px)</p>
          </div>
        </div>
      </section>

      {/* ========================================
          Spacing Section
          ======================================== */}
      <section>
        <h2 className="text-3xl font-bold font-heading mb-6 text-foreground">
          Spacing System (8px Grid)
        </h2>
        <div className="space-y-4">
          {[
            { name: "XS", value: "4px", class: "w-1 h-1" },
            { name: "SM", value: "8px", class: "w-2 h-2" },
            { name: "MD", value: "16px", class: "w-4 h-4" },
            { name: "LG", value: "24px", class: "w-6 h-6" },
            { name: "XL", value: "32px", class: "w-8 h-8" },
            { name: "2XL", value: "48px", class: "w-12 h-12" },
          ].map((space) => (
            <div key={space.name} className="flex items-center gap-4">
              <div className={cn(space.class, "bg-saffron rounded")} />
              <div>
                <p className="font-medium">{space.name}</p>
                <p className="text-sm text-muted-foreground">{space.value}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ========================================
          Animations Section
          ======================================== */}
      <section>
        <h2 className="text-3xl font-bold font-heading mb-6 text-foreground">
          Animations
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 bg-saffron rounded-lg animate-fade-in" />
            <p className="text-sm font-medium">Fade In</p>
          </div>
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 bg-gold rounded-lg animate-slide-up" />
            <p className="text-sm font-medium">Slide Up</p>
          </div>
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 bg-celestial-deep rounded-lg animate-scale-in" />
            <p className="text-sm font-medium">Scale In</p>
          </div>
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 bg-marigold rounded-lg animate-pulse" />
            <p className="text-sm font-medium">Pulse</p>
          </div>
        </div>
      </section>

      {/* ========================================
          Gradients Section
          ======================================== */}
      <section>
        <h2 className="text-3xl font-bold font-heading mb-6 text-foreground">
          Gradients
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="h-32 rounded-lg gradient-sunset shadow-card" />
          <div className="h-32 rounded-lg gradient-night-sky shadow-card" />
          <div className="h-32 rounded-lg gradient-twilight shadow-card" />
          <div className="h-32 rounded-lg gradient-cosmic shadow-card" />
        </div>
      </section>

      {/* ========================================
          Border Radius Section
          ======================================== */}
      <section>
        <h2 className="text-3xl font-bold font-heading mb-6 text-foreground">
          Border Radius
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="space-y-2">
            <div className="h-20 bg-saffron rounded-sm shadow-card" />
            <p className="text-sm font-medium">SM (4px)</p>
          </div>
          <div className="space-y-2">
            <div className="h-20 bg-gold rounded-md shadow-card" />
            <p className="text-sm font-medium">MD (8px)</p>
          </div>
          <div className="space-y-2">
            <div className="h-20 bg-celestial-deep rounded-lg shadow-card" />
            <p className="text-sm font-medium">LG (16px)</p>
          </div>
          <div className="space-y-2">
            <div className="h-20 bg-marigold rounded-xl shadow-card" />
            <p className="text-sm font-medium">XL (24px)</p>
          </div>
          <div className="space-y-2">
            <div className="h-20 w-20 bg-warning rounded-full shadow-card" />
            <p className="text-sm font-medium">Full</p>
          </div>
        </div>
      </section>

      {/* ========================================
          Dark Mode Section
          ======================================== */}
      <section>
        <h2 className="text-3xl font-bold font-heading mb-6 text-foreground">
          Dark Mode Support
        </h2>
        <div className="bg-dark-surface dark:bg-dark-surface rounded-lg p-6 space-y-4">
          <p className="text-dark-text-primary dark:text-dark-text-primary">
            All components automatically support dark mode with class-based switching
          </p>
          <p className="text-dark-text-secondary dark:text-dark-text-secondary text-sm">
            Add the "dark" class to any parent element to enable dark mode
          </p>
        </div>
      </section>
    </div>
  );
}

