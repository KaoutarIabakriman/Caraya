import { DashboardMetrics } from '@/types/analytics';
import { Car, Users, Calendar, DollarSign, TrendingUp, Loader2 } from 'lucide-react';

interface DashboardMetricsCardsProps {
  metrics: DashboardMetrics;
  isLoading: boolean;
}

export default function DashboardMetricsCards({ metrics, isLoading }: DashboardMetricsCardsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 p-6 rounded-lg border border-white/10 shadow-lg backdrop-blur-sm animate-pulse">
            <div className="h-10 w-10 rounded-full bg-gray-700/50 mb-4"></div>
            <div className="h-4 bg-gray-700/50 rounded mb-2 w-1/2"></div>
            <div className="h-8 bg-gray-700/50 rounded w-1/3"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 p-6 rounded-lg border border-white/10 shadow-lg backdrop-blur-sm">
        <div className="flex items-center">
          <div className="bg-blue-900/30 p-3 rounded-full border border-blue-500/30">
            <Car className="h-6 w-6 text-blue-400" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-400">Total Cars</p>
            <p className="text-2xl font-semibold text-white">{metrics.total_cars}</p>
          </div>
        </div>
        <div className="mt-4 text-sm text-gray-400">
          <span className="text-green-400 font-medium">{metrics.available_cars} available</span> for rental
        </div>
      </div>

      <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 p-6 rounded-lg border border-white/10 shadow-lg backdrop-blur-sm">
        <div className="flex items-center">
          <div className="bg-purple-900/30 p-3 rounded-full border border-purple-500/30">
            <Users className="h-6 w-6 text-purple-400" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-400">Total Clients</p>
            <p className="text-2xl font-semibold text-white">{metrics.total_clients}</p>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 p-6 rounded-lg border border-white/10 shadow-lg backdrop-blur-sm">
        <div className="flex items-center">
          <div className="bg-green-900/30 p-3 rounded-full border border-green-500/30">
            <Calendar className="h-6 w-6 text-green-400" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-400">Active Reservations</p>
            <p className="text-2xl font-semibold text-white">{metrics.active_reservations}</p>
          </div>
        </div>
        <div className="mt-4 text-sm text-gray-400">
          <span className="text-yellow-400 font-medium">{metrics.pending_reservations} pending</span> reservations
        </div>
      </div>

      <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 p-6 rounded-lg border border-white/10 shadow-lg backdrop-blur-sm">
        <div className="flex items-center">
          <div className="bg-gold/20 p-3 rounded-full border border-gold/30">
            <DollarSign className="h-6 w-6 text-gold" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-400">Revenue</p>
            <p className="text-2xl font-semibold text-white">${metrics.total_revenue.toFixed(2)}</p>
          </div>
        </div>
        <div className="mt-4 text-sm text-gray-400">
          For period: {new Date(metrics.period.start_date).toLocaleDateString()} - {new Date(metrics.period.end_date).toLocaleDateString()}
        </div>
      </div>

      <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 p-6 rounded-lg border border-white/10 shadow-lg backdrop-blur-sm">
        <div className="flex items-center">
          <div className="bg-red-900/30 p-3 rounded-full border border-red-500/30">
            <TrendingUp className="h-6 w-6 text-red-400" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-400">Utilization Rate</p>
            <p className="text-2xl font-semibold text-white">
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