import { useState, useEffect, lazy, Suspense } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { ArrowLeft, Share2, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MainNav } from '@/components/MainNav';
import { Footer } from '@/components/Footer';
import { SaffronButton } from '@/components/SaffronButton';
// Lazy load chart components for better performance
const NorthIndianChart = lazy(() => import('@/components/chart/NorthIndianChart'));
const SouthIndianChart = lazy(() => import('@/components/chart/SouthIndianChart'));
const InteractiveNorthIndianChart = lazy(() => import('@/components/chart/InteractiveNorthIndianChart'));
const ChartStyleToggle = lazy(() => import('@/components/chart/ChartStyleToggle'));
const DashaDisplay = lazy(() => import('@/components/chart/DashaDisplay'));
const DashaTreeDisplay = lazy(() => import('@/components/chart/DashaTreeDisplay'));
const DashaNavigator = lazy(() => import('@/components/charts/DashaNavigator'));
const DivisionalChartDisplay = lazy(() => import('@/components/chart/DivisionalChartDisplay'));
const ChartExportMenu = lazy(() => import('@/components/chart/ChartExportMenu'));
const FloatingActionButton = lazy(() => import('@/components/chart/FloatingActionButton'));
const ShadbalaChart = lazy(() => import('@/components/chart/ShadbalaChart'));
const PlanetaryRelationshipsDisplay = lazy(() => import('@/components/chart/PlanetaryRelationshipsDisplay'));
const AspectsTable = lazy(() => import('@/components/chart/AspectsTable'));
const AshtakavargaDisplay = lazy(() => import('@/components/chart/AshtakavargaDisplay'));
const ShareableLink = lazy(() => import('@/components/chart/ShareableLink'));
const GeneralCharacteristics = lazy(() => import('@/components/chart/GeneralCharacteristics'));
import { LoadingOverlay, SkeletonChart, SkeletonCard, ChartLoadingState } from '@/components/ui/loading';
import { FullPageError, ErrorBoundary } from '@/components/ui/error-alert';
const TransitDisplay = lazy(() => import('@/components/chart/TransitDisplay'));
const IntensityAnalysisTab = lazy(() => import('@/components/chart/IntensityAnalysisTab'));
import { ResponsiveTable } from '@/components/ui/scrollable-table';
import { LazySection, LazyCard, LazyTable, LazyChart } from '@/components/ui/lazy-section';
import { ChartFallback, TableFallback, CardFallback, DisplayFallback, ButtonFallback } from '@/components/ui/suspense-fallback';
import type { ChartData, ChartRequest } from '@/lib/api';

