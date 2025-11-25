import React, { useState } from 'react';
import { ResponsiveTable } from '@/components/ui/scrollable-table';

interface RelationshipDetail {
  natural_relationship: string;
  temporary_relationship: string;
  final_relationship: string;
  relationship_strength: number;
  description: string;
}

interface RelationshipSummary {
  total_relationships: number;
  relationship_counts: Record<string, number>;
  relationship_percentages: Record<string, number>;
  harmony_score: number;
  harmony_grade: string;
}

interface StrongestRelationship {
  planet1: string;
  planet2: string;
  relationship: string;
  strength: number;
}

interface PlanetaryRelationshipsData {
  relationships: Record<string, Record<string, RelationshipDetail>>;
  summary: RelationshipSummary;
  strongest_friendships: StrongestRelationship[];
  strongest_enmities: StrongestRelationship[];
}

interface PlanetaryRelationshipsDisplayProps {
  data: PlanetaryRelationshipsData;
}

const PlanetaryRelationshipsDisplay: React.FC<PlanetaryRelationshipsDisplayProps> = ({ data }) => {
  const [selectedPlanet, setSelectedPlanet] = useState<string | null>(null);
  const planets = Object.keys(data.relationships);

  const getRelationshipColor = (relationship: string) => {
    switch (relationship) {
      case 'Great Friend': return 'bg-green-500 text-white';
      case 'Friend': return 'bg-green-300 text-green-900';
      case 'Neutral': return 'bg-gray-300 text-gray-900';
      case 'Enemy': return 'bg-red-300 text-red-900';
      case 'Great Enemy': return 'bg-red-500 text-white';
      default: return 'bg-gray-200 text-gray-700';
    }
  };

  const getRelationshipSymbol = (relationship: string) => {
    switch (relationship) {
      case 'Great Friend': return '💚';
      case 'Friend': return '💙';
      case 'Neutral': return '⚪';
      case 'Enemy': return '🧡';
      case 'Great Enemy': return '❤️';
      default: return '⚫';
    }
  };

  const getHarmonyColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 65) return 'text-green-500';
    if (score >= 50) return 'text-blue-500';
    if (score >= 35) return 'text-yellow-500';
    if (score >= 20) return 'text-orange-500';
    return 'text-red-500';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Planetary Relationships (Panchadha Maitri)
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Natural, temporary, and final relationships between planets
        </p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
          <div className="text-sm font-medium text-blue-800 dark:text-blue-200">Overall Harmony</div>
          <div className={`text-2xl font-bold ${getHarmonyColor(data.summary.harmony_score)}`}>
            {data.summary.harmony_score}%
          </div>
          <div className="text-xs text-blue-600 dark:text-blue-300">
            {data.summary.harmony_grade}
          </div>
        </div>
        
        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
          <div className="text-sm font-medium text-gray-800 dark:text-gray-200 mb-2">
            Relationship Distribution
          </div>
          <div className="space-y-1 text-xs">
            {Object.entries(data.summary.relationship_percentages).map(([type, percentage]) => (
              <div key={type} className="flex justify-between">
                <span className="flex items-center">
                  <span className="mr-1">{getRelationshipSymbol(type)}</span>
                  {type}
                </span>
                <span className="font-medium">{percentage}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Relationship Matrix */}
      <div className="space-y-4">
        <h4 className="text-lg font-medium text-gray-900 dark:text-white">
          Relationship Matrix
        </h4>
        
        {/* Mobile View - Planet Selector */}
        <div className="md:hidden">
          <select 
            value={selectedPlanet || ''} 
            onChange={(e) => setSelectedPlanet(e.target.value || null)}
            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          >
            <option value="">Select a planet to view relationships</option>
            {planets.map(planet => (
              <option key={planet} value={planet}>{planet}</option>
            ))}
          </select>
          
          {selectedPlanet && (
            <div className="mt-4 space-y-2">
              {Object.entries(data.relationships[selectedPlanet]).map(([otherPlanet, relationship]) => (
                <div key={otherPlanet} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">{selectedPlanet} → {otherPlanet}</span>
                    <span className={`px-2 py-1 text-xs rounded-full ${getRelationshipColor(relationship.final_relationship)}`}>
                      {relationship.final_relationship}
                    </span>
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    Natural: {relationship.natural_relationship} | 
                    Temporary: {relationship.temporary_relationship}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Desktop View - Full Matrix */}
        <div className="hidden md:block">
          <ResponsiveTable minWidth="600px">
            <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="p-2 text-left text-sm font-medium text-gray-900 dark:text-white">Planet</th>
                {planets.map(planet => (
                  <th key={planet} className="p-2 text-center text-sm font-medium text-gray-900 dark:text-white">
                    {planet}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {planets.map(planet1 => (
                <tr key={planet1}>
                  <td className="p-2 font-medium text-gray-900 dark:text-white">{planet1}</td>
                  {planets.map(planet2 => {
                    if (planet1 === planet2) {
                      return <td key={planet2} className="p-2 text-center">-</td>;
                    }
                    const relationship = data.relationships[planet1]?.[planet2];
                    if (!relationship) {
                      return <td key={planet2} className="p-2 text-center">-</td>;
                    }
                    return (
                      <td key={planet2} className="p-2 text-center">
                        <div 
                          className={`px-2 py-1 text-xs rounded-full ${getRelationshipColor(relationship.final_relationship)} cursor-help`}
                          title={relationship.description}
                        >
                          {getRelationshipSymbol(relationship.final_relationship)}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
          </ResponsiveTable>
        </div>
      </div>

      {/* Notable Relationships */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Strongest Friendships */}
        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
          <h4 className="text-sm font-medium text-green-800 dark:text-green-200 mb-3">
            Strongest Friendships
          </h4>
          <div className="space-y-2">
            {data.strongest_friendships.slice(0, 3).map((friendship, index) => (
              <div key={index} className="text-xs">
                <div className="font-medium text-green-900 dark:text-green-100">
                  {friendship.planet1} ↔ {friendship.planet2}
                </div>
                <div className="text-green-700 dark:text-green-300">
                  {friendship.relationship} (Strength: {friendship.strength})
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Strongest Enmities */}
        <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-200 dark:border-red-800">
          <h4 className="text-sm font-medium text-red-800 dark:text-red-200 mb-3">
            Strongest Enmities
          </h4>
          <div className="space-y-2">
            {data.strongest_enmities.slice(0, 3).map((enmity, index) => (
              <div key={index} className="text-xs">
                <div className="font-medium text-red-900 dark:text-red-100">
                  {enmity.planet1} ↔ {enmity.planet2}
                </div>
                <div className="text-red-700 dark:text-red-300">
                  {enmity.relationship} (Strength: {enmity.strength})
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
          Relationship Types
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-gray-600 dark:text-gray-400">
          <div><strong>Natural:</strong> Inherent planetary friendship/enmity</div>
          <div><strong>Temporary:</strong> Based on house positions in chart</div>
          <div><strong>Final:</strong> Combined natural + temporary relationship</div>
          <div><strong>Panchadha Maitri:</strong> Five-fold friendship system</div>
        </div>
      </div>
    </div>
  );
};

export default PlanetaryRelationshipsDisplay;
