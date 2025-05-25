import { DashboardMetrics } from '@/types/analytics';
import { Car, Users, Calendar, DollarSign, TrendingUp } from 'lucide-react';

interface DashboardMetricsCardsProps {
  metrics: DashboardMetrics;
  isLoading: boolean;
}

export default function DashboardMetricsCards({ metrics, isLoading }: DashboardMetricsCardsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="bg-white p-6 rounded-lg shadow animate-pulse">
            <div className="h-10 w-10 rounded-full bg-gray-200 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded mb-2 w-1/2"></div>
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center">
          <div className="bg-blue-100 p-3 rounded-full">
            <Car className="h-6 w-6 text-blue-600" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-500">Total Cars</p>
            <p className="text-2xl font-semibold text-gray-900">{metrics.total_cars}</p>
          </div>
        </div>
        <div className="mt-4 text-sm text-gray-600">
          <span className="text-green-600 font-medium">{metrics.available_cars} available</span> for rental
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center">
          <div className="bg-green-100 p-3 rounded-full">
            <Users className="h-6 w-6 text-green-600" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-500">Total Clients</p>
            <p className="text-2xl font-semibold text-gray-900">{metrics.total_clients}</p>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center">
          <div className="bg-yellow-100 p-3 rounded-full">
            <Calendar className="h-6 w-6 text-yellow-600" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-500">Active Reservations</p>
            <p className="text-2xl font-semibold text-gray-900">{metrics.active_reservations}</p>
          </div>
        </div>
        <div className="mt-4 text-sm text-gray-600">
          <span className="text-yellow-600 font-medium">{metrics.pending_reservations} pending</span> reservations
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center">
          <div className="bg-purple-100 p-3 rounded-full">
            <DollarSign className="h-6 w-6 text-purple-600" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-500">Revenue</p>
            <p className="text-2xl font-semibold text-gray-900">${metrics.total_revenue.toFixed(2)}</p>
          </div>
        </div>
        <div className="mt-4 text-sm text-gray-600">
          For period: {new Date(metrics.period.start_date).toLocaleDateString()} - {new Date(metrics.period.end_date).toLocaleDateString()}
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center">
          <div className="bg-red-100 p-3 rounded-full">
            <TrendingUp className="h-6 w-6 text-red-600" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-500">Utilization Rate</p>
            <p className="text-2xl font-semibold text-gray-900">
              {metrics.total_cars > 0 
                ? Math.round((metrics.active_reservations / metrics.total_cars) * 100) 
                : 0}%
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 