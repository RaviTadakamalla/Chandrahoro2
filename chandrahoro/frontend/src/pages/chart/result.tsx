import { useState, useEffect, lazy, Suspense } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { ArrowLeft, Share2, TrendingUp, Sparkles } from 'lucide-react';
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
const MethodologySelector = lazy(() => import('@/components/chart/MethodologySelector'));
// Jaimini-specific components
const CharaKarakaDisplay = lazy(() => import('@/components/chart/CharaKarakaDisplay'));
const CharaDashaDisplay = lazy(() => import('@/components/chart/CharaDashaDisplay'));
const KarakamshaDisplay = lazy(() => import('@/components/chart/KarakamshaDisplay'));
const RashiDrishtiDisplay = lazy(() => import('@/components/chart/RashiDrishtiDisplay'));
// K.N. Rao's Jaimini components
const ArudhaPadaDisplay = lazy(() => import('@/components/chart/ArudhaPadaDisplay'));
const JaiminiYogaDisplay = lazy(() => import('@/components/chart/JaiminiYogaDisplay'));
const SthiraKarakaDisplay = lazy(() => import('@/components/chart/SthiraKarakaDisplay'));
const JaiminiPredictionsDisplay = lazy(() => import('@/components/chart/JaiminiPredictionsDisplay'));
// KP-specific components
const KPBasicChart = lazy(() => import('@/components/chart/KPBasicChart'));
const KPRulingPlanets = lazy(() => import('@/components/chart/KPRulingPlanets'));
const KPSignificators = lazy(() => import('@/components/chart/KPSignificators'));
const KPPredictions = lazy(() => import('@/components/chart/KPPredictions'));
// Western-specific components
const WesternChartWheel = lazy(() => import('@/components/chart/WesternChartWheel'));
const WesternAspectsTable = lazy(() => import('@/components/chart/WesternAspectsTable'));
const ChartPatternsDisplay = lazy(() => import('@/components/chart/ChartPatternsDisplay'));
const ElementBalanceChart = lazy(() => import('@/components/chart/ElementBalanceChart'));
import { LoadingOverlay, SkeletonChart, SkeletonCard, ChartLoadingState } from '@/components/ui/loading';
import { FullPageError, ErrorBoundary } from '@/components/ui/error-alert';
const TransitDisplay = lazy(() => import('@/components/chart/TransitDisplay'));
const IntensityAnalysisTab = lazy(() => import('@/components/chart/IntensityAnalysisTab'));
const AiInsightsHub = lazy(() => import('@/components/ai/AiInsightsHub'));
import { ResponsiveTable } from '@/components/ui/scrollable-table';
import { LazySection, LazyCard, LazyTable, LazyChart } from '@/components/ui/lazy-section';
import { ChartFallback, TableFallback, CardFallback, DisplayFallback, ButtonFallback } from '@/components/ui/suspense-fallback';
import type { ChartData, ChartRequest } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/lib/api';

