import { useRouter } from 'next/navigation';
import { UpcomingEvents } from '@/types/analytics';
import { Calendar, Clock, MapPin, AlertTriangle, ArrowRight } from 'lucide-react';

interface UpcomingReservationsProps {
  data: UpcomingEvents | null;
  isLoading: boolean;
}

export default function UpcomingReservations({ data, isLoading }: UpcomingReservationsProps) {
  const router = useRouter();
  
  if (isLoading) {
    return (
      <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 p-6 rounded-lg border border-white/10 shadow-lg backdrop-blur-sm animate-pulse">
        <div className="h-6 bg-gray-700/50 rounded w-1/4 mb-6"></div>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-20 bg-gray-700/50 rounded w-full"></div>
          ))}
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 p-6 rounded-lg border border-white/10 shadow-lg backdrop-blur-sm">
        <h2 className="text-lg font-semibold mb-4 font-serif text-white">Upcoming Events</h2>
        <div className="flex items-center justify-center h-32 text-gray-400">
          No data available
        </div>
      </div>
    );
  }

  const handleItemClick = (reservationId: string) => {
    router.push(`/dashboard/reservations/${reservationId}`);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get total count of all events
  const totalCount = 
    data.upcoming_pickups.length + 
    data.upcoming_returns.length +
    data.overdue_returns.length;

  return (
    <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 p-6 rounded-lg border border-white/10 shadow-lg backdrop-blur-sm">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold font-serif text-white">Upcoming Events</h2>
        <span className="text-sm text-gray-300">
          Next {data.upcoming_pickups.length + data.upcoming_returns.length} events
        </span>
      </div>

      {totalCount === 0 ? (
        <div className="flex items-center justify-center h-32 text-gray-400">
          No upcoming events
        </div>
      ) : (
        <div className="space-y-1">
          {/* Overdue section */}
          {data.overdue_returns.length > 0 && (
            <div className="mb-3">
              <div className="flex items-center text-red-400 mb-2">
                <AlertTriangle size={16} className="mr-1" />
                <h3 className="text-sm font-semibold">Overdue Returns</h3>
              </div>
              <div className="space-y-2">
                {data.overdue_returns.slice(0, 3).map((item) => (
                  <div 
                    key={item.reservation_id}
                    onClick={() => handleItemClick(item.reservation_id)}
                    className="border border-red-900/30 bg-red-900/20 rounded-md p-3 cursor-pointer hover:bg-red-900/30 transition-colors"
                  >
                    <div className="flex justify-between">
                      <div>
                        <p className="font-medium text-white">{item.client_name}</p>
                        <p className="text-sm text-gray-400">{item.car_info}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-red-400 font-medium">{item.days_overdue} days overdue</p>
                        <p className="text-xs text-gray-400 flex items-center justify-end">
                          <Clock size={12} className="mr-1" />
                          {formatDate(item.end_date)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Upcoming returns */}
          {data.upcoming_returns.length > 0 && (
            <div className="mb-3">
              <div className="flex items-center text-blue-400 mb-2">
                <Calendar size={16} className="mr-1" />
                <h3 className="text-sm font-semibold">Upcoming Returns</h3>
              </div>
              <div className="space-y-2">
                {data.upcoming_returns.slice(0, 3).map((item) => (
                  <div 
                    key={item.reservation_id}
                    onClick={() => handleItemClick(item.reservation_id)}
                    className="border border-gray-700 bg-gray-800/50 rounded-md p-3 cursor-pointer hover:border-blue-500/30 hover:bg-blue-900/20 transition-colors"
                  >
                    <div className="flex justify-between">
                      <div>
                        <p className="font-medium text-white">{item.client_name}</p>
                        <p className="text-sm text-gray-400">{item.car_info}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-400 flex items-center justify-end">
                          <Clock size={12} className="mr-1 text-blue-400" />
                          {formatDate(item.end_date)}
                        </p>
                        <p className="text-xs text-gray-400 flex items-center justify-end">
                          <MapPin size={12} className="mr-1 text-blue-400" />
                          {item.return_location}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Upcoming pickups */}
          {data.upcoming_pickups.length > 0 && (
            <div>
              <div className="flex items-center text-green-400 mb-2">
                <Calendar size={16} className="mr-1" />
                <h3 className="text-sm font-semibold">Upcoming Pickups</h3>
              </div>
              <div className="space-y-2">
                {data.upcoming_pickups.slice(0, 3).map((item) => (
                  <div 
                    key={item.reservation_id}
                    onClick={() => handleItemClick(item.reservation_id)}
                    className="border border-gray-700 bg-gray-800/50 rounded-md p-3 cursor-pointer hover:border-green-500/30 hover:bg-green-900/20 transition-colors"
                  >
                    <div className="flex justify-between">
                      <div>
                        <p className="font-medium text-white">{item.client_name}</p>
                        <p className="text-sm text-gray-400">{item.car_info}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-400 flex items-center justify-end">
                          <Clock size={12} className="mr-1 text-green-400" />
                          {formatDate(item.start_date)}
                        </p>
                        <p className="text-xs text-gray-400 flex items-center justify-end">
                          <MapPin size={12} className="mr-1 text-green-400" />
                          {item.pickup_location}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
      
      {totalCount > 9 && (
        <div className="mt-4 text-center">
          <button
            onClick={() => router.push('/dashboard/reports/upcoming')}
            className="text-sm text-gold hover:text-white flex items-center justify-center mx-auto transition-colors"
          >
            View all upcoming events <ArrowRight size={14} className="ml-1" />
          </button>
        </div>
      )}
    </div>
  );
} 