import { useState } from 'react';
import { CarUtilization } from '@/types/analytics';
import { Car, TrendingUp, ChevronDown } from 'lucide-react';

interface CarUtilizationChartProps {
  data: CarUtilization | null;
  isLoading: boolean;
}

export default function CarUtilizationChart({ data, isLoading }: CarUtilizationChartProps) {
  const [displayCount, setDisplayCount] = useState(5);
  
  if (isLoading) {
    return (
      <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 p-6 rounded-lg border border-white/10 shadow-lg backdrop-blur-sm animate-pulse">
        <div className="h-6 bg-gray-700/50 rounded w-1/4 mb-6"></div>
        <div className="h-64 bg-gray-700/50 rounded w-full"></div>
      </div>
    );
  }

  if (!data || data.car_utilization.length === 0) {
    return (
      <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 p-6 rounded-lg border border-white/10 shadow-lg backdrop-blur-sm">
        <h2 className="text-lg font-semibold mb-4 font-serif text-white">Car Utilization</h2>
        <div className="flex items-center justify-center h-64 text-gray-400">
          No data available
        </div>
      </div>
    );
  }

  // Sort cars by utilization percentage (already sorted from API, but just to be safe)
  const sortedCars = [...data.car_utilization].sort((a, b) => b.utilization_percentage - a.utilization_percentage);
  
  // Take only the number of cars we want to display
  const displayedCars = sortedCars.slice(0, displayCount);

  return (
    <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 p-6 rounded-lg border border-white/10 shadow-lg backdrop-blur-sm">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold font-serif text-white">Car Utilization</h2>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-300">
            Fleet avg: 
            <span className="font-semibold ml-1 text-gold">
              {data.fleet_statistics.fleet_utilization_percentage}%
            </span>
          </span>
          <select 
            value={displayCount}
            onChange={(e) => setDisplayCount(Number(e.target.value))}
            className="text-sm bg-gray-800 border border-gray-700 rounded p-1 text-white focus:outline-none focus:ring-1 focus:ring-gold"
          >
            <option value={5}>Top 5</option>
            <option value={10}>Top 10</option>
            <option value={15}>Top 15</option>
            <option value={20}>Top 20</option>
          </select>
        </div>
      </div>

      <div className="space-y-4">
        {displayedCars.map((car) => (
          <div key={car.car_id} className="border border-white/10 bg-gray-800/50 rounded-lg p-4 hover:border-gold/30 transition-colors">
            <div className="flex items-start justify-between">
              <div className="flex items-center">
                <div className="bg-blue-900/30 p-2 rounded-full mr-3 border border-blue-500/30">
                  <Car className="h-5 w-5 text-blue-400" />
                </div>
                <div>
                  <h3 className="font-medium text-white">
                    {car.brand} {car.model} ({car.year})
                  </h3>
                  <p className="text-sm text-gray-400">{car.license_plate}</p>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center">
                  <TrendingUp className="h-4 w-4 text-green-400 mr-1" />
                  <span className="font-semibold text-white">{car.utilization_percentage}%</span>
                </div>
                <p className="text-sm text-gray-400"><span className="text-gold">${car.revenue.toFixed(2)}</span> revenue</p>
              </div>
            </div>
            
            {/* Progress bar */}
            <div className="mt-3">
              <div className="w-full bg-gray-700 rounded-full h-2.5">
                <div 
                  className="bg-gold h-2.5 rounded-full" 
                  style={{ width: `${car.utilization_percentage}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>{car.days_rented} days rented</span>
                <span className={`${
                  car.current_status === 'available' ? 'text-green-400' : 
                  car.current_status === 'rented' ? 'text-blue-400' : 'text-yellow-400'
                }`}>
                  {car.current_status}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {displayCount < data.car_utilization.length && (
        <button
          onClick={() => setDisplayCount(prev => Math.min(prev + 5, data.car_utilization.length))}
          className="w-full mt-4 text-center py-2 text-sm text-gold hover:text-white flex items-center justify-center transition-colors"
        >
          Show more cars <ChevronDown size={16} className="ml-1" />
        </button>
      )}
    </div>
  );
} 