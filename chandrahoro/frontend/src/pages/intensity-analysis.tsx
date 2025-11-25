import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { apiClient, BirthDetails, ChartPreferences } from '../lib/api';

interface IntensityScore {
  wealth: number;
  business: number;
  health: number;
  wife: number;
  kids: number;
  career: number;
}

interface IntensityPeriod {
  mahadasha: string;
  bhukti: string;
  start_date: string;
  end_date: string;
  period_years: number;
  scores: IntensityScore;
  reasoning: Record<string, string>;
  maha_index: number;
  bhukti_index: number;
}

interface IntensityData {
  intensity_table: IntensityPeriod[];
  summary: {
    area_averages: Record<string, number>;
    best_periods: Record<string, { period: string; score: number }>;
    worst_periods: Record<string, { period: string; score: number }>;
    total_periods: number;
    overall_average: number;
    score_distribution: Record<string, number>;
  };
  trends: Record<string, any[]>;
  methodology: Record<string, string>;
  birth_info: any;
  total_periods: number;
  life_areas: string[];
}

const IntensityAnalysisPage: React.FC = () => {
  const router = useRouter();
  const [intensityData, setIntensityData] = useState<IntensityData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedArea, setSelectedArea] = useState<string>('wealth');
  const [selectedPeriod, setSelectedPeriod] = useState<IntensityPeriod | null>(null);
  const [showReasoning, setShowReasoning] = useState(false);

  const lifeAreas = [
    { key: 'wealth', label: 'Wealth', color: 'text-green-600' },
    { key: 'business', label: 'Business', color: 'text-blue-600' },
    { key: 'health', label: 'Health', color: 'text-red-600' },
    { key: 'wife', label: 'Marriage', color: 'text-pink-600' },
    { key: 'kids', label: 'Children', color: 'text-purple-600' },
    { key: 'career', label: 'Career', color: 'text-indigo-600' }
  ];

  useEffect(() => {
    loadIntensityAnalysis();
  }, []);

  const loadIntensityAnalysis = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get birth details from localStorage (for guest users)
      // Check both 'birthDetails' (direct) and 'chartRequest' (from chart generation)
      let birthDetails: BirthDetails | null = null;
      let preferences: ChartPreferences = { ayanamsha: 'Lahiri', house_system: 'Whole Sign', divisional_charts: ['D1', 'D9'] };

      // First try direct birthDetails storage
      const storedBirthDetails = localStorage.getItem('birthDetails');
      if (storedBirthDetails) {
        birthDetails = JSON.parse(storedBirthDetails);
        const storedPreferences = localStorage.getItem('chartPreferences');
        if (storedPreferences) {
          preferences = JSON.parse(storedPreferences);
        }
      } else {
        // Try chartRequest storage (from chart generation flow)
        const storedChartRequest = localStorage.getItem('chartRequest');
        if (storedChartRequest) {
          const chartRequest = JSON.parse(storedChartRequest);
          birthDetails = chartRequest.birth_details;
          preferences = chartRequest.preferences || preferences;
        }
      }

      if (!birthDetails) {
        setError('No birth details found. Please generate a chart first to access intensity analysis.');
        setLoading(false);
        return;
      }

      const response = await apiClient.calculateIntensityAnalysis({
        birth_details: birthDetails,
        preferences: preferences
      });

      if (response.success) {
        setIntensityData(response.data);
      } else {
        setError('Failed to calculate intensity analysis');
      }
    } catch (err: any) {
      console.error('Error loading intensity analysis:', err);
      setError(err.response?.data?.detail || 'Failed to load intensity analysis');
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number): string => {
    if (score >= 8.5) return 'bg-green-100 text-green-800';
    if (score >= 7.0) return 'bg-green-50 text-green-700';
    if (score >= 5.5) return 'bg-yellow-50 text-yellow-700';
    if (score >= 4.0) return 'bg-orange-50 text-orange-700';
    if (score >= 2.5) return 'bg-red-50 text-red-700';
    return 'bg-red-100 text-red-800';
  };

  const getScoreLabel = (score: number): string => {
    if (score >= 8.5) return 'Excellent';
    if (score >= 7.0) return 'Very Good';
    if (score >= 5.5) return 'Good';
    if (score >= 4.0) return 'Average';
    if (score >= 2.5) return 'Challenging';
    return 'Difficult';
  };

  const formatPeriod = (period: IntensityPeriod): string => {
    const startYear = period.start_date.substring(0, 4);
    const endYear = period.end_date.substring(0, 4);
    return `${startYear}-${endYear}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Calculating Dasha-Bhukti Intensity Analysis...</p>
        </div>
      </div>
    );
  }

  if (error) {
    const isMissingBirthDetails = error.includes('No birth details found');

    return (
      <>
        <Head>
          <title>Intensity Analysis Error - ChandraHoro</title>
        </Head>
        <div className="min-h-screen bg-gradient-to-br from-saffron-50 to-orange-50">
          <div className="container mx-auto px-4 py-8">
            <div className="max-w-2xl mx-auto text-center">
              <div className="bg-white rounded-lg shadow-lg p-8">
                <div className="text-saffron-500 text-6xl mb-6">
                  {isMissingBirthDetails ? '📊' : '⚠️'}
                </div>
                <h1 className="text-3xl font-bold text-charcoal mb-4">
                  {isMissingBirthDetails ? 'Generate Chart First' : 'Analysis Error'}
                </h1>
                <p className="text-gray-600 mb-8 text-lg">{error}</p>

                {isMissingBirthDetails ? (
                  <div className="space-y-4">
                    <p className="text-gray-500 mb-6">
                      To access Dasha-Bhukti Intensity Analysis, you need to generate a birth chart first.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                      <Link href="/" className="bg-saffron-500 text-white px-8 py-3 rounded-lg hover:bg-saffron-600 transition-colors font-semibold flex items-center justify-center">
                        <div className="w-5 h-5 mr-2">🏠</div>
                        Generate Chart
                      </Link>
                      <Link href="/charts" className="bg-gray-500 text-white px-8 py-3 rounded-lg hover:bg-gray-600 transition-colors font-semibold flex items-center justify-center">
                        <div className="w-5 h-5 mr-2">📊</div>
                        My Charts
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="space-x-4">
                    <Link href="/" className="bg-saffron-500 text-white px-6 py-3 rounded-lg hover:bg-saffron-600 transition-colors font-semibold">
                      Go Home
                    </Link>
                    <button
                      onClick={loadIntensityAnalysis}
                      className="bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition-colors font-semibold"
                    >
                      Retry
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (!intensityData) {
    return null;
  }

  return (
    <>
      <Head>
        <title>Dasha-Bhukti Intensity Analysis - ChandraHoro</title>
        <meta name="description" content="Comprehensive Dasha-Bhukti intensity analysis for life areas" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Dasha-Bhukti Intensity Analysis</h1>
                <p className="text-gray-600">
                  {intensityData.birth_info?.name && `${intensityData.birth_info.name} • `}
                  {intensityData.total_periods} periods analyzed
                </p>
              </div>
              <div className="flex space-x-4">
                <Link href="/" className="text-indigo-600 hover:text-indigo-800 font-medium">
                  ← Back to Home
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Summary Dashboard */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {lifeAreas.map((area) => {
              const average = intensityData.summary.area_averages[area.key] || 0;
              const best = intensityData.summary.best_periods[area.key];
              const worst = intensityData.summary.worst_periods[area.key];
              
              return (
                <div key={area.key} className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className={`text-lg font-semibold ${area.color}`}>{area.label}</h3>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getScoreColor(average)}`}>
                      {average.toFixed(1)}
                    </span>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-gray-600">Best Period:</span>
                      <div className="font-medium text-green-700">{best?.period || 'N/A'}</div>
                      <div className="text-green-600">Score: {best?.score || 0}</div>
                    </div>
                    <div>
                      <span className="text-gray-600">Worst Period:</span>
                      <div className="font-medium text-red-700">{worst?.period || 'N/A'}</div>
                      <div className="text-red-600">Score: {worst?.score || 0}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Life Area Selector */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Select Life Area</h2>
            <div className="flex flex-wrap gap-2">
              {lifeAreas.map((area) => (
                <button
                  key={area.key}
                  onClick={() => setSelectedArea(area.key)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    selectedArea === area.key
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {area.label}
                </button>
              ))}
            </div>
          </div>

          {/* Intensity Table */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">
                {lifeAreas.find(a => a.key === selectedArea)?.label} Intensity Timeline
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Period
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Mahadasha
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Bhukti
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Score
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rating
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {intensityData.intensity_table.slice(0, 50).map((period, index) => {
                    const score = period.scores[selectedArea as keyof IntensityScore];
                    return (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatPeriod(period)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {period.mahadasha}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {period.bhukti}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getScoreColor(score)}`}>
                            {score.toFixed(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {getScoreLabel(score)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <button
                            onClick={() => {
                              setSelectedPeriod(period);
                              setShowReasoning(true);
                            }}
                            className="text-indigo-600 hover:text-indigo-900 font-medium"
                          >
                            View Details
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Reasoning Modal */}
        {showReasoning && selectedPeriod && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[80vh] overflow-y-auto">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-gray-900">
                    {selectedPeriod.mahadasha}-{selectedPeriod.bhukti} Period Details
                  </h3>
                  <button
                    onClick={() => setShowReasoning(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>
                <p className="text-gray-600">
                  {formatPeriod(selectedPeriod)} • {selectedPeriod.period_years.toFixed(1)} years
                </p>
              </div>
              <div className="px-6 py-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {lifeAreas.map((area) => {
                    const score = selectedPeriod.scores[area.key as keyof IntensityScore];
                    const reasoning = selectedPeriod.reasoning[area.key];
                    
                    return (
                      <div key={area.key} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className={`font-semibold ${area.color}`}>{area.label}</h4>
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getScoreColor(score)}`}>
                            {score.toFixed(1)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700 leading-relaxed">{reasoning}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default IntensityAnalysisPage;
