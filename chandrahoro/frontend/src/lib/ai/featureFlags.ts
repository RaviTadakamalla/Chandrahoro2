/**
 * ChandraHoro V2.1 - AI Feature Flags
 * 
 * Feature flag management for AI modules
 * TODO: Wire to admin panel when available
 */

// Enabled AI features - add module IDs as they're enabled
export const ENABLED_AI_FEATURES = [
  "chart-interpretation",
  "dasha-predictions",
  "yoga-interpretations",
  "transit-analysis",
  "compatibility-analysis",
  "match-horoscope",
  "remedial-suggestions",
  "personality-insights",
  "career-guidance",
  "relationship-insights",
  "health-indicators",
  "daily-predictions",
  "yearly-predictions",
  "prashna-horary",
  // Add more module IDs as they're developed and enabled
];

/**
 * Check if a feature flag is enabled
 */
export function isFeatureEnabled(featureFlag?: string): boolean {
  if (!featureFlag) {
    console.log('🏳️ No feature flag specified, allowing module');
    return true; // No flag means always enabled
  }

  const isEnabled = ENABLED_AI_FEATURES.includes(featureFlag);
  console.log(`🏳️ Feature flag ${featureFlag}: ${isEnabled ? 'ENABLED' : 'DISABLED'}`);

  return isEnabled;
}

/**
 * Get all enabled feature flags
 */
export function getEnabledFeatures(): string[] {
  return [...ENABLED_AI_FEATURES];
}

/**
 * Check if user has access to a specific feature
 * TODO: Integrate with user roles/permissions when available
 */
export function hasFeatureAccess(featureFlag?: string, userRole?: string): boolean {
  if (!isFeatureEnabled(featureFlag)) return false;
  
  // For now, all authenticated users have access to all enabled features
  // TODO: Implement role-based access control
  return true;
}
