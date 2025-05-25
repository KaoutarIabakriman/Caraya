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
import { BarChart3, PieChart } from 'lucide-react';

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
      <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 p-6 rounded-lg border border-white/10 shadow-lg backdrop-blur-sm animate-pulse">
        <div className="h-6 bg-gray-700/50 rounded w-1/4 mb-6"></div>
        <div className="h-64 bg-gray-700/50 rounded w-full"></div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 p-6 rounded-lg border border-white/10 shadow-lg backdrop-blur-sm">
        <h2 className="text-lg font-semibold mb-4 font-serif text-white">Reservation Statistics</h2>
        <div className="flex items-center justify-center h-64 text-gray-400">
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
        backgroundColor: 'rgba(212, 175, 55, 0.5)',
        borderColor: '#D4AF37',
        borderWidth: 1,
      },
    ],
  };

  // Status distribution chart data
  const statusLabels = Object.keys(data.status_distribution);
  const statusData = Object.values(data.status_distribution);
  
  const statusColors = [
    'rgba(255, 206, 86, 0.8)',  // pending - yellow
    'rgba(54, 162, 235, 0.8)',  // confirmed - blue
    'rgba(75, 192, 192, 0.8)',  // active - green
    'rgba(153, 102, 255, 0.8)', // completed - purple
    'rgba(255, 99, 132, 0.8)',  // cancelled - red
  ];

  const statusChartData = {
    labels: statusLabels.map(status => status.charAt(0).toUpperCase() + status.slice(1)),
    datasets: [
      {
        data: statusData,
        backgroundColor: statusColors,
        borderColor: statusColors.map(color => color.replace('0.8', '1')),
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
        labels: {
          color: '#ffffff'
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        titleColor: '#D4AF37',
        bodyColor: '#ffffff',
        borderColor: '#D4AF37',
        borderWidth: 1,
        padding: 10
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(255, 255, 255, 0.1)'
        },
        ticks: {
          color: '#ffffff'
        }
      },
      x: {
        grid: {
          color: 'rgba(255, 255, 255, 0.1)'
        },
        ticks: {
          color: '#ffffff'
        }
      }
    },
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right' as const,
        labels: {
          color: '#ffffff',
          padding: 20
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        titleColor: '#D4AF37',
        bodyColor: '#ffffff',
        borderColor: '#D4AF37',
        borderWidth: 1,
        padding: 10
      }
    },
  };

  return (
    <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 p-6 rounded-lg border border-white/10 shadow-lg backdrop-blur-sm">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold font-serif text-white">Reservation Statistics</h2>
        <div className="flex border border-gray-700 rounded-md overflow-hidden">
          <button
            className={`px-3 py-1 text-sm transition-colors flex items-center ${
              view === 'monthly'
                ? 'bg-gold text-black'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
            onClick={() => setView('monthly')}
          >
            <BarChart3 size={14} className="mr-1" /> Monthly
          </button>
          <button
            className={`px-3 py-1 text-sm transition-colors flex items-center ${
              view === 'status'
                ? 'bg-gold text-black'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
            onClick={() => setView('status')}
          >
            <PieChart size={14} className="mr-1" /> By Status
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