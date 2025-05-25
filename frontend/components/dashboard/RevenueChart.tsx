import { useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  BarElement,
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import { FinancialReports } from '@/types/analytics';
import { Calendar, Loader2 } from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface RevenueChartProps {
  financialData: FinancialReports | null;
  isLoading: boolean;
}

export default function RevenueChart({ financialData, isLoading }: RevenueChartProps) {
  const [chartType, setChartType] = useState<'line' | 'bar'>('line');
  
  if (isLoading) {
    return (
      <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 p-6 rounded-lg border border-white/10 shadow-lg backdrop-blur-sm animate-pulse">
        <div className="h-6 bg-gray-700/50 rounded w-1/4 mb-6"></div>
        <div className="h-64 bg-gray-700/50 rounded w-full"></div>
      </div>
    );
  }

  if (!financialData) {
    return (
      <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 p-6 rounded-lg border border-white/10 shadow-lg backdrop-blur-sm">
        <h2 className="text-lg font-semibold mb-4 font-serif text-white">Revenue Trends</h2>
        <div className="flex items-center justify-center h-64 text-gray-400">
          No data available
        </div>
      </div>
    );
  }

  const labels = financialData.revenue_by_period.map(item => item.period);
  const data = financialData.revenue_by_period.map(item => item.revenue);

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Revenue',
        data,
        borderColor: '#D4AF37',
        backgroundColor: 'rgba(212, 175, 55, 0.3)',
        tension: 0.3,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: '#ffffff'
        }
      },
      title: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        titleColor: '#D4AF37',
        bodyColor: '#ffffff',
        borderColor: '#D4AF37',
        borderWidth: 1,
        padding: 10,
        displayColors: false,
        callbacks: {
          label: function(context: any) {
            return '$ ' + context.raw.toLocaleString();
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(255, 255, 255, 0.1)'
        },
        ticks: {
          color: '#ffffff',
          callback: function(value: any) {
            return '$' + value;
          }
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
    }
  };

  return (
    <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 p-6 rounded-lg border border-white/10 shadow-lg backdrop-blur-sm">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold font-serif text-white">Revenue Trends</h2>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-300 flex items-center">
            <Calendar size={16} className="mr-1 text-gold" />
            {financialData.period_type}
          </span>
          <div className="flex border border-gray-700 rounded-md overflow-hidden">
            <button
              className={`px-3 py-1 text-sm transition-colors ${
                chartType === 'line'
                  ? 'bg-gold text-black'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
              onClick={() => setChartType('line')}
            >
              Line
            </button>
            <button
              className={`px-3 py-1 text-sm transition-colors ${
                chartType === 'bar'
                  ? 'bg-gold text-black'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
              onClick={() => setChartType('bar')}
            >
              Bar
            </button>
          </div>
        </div>
      </div>
      <div className="h-64">
        {chartType === 'line' ? (
          <Line data={chartData} options={options} />
        ) : (
          <Bar data={chartData} options={options} />
        )}
      </div>
    </div>
  );
} 