import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { apiClient, BirthDetails, ChartPreferences } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingOverlay } from '@/components/ui/loading';

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

interface IntensityAnalysisTabProps {
  chartRequest: any;
}

const IntensityAnalysisTab: React.FC<IntensityAnalysisTabProps> = ({ chartRequest }) => {
  const [intensityData, setIntensityData] = useState<IntensityData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedArea, setSelectedArea] = useState<string>('wealth');
  const [selectedPeriod, setSelectedPeriod] = useState<IntensityPeriod | null>(null);
  const [showReasoning, setShowReasoning] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [periodsPerPage] = useState(20);

  const lifeAreas = [
    { key: 'wealth', label: 'Wealth', color: 'text-green-600' },
    { key: 'business', label: 'Business', color: 'text-blue-600' },
    { key: 'health', label: 'Health', color: 'text-red-600' },
    { key: 'wife', label: 'Marriage', color: 'text-pink-600' },
    { key: 'kids', label: 'Children', color: 'text-purple-600' },
    { key: 'career', label: 'Career', color: 'text-indigo-600' }
  ];

  const loadIntensityAnalysis = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!chartRequest?.birth_details) {
        setError('Birth details not available. Please regenerate the chart.');
        return;
      }

      const response = await apiClient.calculateIntensityAnalysis({
        birth_details: chartRequest.birth_details,
        preferences: chartRequest.preferences || { 
          ayanamsha: 'Lahiri', 
          house_system: 'Whole Sign', 
          divisional_charts: ['D1', 'D9'] 
        }
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

  // Pagination logic
  const totalPeriods = intensityData?.intensity_table.length || 0;
  const totalPages = Math.ceil(totalPeriods / periodsPerPage);
  const startIndex = (currentPage - 1) * periodsPerPage;
  const endIndex = startIndex + periodsPerPage;
  const currentPeriods = intensityData?.intensity_table.slice(startIndex, endIndex) || [];

  // Reset to page 1 when changing life areas
  const handleAreaChange = (area: string) => {
    setSelectedArea(area);
    setCurrentPage(1);
  };

  // Pagination controls
  const goToPage = (page: number) => {
    setCurrentPage(page);
    // Scroll to top of table when changing pages
    const tableElement = document.getElementById('intensity-table');
    if (tableElement) {
      tableElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      goToPage(currentPage - 1);
    }
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      goToPage(currentPage + 1);
    }
  };

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      // Show all pages if total is small
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Show smart pagination with ellipsis
      if (currentPage <= 3) {
        // Show first pages
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        // Show last pages
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        // Show middle pages
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      }
    }

    return pages;
  };

  // Auto-load when component mounts
  useEffect(() => {
    if (chartRequest?.birth_details) {
      loadIntensityAnalysis();
    }
  }, [chartRequest]);

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-6">
            <LoadingOverlay message="Calculating Dasha-Bhukti Intensity Analysis..." />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Intensity Analysis Error</CardTitle>
            <CardDescription>Unable to load intensity analysis</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <div className="text-red-500 text-4xl mb-4">⚠️</div>
              <p className="text-gray-600 mb-4">{error}</p>
              <button
                onClick={loadIntensityAnalysis}
                className="bg-saffron-500 text-white px-6 py-2 rounded-lg hover:bg-saffron-600 transition-colors"
              >
                Retry Analysis
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!intensityData) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Dasha-Bhukti Intensity Analysis</CardTitle>
            <CardDescription>Analyze life area intensities across your Vimshottari Dasha cycle</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <div className="text-saffron-500 text-4xl mb-4">📊</div>
              <p className="text-gray-600 mb-4">Click below to calculate your intensity analysis</p>
              <button
                onClick={loadIntensityAnalysis}
                className="bg-saffron-500 text-white px-6 py-2 rounded-lg hover:bg-saffron-600 transition-colors"
              >
                Calculate Analysis
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {lifeAreas.map((area) => {
          const average = intensityData.summary.area_averages[area.key] || 0;
          const best = intensityData.summary.best_periods[area.key];
          const worst = intensityData.summary.worst_periods[area.key];
          
          return (
            <Card key={area.key}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className={`text-sm font-semibold ${area.color}`}>{area.label}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getScoreColor(average)}`}>
                    {average.toFixed(1)}
                  </span>
                </div>
                <div className="space-y-2 text-xs">
                  <div>
                    <span className="text-gray-600">Best:</span>
                    <div className="font-medium text-green-700">{best?.period || 'N/A'}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Worst:</span>
                    <div className="font-medium text-red-700">{worst?.period || 'N/A'}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Life Area Selector */}
      <Card>
        <CardHeader>
          <CardTitle>Select Life Area</CardTitle>
          <CardDescription>Choose a life area to view detailed period analysis</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {lifeAreas.map((area) => (
              <button
                key={area.key}
                onClick={() => handleAreaChange(area.key)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedArea === area.key
                    ? 'bg-saffron-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {area.label}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Intensity Table */}
      <Card id="intensity-table">
        <CardHeader>
          <CardTitle>
            {lifeAreas.find(a => a.key === selectedArea)?.label} Intensity Timeline
          </CardTitle>
          <CardDescription>
            Showing {totalPeriods} Dasha-Bhukti periods with intensity scores
            {totalPages > 1 && (
              <span className="ml-2 text-xs text-gray-500">
                (Page {currentPage} of {totalPages})
              </span>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Period</th>
                  <th className="text-left py-2">Mahadasha</th>
                  <th className="text-left py-2">Bhukti</th>
                  <th className="text-left py-2">Score</th>
                  <th className="text-left py-2">Rating</th>
                  <th className="text-left py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentPeriods.map((period, index) => {
                  const score = period.scores[selectedArea as keyof IntensityScore];
                  const globalIndex = startIndex + index;
                  return (
                    <tr key={globalIndex} className="border-b hover:bg-gray-50">
                      <td className="py-2">{formatPeriod(period)}</td>
                      <td className="py-2 font-medium">{period.mahadasha}</td>
                      <td className="py-2">{period.bhukti}</td>
                      <td className="py-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getScoreColor(score)}`}>
                          {score.toFixed(1)}
                        </span>
                      </td>
                      <td className="py-2">{getScoreLabel(score)}</td>
                      <td className="py-2">
                        <button
                          onClick={() => {
                            setSelectedPeriod(period);
                            setShowReasoning(true);
                          }}
                          className="text-saffron-600 hover:text-saffron-800 font-medium text-xs"
                        >
                          Details
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="mt-6 flex items-center justify-between">
              {/* Page Info */}
              <div className="text-sm text-gray-600">
                Showing {startIndex + 1}-{Math.min(endIndex, totalPeriods)} of {totalPeriods} periods
              </div>

              {/* Pagination Buttons */}
              <div className="flex items-center gap-2">
                {/* Previous Button */}
                <button
                  onClick={goToPreviousPage}
                  disabled={currentPage === 1}
                  className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </button>

                {/* Page Numbers */}
                <div className="flex items-center gap-1">
                  {getPageNumbers().map((page, index) => (
                    <React.Fragment key={index}>
                      {page === '...' ? (
                        <span className="px-3 py-2 text-sm text-gray-500">...</span>
                      ) : (
                        <button
                          onClick={() => goToPage(page as number)}
                          className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                            currentPage === page
                              ? 'bg-saffron-500 text-white'
                              : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          {page}
                        </button>
                      )}
                    </React.Fragment>
                  ))}
                </div>

                {/* Next Button */}
                <button
                  onClick={goToNextPage}
                  disabled={currentPage === totalPages}
                  className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
  );
};

export default IntensityAnalysisTab;