export default function ChartResult() {
  const router = useRouter();
  const { user } = useAuth();
  const [chartData, setChartData] = useState<any | null>(null);
  const [chartRequest, setChartRequest] = useState<ChartRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [chartStyle, setChartStyle] = useState<'north' | 'south'>('north');
  const [activeTab, setActiveTab] = useState('overview');
  const [currentMethodology, setCurrentMethodology] = useState<string>('parashara'); // Default to Parashara
  const [recalculating, setRecalculating] = useState(false);

  useEffect(() => {
    // Load chart data from sessionStorage (primary) or localStorage (fallback)
    try {
      // Try sessionStorage first (from home page chart generation)
      let storedChart = sessionStorage.getItem('chartData');
      let storedBirthDetails = sessionStorage.getItem('birthDetails');
      let storedPreferences = sessionStorage.getItem('chartPreferences');

      // Fallback to localStorage (from old chart generation)
      if (!storedChart) {
        storedChart = localStorage.getItem('currentChart');
        const storedRequest = localStorage.getItem('chartRequest');

        if (storedRequest) {
          const request = JSON.parse(storedRequest);
          setChartRequest(request);
        }
      }

      if (storedChart) {
        const rawData = JSON.parse(storedChart);
        console.log('Loaded chart data:', rawData);
        console.log('Chart data keys:', Object.keys(rawData));

        // Check if this is the new multi-methodology format
        let data;
        if (rawData.methodologies && rawData.selected_methodology) {
          console.log('Detected multi-methodology format');
          const selectedMethod = rawData.selected_methodology;
          console.log('Selected methodology:', selectedMethod);

          // Extract the chart data for the selected methodology
          const methodologyData = rawData.methodologies[selectedMethod];

          // Create a combined data structure that preserves multi-methodology info
          // while also having the current methodology's data at the root level
          data = {
            ...methodologyData,  // Current methodology's data at root level
            methodology: selectedMethod,
            selected_methodology: selectedMethod,
            methodologies: rawData.methodologies,  // Preserve all methodologies
            calculation_summary: rawData.calculation_summary,  // Preserve summary
            birth_data: rawData.birth_data  // Preserve original birth data
          };

          console.log('Extracted chart data for methodology:', selectedMethod);
          console.log('Available methodologies:', Object.keys(rawData.methodologies));
        } else {
          // Old format - use as is
          console.log('Using legacy single-methodology format');
          data = rawData;
        }

        console.log('Ascendant sign:', data.ascendant_sign);
        console.log('Ascendant degree:', data.ascendant);
        console.log('Ascendant type:', typeof data.ascendant);
        console.log('Planets:', data.planets);
        console.log('Birth info:', data.birth_info);

        // Normalize ascendant data if it's an object (for backward compatibility)
        if (data.ascendant && typeof data.ascendant === 'object') {
          console.log('Converting ascendant object to number for compatibility');
          const ascendantObj = data.ascendant;
          data.ascendant = ascendantObj.sidereal_longitude || ascendantObj.tropical_longitude || 0;
          if (!data.ascendant_sign && ascendantObj.sign_number !== undefined) {
            // Convert sign number to sign name if needed
            const signs = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
                          'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
            data.ascendant_sign = signs[ascendantObj.sign_number % 12];
          }
        }

        // Normalize planets data if it's an object (for backward compatibility)
        if (data.planets && typeof data.planets === 'object' && !Array.isArray(data.planets)) {
          console.log('Converting planets object to array for compatibility');
          const planetsObj = data.planets;
          const planetsArray = [];

          const signs = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
                        'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
          const nakshatras = [
            'Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira', 'Ardra',
            'Punarvasu', 'Pushya', 'Ashlesha', 'Magha', 'Purva Phalguni', 'Uttara Phalguni',
            'Hasta', 'Chitra', 'Swati', 'Vishakha', 'Anuradha', 'Jyeshtha',
            'Mula', 'Purva Ashadha', 'Uttara Ashadha', 'Shravana', 'Dhanishta', 'Shatabhisha',
            'Purva Bhadrapada', 'Uttara Bhadrapada', 'Revati'
          ];

          for (const [planetName, planetData] of Object.entries(planetsObj)) {
            const pd = planetData as any;
            planetsArray.push({
              name: planetName,
              sign: signs[pd.sign_number % 12],
              degree_in_sign: pd.degree_in_sign || 0,
              nakshatra: nakshatras[(pd.nakshatra_number - 1) % 27],
              pada: pd.pada || 1,
              retrograde: pd.retrograde || false,
              longitude: pd.sidereal_longitude || 0,
              sub_lord: pd.sub_lord,
              star_lord: pd.star_lord,
              sub_sub_lord: pd.sub_sub_lord
            });
          }

          data.planets = planetsArray;
        }

        setChartData(data);

        // If we have birth details from sessionStorage, create a chart request object
        if (storedBirthDetails && storedPreferences) {
          const birthDetails = JSON.parse(storedBirthDetails);
          const preferences = JSON.parse(storedPreferences);
          console.log('Loaded birth details:', birthDetails);
          console.log('Loaded preferences:', preferences);
          setChartRequest({
            birth_details: birthDetails,
            preferences: preferences
          });
          // Extract methodology from preferences or chart data
          setCurrentMethodology(preferences.methodology || data.methodology || 'parashara');
        } else if (data.methodology) {
          setCurrentMethodology(data.methodology);
        }
      } else {
        console.log('No chart data found in storage');
        setError('No chart data found. Please generate a new chart.');
      }
    } catch (error) {
      console.error('Error loading chart data:', error);
      setError('Failed to load chart data. Please try generating a new chart.');
    }

    setLoading(false);
  }, []);

  // Handle methodology change - now just switches between pre-calculated data
  const handleMethodologyChange = (newMethodology: string) => {
    console.log('Switching to methodology:', newMethodology);

    // Check if we have multi-methodology data
    if (chartData?.methodologies && chartData.methodologies[newMethodology]) {
      const methodologyData = chartData.methodologies[newMethodology];

      // Check if this methodology had an error
      if (methodologyData.error) {
        console.error(`Methodology ${newMethodology} failed:`, methodologyData.error_message);
        // Still allow switching to show the error
      }

      // Update current methodology
      setCurrentMethodology(newMethodology);

      // Update the root-level data to match the selected methodology
      const updatedChartData = {
        ...chartData,
        selected_methodology: newMethodology,
        // Copy core data from the selected methodology
        birth_info: methodologyData.birth_info,
        preferences: methodologyData.preferences,
        planets: methodologyData.planets || [],
        ascendant: methodologyData.ascendant || 0,
        ascendant_sign: methodologyData.ascendant_sign || '',
        houses: methodologyData.houses || [],
        ayanamsha_value: methodologyData.ayanamsha_value || 0,
        methodology: newMethodology,

        // Copy methodology-specific data to root level
        ...(newMethodology === 'parashara' && methodologyData.current_dasha ? {
          current_dasha: methodologyData.current_dasha,
          dasha_timeline: methodologyData.dasha_timeline,
          dasha_navigator: methodologyData.dasha_navigator,
          divisional_charts: methodologyData.divisional_charts,
          yogas: methodologyData.yogas,
          aspects: methodologyData.aspects,
          aspect_summary: methodologyData.aspect_summary,
          shadbala: methodologyData.shadbala,
          planetary_relationships: methodologyData.planetary_relationships,
          ashtakavarga: methodologyData.ashtakavarga
        } : {}),

        ...(newMethodology === 'kp' && methodologyData.kp_data ? {
          kp_data: methodologyData.kp_data
        } : {}),

        ...(newMethodology === 'jaimini' && methodologyData.jaimini_data ? {
          jaimini_data: methodologyData.jaimini_data
        } : {}),

        ...(newMethodology === 'western' && methodologyData.western_data ? {
          western_data: methodologyData.western_data
        } : {})
      };

      setChartData(updatedChartData);

      // Update stored data
      sessionStorage.setItem('chartData', JSON.stringify(updatedChartData));

      console.log('Switched to methodology:', newMethodology);
    } else {
      // Fallback for old single-methodology data
      console.warn('Multi-methodology data not available, using legacy single-methodology mode');
      setCurrentMethodology(newMethodology);
    }
  };

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
        onGoHome={() => router.push('/home')}
        type="error"
      />
    );
  }

  if (!chartData) {
    return (
      <FullPageError
        title="No Chart Data"
        message="No chart data available. Please generate a new chart."
        onGoHome={() => router.push('/home')}
        type="error"
      />
    );
  }

  // Render the chart result page
  return (
    <>
      <Head>
        <title>Vedic Chart Result - {chartRequest?.birth_details?.name || chartData?.birth_info?.name || 'Anonymous'}</title>
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
            <SaffronButton variant="ghost" size="sm" onClick={() => router.push('/home')}>
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
            <CardContent className="space-y-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 flex-1">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Name</label>
                    <p className="font-medium">{chartRequest?.birth_details?.name || chartData?.birth_info?.name || 'Not provided'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Date of Birth</label>
                    <p className="font-medium">{chartRequest?.birth_details?.date || chartData?.birth_info?.date || 'Not provided'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Time of Birth</label>
                    <p className="font-medium">{chartRequest?.birth_details?.time || chartData?.birth_info?.time || 'Unknown'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Location</label>
                    <p className="font-medium">{chartRequest?.birth_details?.location_name || chartData?.birth_info?.location_name || 'Not provided'}</p>
                  </div>
                </div>

                {/* Shareable Link */}
                <div className="flex-shrink-0">
                  <Suspense fallback={<ButtonFallback />}>
                    <ShareableLink chartData={chartData} />
                  </Suspense>
                </div>
              </div>

              {/* Methodology Selector */}
              <div className="border-t pt-6">
                <Suspense fallback={<div className="h-12 bg-muted animate-pulse rounded" />}>
                  <MethodologySelector
                    currentMethodology={currentMethodology}
                    onMethodologyChange={handleMethodologyChange}
                    className="max-w-md"
                    calculatedMethodologies={chartData?.calculation_summary?.successful_methodologies || []}
                  />
                </Suspense>
                {/* Show calculation summary if available */}
                {chartData?.calculation_summary && (
                  <div className="mt-2 text-sm text-muted-foreground">
                    <p>✓ Calculated {chartData.calculation_summary.successful} of {chartData.calculation_summary.total_methodologies} methodologies</p>
                    {chartData.calculation_summary.failed > 0 && (
                      <p className="text-yellow-600 dark:text-yellow-400">
                        ⚠ {chartData.calculation_summary.failed} methodology(ies) failed
                      </p>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Tabbed Navigation */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="w-full overflow-x-auto mb-8 scrollbar-hide">
              <TabsList className="inline-flex min-w-full w-max">
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
              <TabsTrigger
                value="ai-insights"
                className="text-xs lg:text-sm whitespace-nowrap flex-shrink-0 bg-gradient-to-r from-saffron-50 to-orange-50 dark:from-saffron-900/20 dark:to-orange-900/20 border-saffron-200 dark:border-saffron-700"
                disabled={!chartData}
              >
                <Sparkles className="h-3 w-3 mr-1" />
                AI Insights
              </TabsTrigger>
              {/* Jaimini-specific tab - always visible */}
              <TabsTrigger
                value="jaimini"
                className="text-xs lg:text-sm whitespace-nowrap flex-shrink-0 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 border-purple-200 dark:border-purple-700"
                disabled={!chartData?.methodologies?.jaimini || chartData?.methodologies?.jaimini?.error}
              >
                Jaimini Features
              </TabsTrigger>
              {/* KP-specific tab - always visible */}
              <TabsTrigger
                value="kp"
                className="text-xs lg:text-sm whitespace-nowrap flex-shrink-0 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-700"
                disabled={!chartData?.methodologies?.kp || chartData?.methodologies?.kp?.error}
              >
                KP Features
              </TabsTrigger>
              {/* Western-specific tab - always visible */}
              <TabsTrigger
                value="western"
                className="text-xs lg:text-sm whitespace-nowrap flex-shrink-0 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border-blue-200 dark:border-blue-700"
                disabled={!chartData?.methodologies?.western || chartData?.methodologies?.western?.error}
              >
                Western Features
              </TabsTrigger>
              </TabsList>
            </div>

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
                  <p className="text-2xl font-bold text-primary">{chartData?.ascendant_sign || 'Not available'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Degree</label>
                  <p className="text-xl font-medium">
                    {chartData?.ascendant
                      ? (typeof chartData.ascendant === 'number'
                          ? chartData.ascendant.toFixed(2)
                          : (chartData.ascendant.sidereal_longitude || chartData.ascendant.tropical_longitude || 0).toFixed(2))
                      : '0.00'}°
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Ayanamsha</label>
                  <p className="text-xl font-medium">{chartData?.ayanamsha_value ? chartData.ayanamsha_value.toFixed(2) : '0.00'}°</p>
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
                    {chartData?.planets?.map((planet: any) => (
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
              {chartData?.divisional_charts && (
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
              {chartData?.dasha_navigator && (
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
              {!chartData?.dasha_navigator && chartData?.dasha_timeline?.mahadashas && (
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
              {!chartData?.dasha_navigator && !chartData?.dasha_timeline?.mahadashas && (
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
              {chartData?.shadbala ? (
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
              {chartData?.planetary_relationships && (
                <Card>
                  <CardContent className="p-6">
                    <Suspense fallback={<DisplayFallback />}>
                      <PlanetaryRelationshipsDisplay data={chartData.planetary_relationships} />
                    </Suspense>
                  </CardContent>
                </Card>
              )}

              {/* Aspects Table */}
              {chartData?.aspects && chartData?.aspect_summary && (
                <Card>
                  <CardContent className="p-6">
                    <Suspense fallback={<TableFallback rows={10} columns={5} />}>
                      <AspectsTable aspects={chartData.aspects} aspectSummary={chartData.aspect_summary} />
                    </Suspense>
                  </CardContent>
                </Card>
              )}

              {/* Ashtakavarga Display */}
              {chartData?.ashtakavarga && (
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
                  {chartData?.yogas && chartData.yogas.length > 0 ? (
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
              {chartData?.birth_info ? (
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

            {/* AI Insights Tab */}
            <TabsContent value="ai-insights" className="space-y-6">
              <Suspense fallback={<DisplayFallback />}>
                <AiInsightsHub
                  chartData={chartData}
                  birthDetails={chartRequest?.birth_details}
                  preferences={chartRequest?.preferences}
                  user={user}
                />
              </Suspense>
            </TabsContent>

            {/* Jaimini Features Tab - Always available */}
            <TabsContent value="jaimini" className="space-y-6">
              {chartData?.methodologies?.jaimini && !chartData.methodologies.jaimini.error ? (
                  <>
                    {/* Chara Karakas */}
                    {chartData.methodologies.jaimini.jaimini_data?.chara_karakas && (
                      <LazySection>
                        <Suspense fallback={<CardFallback />}>
                          <CharaKarakaDisplay charaKarakas={chartData.methodologies.jaimini.jaimini_data.chara_karakas} />
                        </Suspense>
                      </LazySection>
                    )}

                    {/* Karakamsha */}
                    {chartData.methodologies.jaimini.jaimini_data?.karakamsha && (
                      <LazySection>
                        <Suspense fallback={<CardFallback />}>
                          <KarakamshaDisplay karakamsha={chartData.methodologies.jaimini.jaimini_data.karakamsha} />
                        </Suspense>
                      </LazySection>
                    )}

                    {/* Chara Dasha */}
                    {chartData.methodologies.jaimini.jaimini_data?.chara_dasha && (
                      <LazySection>
                        <Suspense fallback={<CardFallback />}>
                          <CharaDashaDisplay charaDasha={chartData.methodologies.jaimini.jaimini_data.chara_dasha} />
                        </Suspense>
                      </LazySection>
                    )}

                    {/* Rashi Drishti */}
                    {chartData.methodologies.jaimini.jaimini_data?.rashi_drishti && (
                      <LazySection>
                        <Suspense fallback={<CardFallback />}>
                          <RashiDrishtiDisplay
                            rashiDrishti={chartData.methodologies.jaimini.jaimini_data.rashi_drishti}
                            planets={chartData.methodologies.jaimini.planets || chartData.planets}
                          />
                        </Suspense>
                      </LazySection>
                    )}

                    {/* Sthira Karakas - K.N. Rao's Fixed Significators */}
                    {chartData.methodologies.jaimini.jaimini_data?.sthira_karakas && (
                      <LazySection>
                        <Suspense fallback={<CardFallback />}>
                          <SthiraKarakaDisplay sthiraKarakas={chartData.methodologies.jaimini.jaimini_data.sthira_karakas} />
                        </Suspense>
                      </LazySection>
                    )}

                    {/* Arudha Padas - K.N. Rao's Method */}
                    {chartData.methodologies.jaimini.jaimini_data?.arudha_padas && (
                      <LazySection>
                        <Suspense fallback={<CardFallback />}>
                          <ArudhaPadaDisplay arudhaPadas={chartData.methodologies.jaimini.jaimini_data.arudha_padas} />
                        </Suspense>
                      </LazySection>
                    )}

                    {/* Jaimini Yogas - K.N. Rao's Method */}
                    {chartData.methodologies.jaimini.jaimini_data?.jaimini_yogas && chartData.methodologies.jaimini.jaimini_data.jaimini_yogas.length > 0 && (
                      <LazySection>
                        <Suspense fallback={<CardFallback />}>
                          <JaiminiYogaDisplay jaiminiYogas={chartData.methodologies.jaimini.jaimini_data.jaimini_yogas} />
                        </Suspense>
                      </LazySection>
                    )}

                    {/* Three-Dimensional Analysis - K.N. Rao's Method */}
                    {chartData.methodologies.jaimini.jaimini_data?.three_dimensional_analysis && (
                      <LazySection>
                        <Suspense fallback={<CardFallback />}>
                          <JaiminiPredictionsDisplay
                            threeDimensionalAnalysis={chartData.methodologies.jaimini.jaimini_data.three_dimensional_analysis}
                          />
                        </Suspense>
                      </LazySection>
                    )}
                  </>
                ) : chartData?.methodologies?.jaimini?.error ? (
                  <Card>
                    <CardHeader>
                      <CardTitle>Jaimini Features</CardTitle>
                      <CardDescription>Error calculating Jaimini data</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-red-600 dark:text-red-400">
                        {chartData.methodologies.jaimini.error_message || 'Failed to calculate Jaimini methodology'}
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <Card>
                    <CardHeader>
                      <CardTitle>Jaimini Features</CardTitle>
                      <CardDescription>Jaimini-specific calculations</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground">
                        No Jaimini data available. Please recalculate the chart.
                      </p>
                    </CardContent>
                  </Card>
                )}
            </TabsContent>

            {/* KP Features Tab - Always available */}
            <TabsContent value="kp" className="space-y-6">
              {chartData?.methodologies?.kp && !chartData.methodologies.kp.error ? (
                  <>
                    {/* House Cusps & Sub-Lords */}
                    {chartData.methodologies.kp.kp_data?.house_cusps && chartData.methodologies.kp.kp_data?.house_cusp_sub_lords && (
                      <LazySection>
                        <Suspense fallback={<CardFallback />}>
                          <KPBasicChart
                            houseCusps={chartData.methodologies.kp.kp_data.house_cusps}
                            houseCuspSubLords={chartData.methodologies.kp.kp_data.house_cusp_sub_lords}
                          />
                        </Suspense>
                      </LazySection>
                    )}

                    {/* Ruling Planets */}
                    {chartData.methodologies.kp.kp_data?.ruling_planets && (
                      <LazySection>
                        <Suspense fallback={<CardFallback />}>
                          <KPRulingPlanets rulingPlanets={chartData.methodologies.kp.kp_data.ruling_planets} />
                        </Suspense>
                      </LazySection>
                    )}

                    {/* Significators */}
                    {chartData.methodologies.kp.kp_data?.house_significators && chartData.methodologies.kp.kp_data?.planet_significators && (
                      <LazySection>
                        <Suspense fallback={<CardFallback />}>
                          <KPSignificators
                            houseSignificators={chartData.methodologies.kp.kp_data.house_significators}
                            planetSignificators={chartData.methodologies.kp.kp_data.planet_significators}
                          />
                        </Suspense>
                      </LazySection>
                    )}

                    {/* Event Predictions */}
                    {chartData.methodologies.kp.kp_data?.predictions && chartData.methodologies.kp.kp_data.predictions.length > 0 && (
                      <LazySection>
                        <Suspense fallback={<CardFallback />}>
                          <KPPredictions predictions={chartData.methodologies.kp.kp_data.predictions} />
                        </Suspense>
                      </LazySection>
                    )}
                  </>
                ) : chartData?.methodologies?.kp?.error ? (
                  <Card>
                    <CardHeader>
                      <CardTitle>KP Features</CardTitle>
                      <CardDescription>Error calculating KP data</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-red-600 dark:text-red-400">
                        {chartData.methodologies.kp.error_message || 'Failed to calculate KP methodology'}
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <Card>
                    <CardHeader>
                      <CardTitle>KP Features</CardTitle>
                      <CardDescription>KP-specific calculations</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground">
                        No KP data available. Please recalculate the chart.
                      </p>
                    </CardContent>
                  </Card>
                )}
            </TabsContent>

            {/* Western Features Tab - Always available */}
            <TabsContent value="western" className="space-y-6">
              {chartData?.methodologies?.western && !chartData.methodologies.western.error ? (
                  <>
                    {/* Western Chart Wheel */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Western Chart Wheel</CardTitle>
                        <CardDescription>Circular 360° chart with tropical zodiac</CardDescription>
                      </CardHeader>
                      <CardContent className="flex justify-center">
                        <Suspense fallback={<DisplayFallback />}>
                          <WesternChartWheel
                            planets={chartData.methodologies.western.planets || chartData.planets}
                            ascendant={chartData.methodologies.western.ascendant || chartData.ascendant}
                            aspects={chartData.methodologies.western.western_data?.aspects || []}
                            size={500}
                          />
                        </Suspense>
                      </CardContent>
                    </Card>

                    {/* Aspects Table */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Western Aspects</CardTitle>
                        <CardDescription>Major and minor aspects with orbs</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Suspense fallback={<DisplayFallback />}>
                          <WesternAspectsTable aspects={chartData.methodologies.western.western_data?.aspects || []} />
                        </Suspense>
                      </CardContent>
                    </Card>

                    {/* Chart Patterns */}
                    {chartData.methodologies.western.western_data?.chart_patterns && chartData.methodologies.western.western_data.chart_patterns.length > 0 && (
                      <Suspense fallback={<DisplayFallback />}>
                        <ChartPatternsDisplay patterns={chartData.methodologies.western.western_data.chart_patterns} />
                      </Suspense>
                    )}

                    {/* Element Balance */}
                    {chartData.methodologies.western.western_data?.element_balance && (
                      <Suspense fallback={<DisplayFallback />}>
                        <ElementBalanceChart balance={chartData.methodologies.western.western_data.element_balance} />
                      </Suspense>
                    )}

                    {/* Planetary Dignities */}
                    {chartData.methodologies.western.western_data?.dignities && Object.keys(chartData.methodologies.western.western_data.dignities).length > 0 && (
                      <Card>
                        <CardHeader>
                          <CardTitle>Planetary Dignities</CardTitle>
                          <CardDescription>Essential dignities and debilities</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            {Object.entries(chartData.methodologies.western.western_data.dignities).map(([planetName, dignity]: [string, any]) => (
                              <div key={planetName} className="flex items-center justify-between p-3 border rounded-lg">
                                <div className="flex items-center gap-3">
                                  <span className="font-semibold text-lg">{planetName}</span>
                                  <span className="text-sm text-muted-foreground">in {dignity.sign}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                    dignity.dignity === 'Domicile' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                                    dignity.dignity === 'Exaltation' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                                    dignity.dignity === 'Detriment' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' :
                                    dignity.dignity === 'Fall' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                                    'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
                                  }`}>
                                    {dignity.dignity}
                                  </span>
                                  <span className="text-sm font-medium">Score: {dignity.score}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </>
                ) : chartData?.methodologies?.western?.error ? (
                  <Card>
                    <CardHeader>
                      <CardTitle>Western Features</CardTitle>
                      <CardDescription>Error calculating Western data</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-red-600 dark:text-red-400">
                        {chartData.methodologies.western.error_message || 'Failed to calculate Western methodology'}
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <Card>
                    <CardHeader>
                      <CardTitle>Western Features</CardTitle>
                      <CardDescription>Western astrology calculations</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground">
                        No Western data available. Please recalculate the chart.
                      </p>
                    </CardContent>
                  </Card>
                )}
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
