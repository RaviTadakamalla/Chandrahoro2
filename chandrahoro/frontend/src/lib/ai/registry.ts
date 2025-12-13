/**
 * ChandraHoro V2.1 - AI Module Registry
 * 
 * Dynamic module discovery and loading system for AI features
 */

import type { 
  AiModuleMeta, 
  AiModuleExport, 
  LoadedAiModule, 
  AiModuleContext 
} from './types';
import { isFeatureEnabled, hasFeatureAccess } from './featureFlags';

/**
 * Registry of available AI modules
 * Modules are manually registered here until dynamic discovery is implemented
 */
const MODULE_REGISTRY: Record<string, () => Promise<AiModuleExport>> = {
  'chart-interpretation': () => import('@/features/ai/modules/chart-interpretation'),
  'dasha-predictions': () => import('@/features/ai/modules/dasha-predictions'),
  'yoga-interpretations': () => import('@/features/ai/modules/yoga-interpretations'),
  'transit-analysis': () => import('@/features/ai/modules/transit-analysis'),
  'compatibility-analysis': () => import('@/features/ai/modules/compatibility-analysis'),
  'match-horoscope': () => import('@/features/ai/modules/match-horoscope'),
  'remedial-suggestions': () => import('@/features/ai/modules/remedial-suggestions'),
  'personality-insights': () => import('@/features/ai/modules/personality-insights'),
  'career-guidance': () => import('@/features/ai/modules/career-guidance'),
  'relationship-insights': () => import('@/features/ai/modules/relationship-insights'),
  'health-indicators': () => import('@/features/ai/modules/health-indicators'),
  'daily-predictions': () => import('@/features/ai/modules/daily-predictions'),
  'yearly-predictions': () => import('@/features/ai/modules/yearly-predictions'),
  'prashna-horary': () => import('@/features/ai/modules/prashna-horary'),
};

/**
 * Load and filter AI modules based on context
 */
export async function loadAiModules(context: AiModuleContext): Promise<LoadedAiModule[]> {
  const loadedModules: LoadedAiModule[] = [];

  console.log('🔍 Loading AI modules with context:', {
    hasChartData: !!context.chartData,
    hasUser: !!context.user,
    userRole: context.user?.role,
    enabledFlags: context.enabledFlags
  });

  for (const [moduleId, loader] of Object.entries(MODULE_REGISTRY)) {
    try {
      // Check feature flags
      const moduleExport = await loader();
      const meta = moduleExport.meta;

      console.log(`📦 Processing module ${moduleId}:`, {
        title: meta.title,
        featureFlag: meta.featureFlag,
        requiresChart: meta.requiresChart,
        requiresAuth: meta.requiresAuth,
        priority: meta.priority
      });

      if (!isFeatureEnabled(meta.featureFlag)) {
        console.log(`❌ Module ${moduleId} skipped: feature flag disabled`);
        continue; // Skip disabled features
      }

      if (!hasFeatureAccess(meta.featureFlag, context.user?.role)) {
        console.log(`❌ Module ${moduleId} skipped: no feature access`);
        continue; // Skip if user doesn't have access
      }

      // Check requirements
      if (meta.requiresChart && !context.chartData) {
        console.log(`❌ Module ${moduleId} skipped: requires chart data but not available`);
        continue; // Skip if chart data required but not available
      }

      if (meta.requiresAuth && !context.user) {
        console.log(`❌ Module ${moduleId} skipped: requires auth but user not logged in`);
        continue; // Skip if authentication required but user not logged in
      }

      console.log(`✅ Module ${moduleId} loaded successfully`);
      loadedModules.push({
        meta,
        Component: moduleExport.default,
      });
    } catch (error) {
      console.warn(`Failed to load AI module ${moduleId}:`, error);
      // Continue loading other modules even if one fails
    }
  }

  console.log(`🎯 Total modules loaded: ${loadedModules.length}`);

  // Sort by priority (lower numbers first), then by title
  return loadedModules.sort((a, b) => {
    const priorityA = a.meta.priority ?? 999;
    const priorityB = b.meta.priority ?? 999;

    if (priorityA !== priorityB) {
      return priorityA - priorityB;
    }

    return a.meta.title.localeCompare(b.meta.title);
  });
}

/**
 * Get available module categories
 */
export function getModuleCategories(): string[] {
  return ["Prediction", "Interpretation", "Compatibility", "Matchmaking", "Remedies", "Transit", "Other"];
}

/**
 * Filter modules by search query and categories
 */
export function filterModules(
  modules: LoadedAiModule[], 
  search: string, 
  categories: string[]
): LoadedAiModule[] {
  return modules.filter(module => {
    // Search filter
    if (search) {
      const searchLower = search.toLowerCase();
      const titleMatch = module.meta.title.toLowerCase().includes(searchLower);
      const descMatch = module.meta.description.toLowerCase().includes(searchLower);
      if (!titleMatch && !descMatch) {
        return false;
      }
    }
    
    // Category filter
    if (categories.length > 0 && !categories.includes(module.meta.category)) {
      return false;
    }
    
    return true;
  });
}
