/**
 * My Reports Page
 *
 * View, download, and manage all AI-generated astrology reports
 */

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { FileText, Download, Eye, Trash2, RefreshCw, Loader2, AlertCircle, Filter } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { API_URL } from '@/lib/constants';
import { useAuth } from '@/contexts/AuthContext';
import { MainNav } from '@/components/MainNav';

interface AiReport {
  id: string;
  report_type: string;
  title: string;
  description: string;
  person_name: string;
  birth_date: string;
  status: string;
  version: string;
  is_latest: boolean;
  view_count: string;
  downloaded_count: string;
  user_rating: string | null;
  created_at: string;
  updated_at: string;
}

interface ReportListResponse {
  reports: AiReport[];
  total: number;
  page: number;
  page_size: number;
  has_more: boolean;
}

export default function MyReportsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [reports, setReports] = useState<AiReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [filterType, setFilterType] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [totalReports, setTotalReports] = useState(0);
  const [hasMore, setHasMore] = useState(false);

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  // Load reports
  useEffect(() => {
    if (user) {
      loadReports();
    }
  }, [user, filterType, page]);

  const loadReports = async () => {
    setLoading(true);
    setError('');

    try {
      const params = new URLSearchParams({
        page: page.toString(),
        page_size: '20',
        only_latest: 'true',
      });

      if (filterType !== 'all') {
        params.append('report_type', filterType);
      }

      const response = await fetch(`${API_URL}/api/v1/ai-reports?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to load reports');
      }

      const data: ReportListResponse = await response.json();
      setReports(data.reports);
      setTotalReports(data.total);
      setHasMore(data.has_more);
    } catch (err) {
      console.error('Error loading reports:', err);
      setError(err instanceof Error ? err.message : 'Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (reportId: string, title: string) => {
    try {
      const response = await fetch(`${API_URL}/api/v1/ai-reports/${reportId}/download`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to download report');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${title.replace(/\s+/g, '-').toLowerCase()}.html`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Download error:', err);
      alert('Failed to download report. Please try again.');
    }
  };

  const handleView = (reportId: string) => {
    // Open report in new tab
    window.open(`${API_URL}/api/v1/ai-reports/${reportId}`, '_blank');
  };

  const handleDelete = async (reportId: string) => {
    if (!confirm('Are you sure you want to delete this report?')) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/v1/ai-reports/${reportId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete report');
      }

      // Reload reports
      loadReports();
    } catch (err) {
      console.error('Delete error:', err);
      alert('Failed to delete report. Please try again.');
    }
  };

  const handleRegenerate = (reportId: string) => {
    // TODO: Implement regeneration
    alert('Regeneration feature coming soon!');
  };

  const getReportTypeLabel = (type: string): string => {
    const labels: Record<string, string> = {
      'chart_interpretation': 'Chart Interpretation',
      'dasha_predictions': 'Dasha Predictions',
      'transit_analysis': 'Transit Analysis',
      'yoga_analysis': 'Yoga Analysis',
      'remedial_measures': 'Remedial Measures',
      'compatibility_analysis': 'Compatibility',
      'question_answer': 'Q&A',
    };
    return labels[type] || type;
  };

  const getReportTypeBadgeColor = (type: string): string => {
    const colors: Record<string, string> = {
      'chart_interpretation': 'bg-blue-100 text-blue-800',
      'dasha_predictions': 'bg-purple-100 text-purple-800',
      'transit_analysis': 'bg-green-100 text-green-800',
      'yoga_analysis': 'bg-yellow-100 text-yellow-800',
      'remedial_measures': 'bg-red-100 text-red-800',
      'compatibility_analysis': 'bg-pink-100 text-pink-800',
      'question_answer': 'bg-gray-100 text-gray-800',
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  if (authLoading || (loading && reports.length === 0)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-saffron-50 to-orange-50">
        <MainNav />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-saffron-500" />
            <span className="ml-3 text-gray-600">Loading reports...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-saffron-50 to-orange-50">
      <MainNav />

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-saffron-100 rounded-lg">
              <FileText className="h-6 w-6 text-saffron-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Reports</h1>
              <p className="text-muted-foreground">
                View and manage your AI-generated astrology reports
              </p>
            </div>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <Select value={filterType} onValueChange={(value) => { setFilterType(value); setPage(1); }}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Reports</SelectItem>
                  <SelectItem value="chart_interpretation">Chart Interpretation</SelectItem>
                  <SelectItem value="dasha_predictions">Dasha Predictions</SelectItem>
                  <SelectItem value="transit_analysis">Transit Analysis</SelectItem>
                  <SelectItem value="yoga_analysis">Yoga Analysis</SelectItem>
                  <SelectItem value="remedial_measures">Remedial Measures</SelectItem>
                  <SelectItem value="compatibility_analysis">Compatibility</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="ml-auto text-sm text-gray-600">
              {totalReports} {totalReports === 1 ? 'report' : 'reports'} total
            </div>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Reports Grid */}
        {reports.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reports.map((report) => (
              <Card key={report.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <Badge className={getReportTypeBadgeColor(report.report_type)}>
                      {getReportTypeLabel(report.report_type)}
                    </Badge>
                    {report.is_latest && (
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        Latest
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="text-lg mt-2">{report.title}</CardTitle>
                  <CardDescription>
                    {report.person_name && `${report.person_name} • `}
                    {new Date(report.created_at).toLocaleDateString()}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Stats */}
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Eye className="h-4 w-4" />
                        <span>{report.view_count} views</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Download className="h-4 w-4" />
                        <span>{report.downloaded_count} downloads</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleView(report.id)}
                        variant="outline"
                        size="sm"
                        className="flex-1"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                      <Button
                        onClick={() => handleDownload(report.id, report.title)}
                        variant="outline"
                        size="sm"
                        className="flex-1"
                      >
                        <Download className="h-4 w-4 mr-1" />
                        Download
                      </Button>
                      <Button
                        onClick={() => handleDelete(report.id)}
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <FileText className="h-16 w-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">
                No reports yet
              </h3>
              <p className="text-gray-500 mb-6">
                Generate AI interpretations to see your reports here
              </p>
              <Button onClick={() => router.push('/home')}>
                Go to Dashboard
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Pagination */}
        {reports.length > 0 && (totalReports > 20) && (
          <div className="mt-6 flex items-center justify-center gap-2">
            <Button
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
              variant="outline"
              size="sm"
            >
              Previous
            </Button>
            <span className="text-sm text-gray-600">
              Page {page}
            </span>
            <Button
              onClick={() => setPage(page + 1)}
              disabled={!hasMore}
              variant="outline"
              size="sm"
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
