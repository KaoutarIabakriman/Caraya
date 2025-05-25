import { useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import { ReservationAnalytics } from '@/types/analytics';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

interface ReservationStatsChartProps {
  data: ReservationAnalytics | null;
  isLoading: boolean;
}

export default function ReservationStatsChart({ data, isLoading }: ReservationStatsChartProps) {
  const [view, setView] = useState<'monthly' | 'status'>('monthly');
  
  if (isLoading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/4 mb-6"></div>
        <div className="h-64 bg-gray-200 rounded w-full"></div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4">Reservation Statistics</h2>
        <div className="flex items-center justify-center h-64 text-gray-500">
          No data available
        </div>
      </div>
    );
  }

  // Monthly bookings chart data
  const monthlyChartData = {
    labels: data.bookings_by_month.map(item => item.month),
    datasets: [
      {
        label: 'Reservations',
        data: data.bookings_by_month.map(item => item.count),
        backgroundColor: 'rgba(54, 162, 235, 0.5)',
        borderColor: 'rgb(54, 162, 235)',
        borderWidth: 1,
      },
    ],
  };

  // Status distribution chart data
  const statusLabels = Object.keys(data.status_distribution);
  const statusData = Object.values(data.status_distribution);
  
  const statusColors = [
    'rgba(255, 206, 86, 0.7)',  // pending - yellow
    'rgba(54, 162, 235, 0.7)',  // confirmed - blue
    'rgba(75, 192, 192, 0.7)',  // active - green
    'rgba(153, 102, 255, 0.7)', // completed - purple
    'rgba(255, 99, 132, 0.7)',  // cancelled - red
  ];

  const statusChartData = {
    labels: statusLabels.map(status => status.charAt(0).toUpperCase() + status.slice(1)),
    datasets: [
      {
        data: statusData,
        backgroundColor: statusColors,
        borderColor: statusColors.map(color => color.replace('0.7', '1')),
        borderWidth: 1,
      },
    ],
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right' as const,
      },
    },
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Reservation Statistics</h2>
        <div className="flex border rounded-md overflow-hidden">
          <button
            className={`px-3 py-1 text-sm ${
              view === 'monthly'
                ? 'bg-blue-500 text-white'
                : 'bg-white text-gray-700'
            }`}
            onClick={() => setView('monthly')}
          >
            Monthly
          </button>
          <button
            className={`px-3 py-1 text-sm ${
              view === 'status'
                ? 'bg-blue-500 text-white'
                : 'bg-white text-gray-700'
            }`}
            onClick={() => setView('status')}
          >
            By Status
          </button>
        </div>
      </div>
      <div className="h-64">
        {view === 'monthly' ? (
          <Bar data={monthlyChartData} options={barOptions} />
        ) : (
          <Doughnut data={statusChartData} options={doughnutOptions} />
        )}
      </div>
    </div>
  );
} 