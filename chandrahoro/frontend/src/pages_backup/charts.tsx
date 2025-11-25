import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { MainNav } from '@/components/MainNav';
import { Footer } from '@/components/Footer';
import { SaffronButton } from '@/components/SaffronButton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { apiClient, BirthChart } from '@/lib/api';
import { Calendar, MapPin, Trash2, Eye, Plus } from 'lucide-react';

export default function ChartsPage() {
  const router = useRouter();
  const [charts, setCharts] = useState<BirthChart[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'name'>('date');
  const [filterText, setFilterText] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    // Check if user is authenticated
    if (!apiClient.isAuthenticated()) {
      router.push('/login');
      return;
    }

    loadCharts();
  }, []);

  const loadCharts = async () => {
    try {
      setIsLoading(true);
      setError('');
      const data = await apiClient.listCharts(0, 100);
      setCharts(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load charts';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteChart = async (chartId: string) => {
    try {
      setIsDeleting(true);
      await apiClient.deleteChart(chartId);
      setCharts(charts.filter(c => c.id !== chartId));
      setDeleteConfirm(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete chart';
      setError(errorMessage);
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredCharts = charts
    .filter(chart => {
      const searchTerm = filterText.toLowerCase();
      const name = (chart.name || 'Unnamed Chart').toLowerCase();
      const location = chart.birth_location.toLowerCase();
      return name.includes(searchTerm) || location.includes(searchTerm);
    })
    .sort((a, b) => {
      if (sortBy === 'date') {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      } else {
        const nameA = (a.name || 'Unnamed Chart').toLowerCase();
        const nameB = (b.name || 'Unnamed Chart').toLowerCase();
        return nameA.localeCompare(nameB);
      }
    });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <>
      <Head>
        <title>My Charts - ChandraHoro</title>
        <meta name="description" content="View and manage your birth charts" />
      </Head>

      <div className="min-h-screen bg-gradient-to-b from-sand to-offwhite dark:from-ink-80 dark:to-charcoal">
        <MainNav />

        <div className="container mx-auto px-4 py-12 md:py-16">
          {/* Header */}
          <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="font-poppins text-4xl font-bold text-charcoal dark:text-white mb-2">
                My Charts
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Manage and view your birth charts
              </p>
            </div>
            <Link href="/">
              <SaffronButton variant="primary" size="md" className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                New Chart
              </SaffronButton>
            </Link>
          </div>

          {/* Filters and Sort */}
          <div className="mb-6 flex flex-col md:flex-row gap-4">
            <input
              type="text"
              placeholder="Search by name or location..."
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              className="flex-1 px-4 py-2 rounded-lg border border-saffron-200 dark:border-saffron-800 bg-white dark:bg-ink-90 text-charcoal dark:text-white placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-saffron-500"
            />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'date' | 'name')}
              className="px-4 py-2 rounded-lg border border-saffron-200 dark:border-saffron-800 bg-white dark:bg-ink-90 text-charcoal dark:text-white focus:outline-none focus:ring-2 focus:ring-saffron-500"
            >
              <option value="date">Sort by Date (Newest)</option>
              <option value="name">Sort by Name</option>
            </select>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 rounded-lg bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 text-red-800 dark:text-red-200">
              {error}
            </div>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-saffron-500"></div>
              <p className="mt-4 text-gray-600 dark:text-gray-400">Loading your charts...</p>
            </div>
          )}

          {/* Empty State */}
          {!isLoading && filteredCharts.length === 0 && !error && (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  {filterText ? 'No charts match your search.' : 'You haven\'t created any charts yet.'}
                </p>
                {!filterText && (
                  <Link href="/">
                    <SaffronButton variant="primary" size="md">
                      Create Your First Chart
                    </SaffronButton>
                  </Link>
                )}
              </CardContent>
            </Card>
          )}

          {/* Charts Grid */}
          {!isLoading && filteredCharts.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCharts.map((chart) => (
                <Card key={chart.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="text-lg">
                      {chart.name || 'Unnamed Chart'}
                    </CardTitle>
                    <CardDescription>
                      {chart.ayanamsha} • {chart.house_system}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <Calendar className="w-4 h-4" />
                      {formatDate(chart.birth_date)}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <MapPin className="w-4 h-4" />
                      {chart.birth_location}
                    </div>
                    {chart.notes && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                        {chart.notes}
                      </p>
                    )}
                    <div className="flex gap-2 pt-4">
                      <Link href={`/chart/${chart.id}`} className="flex-1">
                        <SaffronButton
                          variant="primary"
                          size="sm"
                          className="w-full flex items-center justify-center gap-2"
                        >
                          <Eye className="w-4 h-4" />
                          View
                        </SaffronButton>
                      </Link>
                      {deleteConfirm === chart.id ? (
                        <div className="flex-1 flex gap-2">
                          <SaffronButton
                            variant="ghost"
                            size="sm"
                            className="flex-1"
                            onClick={() => setDeleteConfirm(null)}
                            disabled={isDeleting}
                          >
                            Cancel
                          </SaffronButton>
                          <SaffronButton
                            variant="primary"
                            size="sm"
                            className="flex-1 bg-red-600 hover:bg-red-700"
                            onClick={() => handleDeleteChart(chart.id)}
                            disabled={isDeleting}
                          >
                            {isDeleting ? 'Deleting...' : 'Delete'}
                          </SaffronButton>
                        </div>
                      ) : (
                        <SaffronButton
                          variant="ghost"
                          size="sm"
                          className="flex-1 flex items-center justify-center gap-2"
                          onClick={() => setDeleteConfirm(chart.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </SaffronButton>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        <Footer />
      </div>
    </>
  );
}