export default function ChartResult() {
  const router = useRouter();
  const [chartData, setChartData] = useState<any | null>(null);
  const [chartRequest, setChartRequest] = useState<ChartRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [chartStyle, setChartStyle] = useState<'north' | 'south'>('north');
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    // Load chart data from localStorage
    try {
      const storedChart = localStorage.getItem('currentChart');
      const storedRequest = localStorage.getItem('chartRequest');

      if (storedChart) {
        const data = JSON.parse(storedChart);
        setChartData(data);
      } else {
        setError('No chart data found. Please generate a new chart.');
      }

      if (storedRequest) {
        const request = JSON.parse(storedRequest);
        setChartRequest(request);
      }
    } catch (error) {
      console.error('Error loading chart data:', error);
      setError('Failed to load chart data. Please try generating a new chart.');
    }

    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-4 py-8">
          <ChartLoadingState message="Loading your Vedic astrology chart..." />

          {/* Skeleton Layout */}
          <div className="mt-8 space-y-6">
            <SkeletonCard className="h-32" />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <SkeletonChart />
              <SkeletonCard className="h-64" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <SkeletonCard className="h-24" />
              <SkeletonCard className="h-24" />
              <SkeletonCard className="h-24" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <FullPageError
        title="Chart Loading Error"
        message={error}
        onRetry={() => window.location.reload()}
        onGoHome={() => router.push('/')}
        type="error"
      />
    );
  }

  if (!chartData) {
    return (
      <FullPageError
        title="No Chart Data"
        message="No chart data available. Please generate a new chart."
        onGoHome={() => router.push('/')}
        type="error"
      />
    );
  }

  return (
    <>
      <Head>
        <title>Vedic Chart Result - {chartData.birth_info.name || 'Anonymous'}</title>
        <meta name="description" content="Your personalized Vedic horoscope chart" />
      </Head>

      <main className="min-h-screen bg-gradient-to-b from-sand to-offwhite dark:from-ink-80 dark:to-charcoal">
        <MainNav />

        {/* Skip link for screen readers */}
        <a href="#chart-content" className="skip-link">
          Skip to chart content
        </a>

        {/* Header */}
        <header className="border-b border-saffron-200 dark:border-saffron-900/30 bg-white/50 dark:bg-charcoal/50 backdrop-blur">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between gap-4">
            <SaffronButton variant="ghost" size="sm" onClick={() => router.push('/')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </SaffronButton>
            <h1 className="font-poppins text-xl font-bold text-charcoal dark:text-white">Vedic Chart</h1>
            <div className="flex gap-2">
              <SaffronButton variant="outline" size="sm">
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </SaffronButton>
              {chartRequest && (
                <ChartExportMenu chartRequest={chartRequest} />
              )}
            </div>
          </div>
        </header>

        <div id="chart-content" className="container mx-auto px-4 py-8">
          {/* Birth Information */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Birth Information</CardTitle>
              <CardDescription>Personal details used for chart calculation</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 flex-1">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Name</label>
                    <p className="font-medium">{chartData.birth_info.name || 'Not provided'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Date of Birth</label>
                    <p className="font-medium">{chartData.birth_info.date}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Time of Birth</label>
                    <p className="font-medium">{chartData.birth_info.time || 'Unknown'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Location</label>
                    <p className="font-medium">{chartData.birth_info.location_name}</p>
                  </div>
                </div>

                {/* Shareable Link */}
                <div className="flex-shrink-0">
                  <Suspense fallback={<ButtonFallback />}>
                    <ShareableLink chartData={chartData} />
                  </Suspense>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tabbed Navigation */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="flex w-full overflow-x-auto mb-8 scrollbar-hide">
              <TabsTrigger value="characteristics" className="text-xs lg:text-sm whitespace-nowrap flex-shrink-0">Characteristics</TabsTrigger>
              <TabsTrigger value="overview" className="text-xs lg:text-sm whitespace-nowrap flex-shrink-0">Overview</TabsTrigger>
              <TabsTrigger value="chart" className="text-xs lg:text-sm whitespace-nowrap flex-shrink-0">Chart</TabsTrigger>
              <TabsTrigger value="divisional" className="text-xs lg:text-sm whitespace-nowrap flex-shrink-0">Divisional</TabsTrigger>
              <TabsTrigger value="dashas" className="text-xs lg:text-sm whitespace-nowrap flex-shrink-0">Dashas</TabsTrigger>
              <TabsTrigger value="intensity" className="text-xs lg:text-sm whitespace-nowrap flex-shrink-0">Intensity Analysis</TabsTrigger>
              <TabsTrigger value="strengths" className="text-xs lg:text-sm whitespace-nowrap flex-shrink-0">Strengths</TabsTrigger>
              <TabsTrigger value="yogas" className="text-xs lg:text-sm whitespace-nowrap flex-shrink-0">Yogas</TabsTrigger>
              <TabsTrigger value="transits" className="text-xs lg:text-sm whitespace-nowrap flex-shrink-0">Transits</TabsTrigger>
              <TabsTrigger value="insights" className="text-xs lg:text-sm whitespace-nowrap flex-shrink-0">Insights</TabsTrigger>
            </TabsList>

            {/* General Characteristics Tab */}
            <TabsContent value="characteristics" className="space-y-6">
              <LazySection>
                <Suspense fallback={<DisplayFallback />}>
                  <GeneralCharacteristics chartData={chartData} />
                </Suspense>
              </LazySection>
            </TabsContent>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              {/* Ascendant Information */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Ascendant (Lagna)</CardTitle>
              <CardDescription>Your rising sign and degree</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Ascendant Sign</label>
                  <p className="text-2xl font-bold text-primary">{chartData.ascendant_sign}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Degree</label>
                  <p className="text-xl font-medium">{chartData.ascendant.toFixed(2)}°</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Ayanamsha</label>
                  <p className="text-xl font-medium">{chartData.ayanamsha_value.toFixed(2)}°</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Planetary Positions */}
          <LazyTable rows={9} columns={6}>
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Planetary Positions</CardTitle>
                <CardDescription>Positions of all planets in signs and nakshatras</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveTable minWidth="700px">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">Planet</th>
                      <th className="text-left py-2">Sign</th>
                      <th className="text-left py-2">Degree</th>
                      <th className="text-left py-2">Nakshatra</th>
                      <th className="text-left py-2">Pada</th>
                      <th className="text-left py-2">House</th>
                      <th className="text-left py-2">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {chartData.planets.map((planet: any) => (
                      <tr key={planet.name} className="border-b">
                        <td className="py-2 font-medium">{planet.name}</td>
                        <td className="py-2">{planet.sign}</td>
                        <td className="py-2">{planet.degree_in_sign.toFixed(2)}°</td>
                        <td className="py-2">{planet.nakshatra}</td>
                        <td className="py-2">{planet.pada}</td>
                        <td className="py-2">{planet.house}</td>
                        <td className="py-2">
                          {planet.retrograde ? (
                            <span className="text-red-600 text-sm">Retrograde</span>
                          ) : (
                            <span className="text-green-600 text-sm">Direct</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </ResponsiveTable>
            </CardContent>
          </Card>
          </LazyTable>



            </TabsContent>

            {/* Chart Tab */}
            <TabsContent value="chart" className="space-y-6">
              <LazyChart type="circular">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>Birth Chart</CardTitle>
                        <CardDescription>Your complete Vedic horoscope chart</CardDescription>
                      </div>
                      <Suspense fallback={<ButtonFallback />}>
                      <ChartStyleToggle currentStyle={chartStyle} onStyleChange={setChartStyle} />
                    </Suspense>
                    </div>
                  </CardHeader>
                <CardContent>
                  <div className="flex justify-center">
                    <Suspense fallback={<ChartFallback />}>
                      {chartStyle === 'north' ? (
                        <InteractiveNorthIndianChart chartData={chartData} size={400} />
                      ) : (
                        <SouthIndianChart chartData={chartData} size={400} />
                      )}
                    </Suspense>
                  </div>
                </CardContent>
              </Card>
              </LazyChart>
            </TabsContent>

            {/* Divisional Charts Tab */}
            <TabsContent value="divisional" className="space-y-6">
              {chartData.divisional_charts && (
                <LazySection>
                  <Suspense fallback={<DisplayFallback />}>
                    <DivisionalChartDisplay
                      divisionalCharts={chartData.divisional_charts}
                      chartStyle={chartStyle}
                    />
                  </Suspense>
                </LazySection>
              )}
            </TabsContent>

            {/* Dashas Tab */}
            <TabsContent value="dashas" className="space-y-6">
              {chartData.dasha_navigator && (
                <LazySection>
                  <Suspense fallback={<DisplayFallback />}>
                    <DashaNavigator
                      dashaData={chartData.dasha_navigator}
                      currentDasha={chartData.current_dasha}
                    />
                  </Suspense>
                </LazySection>
              )}

              {/* Fallback to tree display if navigator data not available */}
              {!chartData.dasha_navigator && chartData.dasha_timeline?.mahadashas && (
                <LazyCard>
                  <Card>
                    <CardContent className="p-6">
                      <Suspense fallback={<DisplayFallback />}>
                        <DashaTreeDisplay
                          dashaTimeline={chartData.dasha_timeline.mahadashas}
                          currentDasha={chartData.current_dasha}
                        />
                      </Suspense>
                    </CardContent>
                  </Card>
                </LazyCard>
              )}

              {/* Show message if no dasha data available */}
              {!chartData.dasha_navigator && !chartData.dasha_timeline?.mahadashas && (
                <Card>
                  <CardContent className="p-6 text-center">
                    <p className="text-gray-600">No Dasha data available. Please regenerate the chart.</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Intensity Analysis Tab */}
            <TabsContent value="intensity" className="space-y-6">
              <LazySection>
                <Suspense fallback={<DisplayFallback />}>
                  <IntensityAnalysisTab chartRequest={chartRequest} />
                </Suspense>
              </LazySection>
            </TabsContent>

            {/* Strengths Tab */}
            <TabsContent value="strengths" className="space-y-6">
              {chartData.shadbala ? (
                <Card>
                  <CardContent className="p-6">
                    <Suspense fallback={<DisplayFallback />}>
                      <ShadbalaChart data={chartData.shadbala} />
                    </Suspense>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle>Planetary Strengths</CardTitle>
                    <CardDescription>Shadbala and Ashtakavarga analysis</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">Planetary strength analysis coming soon...</p>
                  </CardContent>
                </Card>
              )}

              {/* Planetary Relationships */}
              {chartData.planetary_relationships && (
                <Card>
                  <CardContent className="p-6">
                    <Suspense fallback={<DisplayFallback />}>
                      <PlanetaryRelationshipsDisplay data={chartData.planetary_relationships} />
                    </Suspense>
                  </CardContent>
                </Card>
              )}

              {/* Aspects Table */}
              {chartData.aspects && chartData.aspect_summary && (
                <Card>
                  <CardContent className="p-6">
                    <Suspense fallback={<TableFallback rows={10} columns={5} />}>
                      <AspectsTable aspects={chartData.aspects} aspectSummary={chartData.aspect_summary} />
                    </Suspense>
                  </CardContent>
                </Card>
              )}

              {/* Ashtakavarga Display */}
              {chartData.ashtakavarga && (
                <Card>
                  <CardContent className="p-6">
                    <Suspense fallback={<DisplayFallback />}>
                      <AshtakavargaDisplay data={chartData.ashtakavarga} />
                    </Suspense>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Yogas Tab */}
            <TabsContent value="yogas" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Yogas Detected</CardTitle>
                  <CardDescription>Planetary combinations and their effects</CardDescription>
                </CardHeader>
                <CardContent>
                  {chartData.yogas && chartData.yogas.length > 0 ? (
                    <div className="space-y-4">
                      {chartData.yogas.map((yoga: any, index: number) => (
                        <div key={index} className="p-4 border rounded-lg">
                          <h4 className="font-semibold text-lg">{yoga.name}</h4>
                          <p className="text-sm text-muted-foreground mb-2">{yoga.type} • Strength: {yoga.strength}</p>
                          <p className="text-sm">{yoga.description}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">No significant yogas detected in this chart.</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Transits Tab */}
            <TabsContent value="transits" className="space-y-6">
              {chartData.birth_info ? (
                <Card>
                  <CardContent className="p-6">
                    <Suspense fallback={<DisplayFallback />}>
                      <TransitDisplay
                        birthDetails={{
                          birth_date: chartData.birth_info.birth_date,
                          birth_time: chartData.birth_info.birth_time,
                          latitude: chartData.birth_info.latitude,
                          longitude: chartData.birth_info.longitude
                      }}
                    />
                    </Suspense>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle>Current Transits</CardTitle>
                    <CardDescription>Current planetary positions and their effects</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">Birth details not available for transit calculation.</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Insights Tab */}
            <TabsContent value="insights" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Chart Insights</CardTitle>
                  <CardDescription>AI-powered interpretations and guidance</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">AI insights coming soon...</p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Floating Action Button */}
        <Suspense fallback={<div className="fixed bottom-6 right-6 w-14 h-14 bg-muted rounded-full animate-pulse" />}>
          <FloatingActionButton chartRequest={chartRequest} />
        </Suspense>

        <Footer />
      </main>
    </>
  );
}
