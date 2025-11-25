import React, { useState } from 'react';
import { ResponsiveTable } from '@/components/ui/scrollable-table';

interface Aspect {
  aspecting_planet: string;
  aspected_planet: string;
  aspected_house: number;
  aspect_type: string;
  aspect_strength: number;
  orb: number;
  description: string;
  benefic: boolean;
}

interface AspectSummary {
  total_aspects: number;
  benefic_aspects: number;
  malefic_aspects: number;
  strongest_aspect: Aspect | null;
  weakest_aspect: Aspect | null;
  average_strength: number;
}

interface AspectsTableProps {
  aspects: Aspect[];
  aspectSummary: AspectSummary;
}

const AspectsTable: React.FC<AspectsTableProps> = ({ aspects, aspectSummary }) => {
  const [filterType, setFilterType] = useState<'all' | 'benefic' | 'malefic'>('all');
  const [sortBy, setSortBy] = useState<'strength' | 'orb' | 'planet'>('strength');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Filter aspects based on type
  const filteredAspects = aspects.filter(aspect => {
    if (filterType === 'benefic') return aspect.benefic;
    if (filterType === 'malefic') return !aspect.benefic;
    return true;
  });

  // Sort aspects
  const sortedAspects = [...filteredAspects].sort((a, b) => {
    let comparison = 0;
    
    switch (sortBy) {
      case 'strength':
        comparison = a.aspect_strength - b.aspect_strength;
        break;
      case 'orb':
        comparison = a.orb - b.orb;
        break;
      case 'planet':
        comparison = a.aspecting_planet.localeCompare(b.aspecting_planet);
        break;
    }
    
    return sortOrder === 'desc' ? -comparison : comparison;
  });

  const getAspectColor = (aspect: Aspect) => {
    if (aspect.benefic) {
      return aspect.aspect_strength >= 0.7 ? 'text-green-600' : 'text-green-500';
    } else {
      return aspect.aspect_strength >= 0.7 ? 'text-red-600' : 'text-red-500';
    }
  };

  const getAspectBadgeColor = (aspect: Aspect) => {
    if (aspect.benefic) {
      return aspect.aspect_strength >= 0.7 ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200' : 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300';
    } else {
      return aspect.aspect_strength >= 0.7 ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200' : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300';
    }
  };

  const getStrengthBar = (strength: number) => {
    const percentage = strength * 100;
    const color = strength >= 0.7 ? 'bg-blue-500' : strength >= 0.4 ? 'bg-yellow-500' : 'bg-gray-400';

    return (
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
        <div
          className={`h-2 rounded-full ${color}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Vedic Aspects (Drishti)
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Planetary aspects and their influences on houses and other planets
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
          <div className="text-sm font-medium text-blue-800 dark:text-blue-200">Total Aspects</div>
          <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">
            {aspectSummary.total_aspects || 0}
          </div>
        </div>

        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
          <div className="text-sm font-medium text-green-800 dark:text-green-200">Benefic</div>
          <div className="text-2xl font-bold text-green-900 dark:text-green-100">
            {aspectSummary.benefic_aspects || 0}
          </div>
          <div className="text-xs text-green-600 dark:text-green-300">
            {(aspectSummary.total_aspects || 0) > 0 ? Math.round(((aspectSummary.benefic_aspects || 0) / (aspectSummary.total_aspects || 1)) * 100) : 0}%
          </div>
        </div>

        <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-200 dark:border-red-800">
          <div className="text-sm font-medium text-red-800 dark:text-red-200">Malefic</div>
          <div className="text-2xl font-bold text-red-900 dark:text-red-100">
            {aspectSummary.malefic_aspects || 0}
          </div>
          <div className="text-xs text-red-600 dark:text-red-300">
            {(aspectSummary.total_aspects || 0) > 0 ? Math.round(((aspectSummary.malefic_aspects || 0) / (aspectSummary.total_aspects || 1)) * 100) : 0}%
          </div>
        </div>
        
        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
          <div className="text-sm font-medium text-gray-800 dark:text-gray-200">Avg Strength</div>
          <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {(aspectSummary.average_strength || 0).toFixed(2)}
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex gap-2">
          <select 
            value={filterType} 
            onChange={(e) => setFilterType(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
          >
            <option value="all">All Aspects</option>
            <option value="benefic">Benefic Only</option>
            <option value="malefic">Malefic Only</option>
          </select>
          
          <select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
          >
            <option value="strength">Sort by Strength</option>
            <option value="orb">Sort by Orb</option>
            <option value="planet">Sort by Planet</option>
          </select>
          
          <button
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            {sortOrder === 'asc' ? '↑' : '↓'}
          </button>
        </div>
        
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Showing {sortedAspects.length} of {aspects.length} aspects
        </div>
      </div>

      {/* Mobile View - Cards */}
      <div className="md:hidden space-y-3">
        {sortedAspects.map((aspect, index) => (
          <div key={index} className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-start mb-2">
              <div>
                <div className="font-medium text-gray-900 dark:text-white">
                  {aspect.aspecting_planet} → {aspect.aspected_planet}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {aspect.aspect_type} aspect to House {aspect.aspected_house}
                </div>
              </div>
              <span className={`px-2 py-1 text-xs rounded-full ${getAspectBadgeColor(aspect)}`}>
                {aspect.benefic ? 'Benefic' : 'Malefic'}
              </span>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Strength:</span>
                <span className="font-medium">{(aspect.aspect_strength || 0).toFixed(2)}</span>
              </div>
              {getStrengthBar(aspect.aspect_strength || 0)}

              <div className="flex justify-between text-sm">
                <span>Orb:</span>
                <span>{(aspect.orb || 0).toFixed(1)}°</span>
              </div>
              
              <div className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                {aspect.description}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop View - Table */}
      <div className="hidden md:block">
        <ResponsiveTable minWidth="800px">
          <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700">
              <th className="text-left p-3 text-sm font-medium text-gray-900 dark:text-white">Aspecting Planet</th>
              <th className="text-left p-3 text-sm font-medium text-gray-900 dark:text-white">Aspected Planet</th>
              <th className="text-left p-3 text-sm font-medium text-gray-900 dark:text-white">House</th>
              <th className="text-left p-3 text-sm font-medium text-gray-900 dark:text-white">Type</th>
              <th className="text-left p-3 text-sm font-medium text-gray-900 dark:text-white">Strength</th>
              <th className="text-left p-3 text-sm font-medium text-gray-900 dark:text-white">Orb</th>
              <th className="text-left p-3 text-sm font-medium text-gray-900 dark:text-white">Nature</th>
            </tr>
          </thead>
          <tbody>
            {sortedAspects.map((aspect, index) => (
              <tr key={index} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                <td className="p-3 font-medium text-gray-900 dark:text-white">
                  {aspect.aspecting_planet}
                </td>
                <td className="p-3 text-gray-700 dark:text-gray-300">
                  {aspect.aspected_planet}
                </td>
                <td className="p-3 text-gray-700 dark:text-gray-300">
                  {aspect.aspected_house}
                </td>
                <td className="p-3 text-gray-700 dark:text-gray-300">
                  {aspect.aspect_type}
                </td>
                <td className="p-3">
                  <div className="flex items-center space-x-2">
                    <span className={`font-medium ${getAspectColor(aspect)}`}>
                      {(aspect.aspect_strength || 0).toFixed(2)}
                    </span>
                    <div className="w-16">
                      {getStrengthBar(aspect.aspect_strength || 0)}
                    </div>
                  </div>
                </td>
                <td className="p-3 text-gray-700 dark:text-gray-300">
                  {(aspect.orb || 0).toFixed(1)}°
                </td>
                <td className="p-3">
                  <span className={`px-2 py-1 text-xs rounded-full ${getAspectBadgeColor(aspect)}`}>
                    {aspect.benefic ? 'Benefic' : 'Malefic'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </ResponsiveTable>
      </div>

      {/* Legend */}
      <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
          Vedic Aspect Types
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-gray-600 dark:text-gray-400">
          <div><strong>7th House:</strong> All planets aspect the 7th house from their position</div>
          <div><strong>Mars:</strong> Also aspects 4th and 8th houses</div>
          <div><strong>Jupiter:</strong> Also aspects 5th and 9th houses</div>
          <div><strong>Saturn:</strong> Also aspects 3rd and 10th houses</div>
          <div><strong>Orb:</strong> Deviation from exact aspect (closer = stronger)</div>
          <div><strong>Strength:</strong> Overall power of the aspect (0.0 - 1.0)</div>
        </div>
      </div>
    </div>
  );
};

export default AspectsTable;
