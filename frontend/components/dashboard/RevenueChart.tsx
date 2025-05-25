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
import { Calendar } from 'lucide-react';

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
      <div className="bg-white p-6 rounded-lg shadow animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/4 mb-6"></div>
        <div className="h-64 bg-gray-200 rounded w-full"></div>
      </div>
    );
  }

  if (!financialData) {
    return (
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4">Revenue Trends</h2>
        <div className="flex items-center justify-center h-64 text-gray-500">
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
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
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
      },
      title: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value: any) {
            return '$' + value;
          }
        }
      }
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Revenue Trends</h2>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500 flex items-center">
            <Calendar size={16} className="mr-1" />
            {financialData.period_type}
          </span>
          <div className="flex border rounded-md overflow-hidden">
            <button
              className={`px-3 py-1 text-sm ${
                chartType === 'line'
                  ? 'bg-blue-500 text-white'
                  : 'bg-white text-gray-700'
              }`}
              onClick={() => setChartType('line')}
            >
              Line
            </button>
            <button
              className={`px-3 py-1 text-sm ${
                chartType === 'bar'
                  ? 'bg-blue-500 text-white'
                  : 'bg-white text-gray-700'
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