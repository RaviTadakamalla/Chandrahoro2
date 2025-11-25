import { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { ArrowLeft, Download, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { NorthIndianChart } from '@/components/charts/NorthIndianChart';
import { DashaTimeline } from '@/components/features/DashaTimeline';
import { MainNav } from '@/components/MainNav';
import { Footer } from '@/components/Footer';
import { SaffronButton } from '@/components/SaffronButton';

export default function ChartPage() {
  const router = useRouter();
  const { id } = router.query;

  // Mock chart data
  const mockChartData = {
    name: 'Sample Chart',
    date: '1990-05-15',
    time: '14:30',
    location: 'Mumbai, India',
    ascendant: 30.38,
    ascendantSign: 'Aries',
    planets: [
      { name: 'Sun', sign: 'Aries', degree: 0.38, house: 1, retrograde: false },
      { name: 'Moon', sign: 'Cancer', degree: 9.60, house: 4, retrograde: false },
      { name: 'Mars', sign: 'Pisces', degree: 24.71, house: 12, retrograde: true },
      { name: 'Mercury', sign: 'Taurus', degree: 15.23, house: 2, retrograde: false },
      { name: 'Jupiter', sign: 'Cancer', degree: 22.45, house: 4, retrograde: false },
      { name: 'Venus', sign: 'Gemini', degree: 8.12, house: 3, retrograde: false },
      { name: 'Saturn', sign: 'Capricorn', degree: 18.56, house: 10, retrograde: false },
    ],
  };

  // Mock Dasha data
  const mockDashaData = {
    birth_nakshatra_lord: 'Venus',
    balance_at_birth_years: 12.5,
    current_dasha: {
      mahadasha: {
        planet: 'Saturn',
        start_date: '2015-11-15T00:00:00',
        end_date: '2034-11-15T00:00:00',
        duration_years: 19.0,
        is_balance: false,
      },
      antardasha: {
        planet: 'Mercury',
        start_date: '2023-05-15T00:00:00',
        end_date: '2026-01-23T00:00:00',
        duration_years: 2.7,
      },
      pratyantardasha: {
        planet: 'Jupiter',
        start_date: '2024-10-01T00:00:00',
        end_date: '2025-02-15T00:00:00',
        duration_years: 0.37,
      },
    },
    mahadashas: [
      {
        planet: 'Venus',
        start_date: '1990-05-15T14:30:00',
        end_date: '2002-11-15T14:30:00',
        duration_years: 12.5,
        is_balance: true,
      },
      {
        planet: 'Sun',
        start_date: '2002-11-15T14:30:00',
        end_date: '2008-11-15T14:30:00',
        duration_years: 6.0,
      },
      {
        planet: 'Moon',
        start_date: '2008-11-15T14:30:00',
        end_date: '2018-11-15T14:30:00',
        duration_years: 10.0,
      },
      {
        planet: 'Mars',
        start_date: '2018-11-15T14:30:00',
        end_date: '2025-11-15T14:30:00',
        duration_years: 7.0,
      },
      {
        planet: 'Rahu',
        start_date: '2025-11-15T14:30:00',
        end_date: '2043-11-15T14:30:00',
        duration_years: 18.0,
      },
      {
        planet: 'Jupiter',
        start_date: '2043-11-15T14:30:00',
        end_date: '2059-11-15T14:30:00',
        duration_years: 16.0,
      },
    ],
  };

  return (
    <>
      <Head>
        <title>Chart {id} - ChandraHoro Vedic Astrology</title>
        <meta name="description" content="Vedic horoscope chart analysis" />
      </Head>

      <main className="min-h-screen bg-gradient-to-b from-sand to-offwhite dark:from-ink-80 dark:to-charcoal">
        <MainNav />

        {/* Header */}
        <header className="border-b border-saffron-200 dark:border-saffron-900/30 bg-white/50 dark:bg-charcoal/50 backdrop-blur">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between gap-4">
            <SaffronButton variant="ghost" size="sm" onClick={() => router.push('/')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </SaffronButton>
            <div className="flex gap-2">
              <SaffronButton variant="outline" size="sm">
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </SaffronButton>
              <SaffronButton size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export PDF
              </SaffronButton>
            </div>
          </div>
        </header>

        {/* Chart Content */}
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Chart Visualization */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Birth Chart (D1 - Rāśi)</CardTitle>
                  <CardDescription>
                    {mockChartData.name} • {mockChartData.date} • {mockChartData.time}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex justify-center">
                  <NorthIndianChart
                    planets={mockChartData.planets}
                    ascendant={mockChartData.ascendant}
                    className="w-full max-w-md"
                  />
                </CardContent>
              </Card>

              {/* Planetary Positions */}
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Planetary Positions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-2">Planet</th>
                          <th className="text-left p-2">Sign</th>
                          <th className="text-left p-2">Degree</th>
                          <th className="text-left p-2">House</th>
                          <th className="text-left p-2">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {mockChartData.planets.map((planet) => (
                          <tr key={planet.name} className="border-b">
                            <td className="p-2 font-medium">{planet.name}</td>
                            <td className="p-2">{planet.sign}</td>
                            <td className="p-2">{planet.degree.toFixed(2)}°</td>
                            <td className="p-2">{planet.house}</td>
                            <td className="p-2">
                              {planet.retrograde ? (
                                <span className="text-destructive">Retrograde</span>
                              ) : (
                                <span className="text-muted-foreground">Direct</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Key Highlights Sidebar */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Key Highlights</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="text-sm text-muted-foreground">Ascendant</div>
                    <div className="text-lg font-semibold">
                      {mockChartData.ascendantSign} {mockChartData.ascendant.toFixed(2)}°
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Moon Sign</div>
                    <div className="text-lg font-semibold">Cancer</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Sun Sign</div>
                    <div className="text-lg font-semibold">Aries</div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Birth Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Date:</span>
                    <span className="font-medium">{mockChartData.date}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Time:</span>
                    <span className="font-medium">{mockChartData.time}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Location:</span>
                    <span className="font-medium">{mockChartData.location}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Active Yogas</CardTitle>
                  <CardDescription>Classical combinations detected</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-muted-foreground">
                    Yoga detection coming soon...
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        <Footer />
      </main>
    </>
  );
}