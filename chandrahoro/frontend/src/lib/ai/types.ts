/**
 * ChandraHoro V2.1 - AI Module Types
 * 
 * TypeScript interfaces for the AI module registry system
 */

import React from 'react';
import type { ChartData, BirthDetails, ChartPreferences, UserInfo } from '@/lib/api';

export interface AiModuleMeta {
  id: string;                    // Unique identifier (e.g., "dasha-predictions")
  title: string;                 // Display name (e.g., "Dasha Period Predictions")
  description: string;           // 1-2 sentence description
  category: "Prediction" | "Interpretation" | "Compatibility" | "Remedies" | "Transit" | "Other";
  requiresChart: boolean;        // True if needs chart data to function
  requiresAuth?: boolean;        // True if requires authenticated user
  featureFlag?: string;          // Optional: admin feature flag key
  icon?: React.ComponentType<{ className?: string }>; // Optional: Icon component
  priority?: number;             // Optional: Display order (lower = higher priority)
}

export interface AiModuleProps {
  chartData?: ChartData;         // From sessionStorage
  birthDetails?: BirthDetails;   // From sessionStorage
  preferences?: ChartPreferences; // From sessionStorage
  user?: UserInfo;               // From AuthContext
  onClose?: () => void;          // For modal/drawer close
}

export interface AiModuleExport {
  meta: AiModuleMeta;
  default: React.ComponentType<AiModuleProps>;
}

export interface LoadedAiModule {
  meta: AiModuleMeta;
  Component: React.ComponentType<AiModuleProps>;
}

export interface AiModuleContext {
  chartData?: ChartData;
  user?: UserInfo;
  enabledFlags?: string[];
}

export interface AiInsightsHubProps {
  chartData?: ChartData;
  birthDetails?: BirthDetails;
  preferences?: ChartPreferences;
  user?: UserInfo;
}

export interface AiModuleCardProps {
  module: LoadedAiModule;
  onExplore: (module: LoadedAiModule) => void;
}

export interface AiModuleModalProps {
  module: LoadedAiModule | null;
  isOpen: boolean;
  onClose: () => void;
  chartData?: ChartData;
  birthDetails?: BirthDetails;
  preferences?: ChartPreferences;
  user?: UserInfo;
}

export interface AiModuleFilters {
  search: string;
  categories: string[];
}
