/**
 * ChandraHoro V2.1 - Usage Chart Component
 * 
 * Interactive Chart.js visualization for admin dashboard usage trends.
 * Displays readings, chat messages, compatibility reports, and active users
 * over time with beautiful styling and responsive design.
 * 
 * Features:
 * - Multi-dataset line chart
 * - Responsive design
 * - Interactive tooltips
 * - Color-coded metrics
 * - Date formatting
 */

'use client';

import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { format, parseISO } from 'date-fns';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface UsageTrendData {
  date: string;
  readings_count: number;
  chat_messages_count: number;
  compatibility_reports_count: number;
  active_users_count: number;
}

interface UsageChartProps {
  data: UsageTrendData[];
}

export function UsageChart({ data }: UsageChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        <p>No usage data available</p>
      </div>
    );
  }
  
  // Prepare chart data
  const labels = data.map(item => format(parseISO(item.date), 'MMM d'));
  
  const chartData = {
    labels,
    datasets: [
      {
        label: 'Daily Readings',
        data: data.map(item => item.readings_count),
        borderColor: 'rgb(249, 115, 22)', // orange-500
        backgroundColor: 'rgba(249, 115, 22, 0.1)',
        fill: false,
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointBackgroundColor: 'rgb(249, 115, 22)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
      },
      {
        label: 'Chat Messages',
        data: data.map(item => item.chat_messages_count),
        borderColor: 'rgb(147, 51, 234)', // purple-500
        backgroundColor: 'rgba(147, 51, 234, 0.1)',
        fill: false,
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointBackgroundColor: 'rgb(147, 51, 234)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
      },
      {
        label: 'Compatibility Reports',
        data: data.map(item => item.compatibility_reports_count),
        borderColor: 'rgb(239, 68, 68)', // red-500
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        fill: false,
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointBackgroundColor: 'rgb(239, 68, 68)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
      },
      {
        label: 'Active Users',
        data: data.map(item => item.active_users_count),
        borderColor: 'rgb(59, 130, 246)', // blue-500
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: false,
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointBackgroundColor: 'rgb(59, 130, 246)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
      },
    ],
  };
  
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    plugins: {
      title: {
        display: false,
      },
      legend: {
        position: 'top' as const,
        labels: {
          usePointStyle: true,
          pointStyle: 'circle',
          padding: 20,
          font: {
            size: 12,
            weight: '500',
          },
        },
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: true,
        callbacks: {
          title: function(context: any) {
            const dataIndex = context[0].dataIndex;
            const date = data[dataIndex].date;
            return format(parseISO(date), 'EEEE, MMMM d, yyyy');
          },
          label: function(context: any) {
            const label = context.dataset.label || '';
            const value = context.parsed.y;
            return `${label}: ${value.toLocaleString()}`;
          },
        },
      },
    },
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: 'Date',
          font: {
            size: 12,
            weight: '500',
          },
        },
        grid: {
          display: false,
        },
        ticks: {
          font: {
            size: 11,
          },
        },
      },
      y: {
        display: true,
        title: {
          display: true,
          text: 'Count',
          font: {
            size: 12,
            weight: '500',
          },
        },
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
          drawBorder: false,
        },
        ticks: {
          font: {
            size: 11,
          },
          callback: function(value: any) {
            return value.toLocaleString();
          },
        },
      },
    },
    elements: {
      line: {
        borderWidth: 2,
      },
      point: {
        hoverBorderWidth: 3,
      },
    },
  };
  
  return (
    <div className="w-full h-80">
      <Line data={chartData} options={options} />
    </div>
  );
}

// Summary stats component to show alongside the chart
export function UsageStats({ data }: UsageChartProps) {
  if (!data || data.length === 0) {
    return null;
  }
  
  const totals = data.reduce(
    (acc, item) => ({
      readings: acc.readings + item.readings_count,
      messages: acc.messages + item.chat_messages_count,
      reports: acc.reports + item.compatibility_reports_count,
      users: Math.max(acc.users, item.active_users_count), // Peak users
    }),
    { readings: 0, messages: 0, reports: 0, users: 0 }
  );
  
  const averages = {
    readings: totals.readings / data.length,
    messages: totals.messages / data.length,
    reports: totals.reports / data.length,
  };
  
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
      <div className="text-center p-3 bg-orange-50 dark:bg-orange-950 rounded-lg">
        <p className="text-2xl font-bold text-orange-600">{totals.readings}</p>
        <p className="text-sm text-gray-600 dark:text-gray-400">Total Readings</p>
        <p className="text-xs text-gray-500">{averages.readings.toFixed(1)}/day avg</p>
      </div>
      
      <div className="text-center p-3 bg-purple-50 dark:bg-purple-950 rounded-lg">
        <p className="text-2xl font-bold text-purple-600">{totals.messages}</p>
        <p className="text-sm text-gray-600 dark:text-gray-400">Total Messages</p>
        <p className="text-xs text-gray-500">{averages.messages.toFixed(1)}/day avg</p>
      </div>
      
      <div className="text-center p-3 bg-red-50 dark:bg-red-950 rounded-lg">
        <p className="text-2xl font-bold text-red-600">{totals.reports}</p>
        <p className="text-sm text-gray-600 dark:text-gray-400">Total Reports</p>
        <p className="text-xs text-gray-500">{averages.reports.toFixed(1)}/day avg</p>
      </div>
      
      <div className="text-center p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
        <p className="text-2xl font-bold text-blue-600">{totals.users}</p>
        <p className="text-sm text-gray-600 dark:text-gray-400">Peak Users</p>
        <p className="text-xs text-gray-500">Daily maximum</p>
      </div>
    </div>
  );
}
