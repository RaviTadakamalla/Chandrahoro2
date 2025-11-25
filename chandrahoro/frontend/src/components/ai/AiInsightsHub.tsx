/**
 * AI Insights Hub Component
 * 
 * Main hub for discovering and accessing AI-powered astrology features
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Search, Filter, Sparkles, AlertTriangle, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AiModuleCard } from './AiModuleCard';
import { AiModuleModal } from './AiModuleModal';
import { loadAiModules, getModuleCategories, filterModules } from '@/lib/ai/registry';
import type { AiInsightsHubProps, LoadedAiModule, AiModuleFilters } from '@/lib/ai/types';

export default function AiInsightsHub({ chartData, birthDetails, preferences, user }: AiInsightsHubProps) {
  const [modules, setModules] = useState<LoadedAiModule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [selectedModule, setSelectedModule] = useState<LoadedAiModule | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filters, setFilters] = useState<AiModuleFilters>({
    search: '',
    categories: [],
  });

  // Load AI modules on mount
  useEffect(() => {
    const loadModules = async () => {
      setLoading(true);
      setError('');
      
      try {
        const loadedModules = await loadAiModules({
          chartData,
          user,
          enabledFlags: [], // TODO: Get from user preferences or admin settings
        });
        setModules(loadedModules);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load AI modules');
      } finally {
        setLoading(false);
      }
    };

    loadModules();
  }, [chartData, user]);

  // Filter modules based on search and category filters
  const filteredModules = useMemo(() => {
    return filterModules(modules, filters.search, filters.categories);
  }, [modules, filters]);

  // Handle module exploration
  const handleExploreModule = (module: LoadedAiModule) => {
    setSelectedModule(module);
    setIsModalOpen(true);
  };

  // Handle modal close
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedModule(null);
  };

  // Handle category filter toggle
  const toggleCategory = (category: string) => {
    setFilters(prev => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter(c => c !== category)
        : [...prev.categories, category],
    }));
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters({ search: '', categories: [] });
  };

  // Get available categories
  const availableCategories = getModuleCategories();

  if (!chartData) {
    return (
      <div className="text-center py-12">
        <Sparkles className="h-16 w-16 mx-auto mb-4 text-gray-400" />
        <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-300 mb-2">
          Generate a Chart to Unlock AI Insights
        </h3>
        <p className="text-gray-500 dark:text-gray-400">
          Create your birth chart to access personalized AI-powered astrological insights and interpretations.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-2">
          <Sparkles className="h-8 w-8 text-saffron-500" />
          <h1 className="text-3xl font-bold text-charcoal dark:text-white">
            AI-Powered Insights
          </h1>
        </div>
        <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          Explore intelligent interpretations and predictions based on your birth chart configuration
        </p>
        
        {/* Disclaimer */}
        <Alert className="max-w-3xl mx-auto">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>AI Disclaimer:</strong> AI insights are interpretative and for guidance purposes only. 
            Please verify with a qualified astrologer for important life decisions.
          </AlertDescription>
        </Alert>
      </div>

      {/* Search and Filters */}
      <div className="space-y-4">
        {/* Search */}
        <div className="relative max-w-md mx-auto">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search AI insights..."
            value={filters.search}
            onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
            className="pl-10"
          />
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Categories:</span>
          {availableCategories.map(category => (
            <Badge
              key={category}
              variant={filters.categories.includes(category) ? "default" : "outline"}
              className="cursor-pointer hover:bg-saffron-100 hover:text-saffron-800 dark:hover:bg-saffron-900 dark:hover:text-saffron-200"
              onClick={() => toggleCategory(category)}
            >
              {category}
            </Badge>
          ))}
          {(filters.search || filters.categories.length > 0) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="text-xs"
            >
              Clear Filters
            </Button>
          )}
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-saffron-500" />
          <span className="ml-3 text-gray-600">Loading AI modules...</span>
        </div>
      )}

      {/* Error State */}
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Modules Grid */}
      {!loading && !error && (
        <>
          {filteredModules.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredModules.map(module => (
                <AiModuleCard
                  key={module.meta.id}
                  module={module}
                  onExplore={handleExploreModule}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Filter className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-300 mb-2">
                No insights match your search
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                Try different keywords or clear your filters to see all available AI insights.
              </p>
            </div>
          )}
        </>
      )}

      {/* Module Modal */}
      <AiModuleModal
        module={selectedModule}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        chartData={chartData}
        birthDetails={birthDetails}
        preferences={preferences}
        user={user}
      />
    </div>
  );
}
