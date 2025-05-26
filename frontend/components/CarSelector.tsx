import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '@/lib/auth-provider';
import { Car } from '@/types/car';
import { AvailabilityCheckResponse } from '@/types/reservation';
import { Loader2, Car as CarIcon, AlertCircle, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

interface CarSelectorProps {
  onCarSelect: (car: Car, pricing?: { daily_rate: number; total_days: number; total_amount: number }) => void;
  selectedCarId?: string;
  startDate?: string;
  endDate?: string;
  className?: string;
  reservationId?: string;
}

export default function CarSelector({
  onCarSelect,
  selectedCarId,
  startDate,
  endDate,
  className = '',
  reservationId
}: CarSelectorProps) {
  const { token } = useAuth();
  const [cars, setCars] = useState<Car[]>([]);
  const [filteredCars, setFilteredCars] = useState<Car[]>([]);
  const [selectedCar, setSelectedCar] = useState<Car | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [availability, setAvailability] = useState<Record<string, AvailabilityCheckResponse | null>>({});
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Animation variants
  const dropdownVariants = {
    hidden: { opacity: 0, y: -5 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.2 } }
  };

  // Fetch cars on component mount
  useEffect(() => {
    fetchCars();
  }, [token]);

  // Fetch selected car when selectedCarId changes
  useEffect(() => {
    if (selectedCarId && cars.length > 0) {
      const car = cars.find(c => c._id === selectedCarId);
      if (car) {
        setSelectedCar(car);
      }
    }
  }, [selectedCarId, cars]);

  // Filter cars when search term changes
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredCars(cars);
    } else {
      const filtered = cars.filter(car => 
        `${car.brand} ${car.model}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        car.license_plate?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        car.year.toString().includes(searchTerm)
      );
      setFilteredCars(filtered);
    }
  }, [searchTerm, cars]);

  // Check availability when dates change
  useEffect(() => {
    if (startDate && endDate && selectedCar) {
      checkAvailability(selectedCar._id);
    }
  }, [startDate, endDate, selectedCar]);

  const fetchCars = async () => {
    if (!token) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await axios.get('http://localhost:5000/api/cars', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      // Include all cars, not just available ones
      // This allows showing cars that might be temporarily unavailable
      // but should be selectable for future dates
      setCars(response.data.cars);
      setFilteredCars(response.data.cars);
    } catch (error: any) {
      console.error('Error fetching cars:', error);
      setError('Failed to load cars');
    } finally {
      setIsLoading(false);
    }
  };

  const checkAvailability = async (carId: string) => {
    if (!token || !startDate || !endDate) return;
    
    try {
      setIsCheckingAvailability(true);
      
      const payload = {
        car_id: carId,
        start_date: startDate,
        end_date: endDate
      };
      
      // Add reservation_id if editing an existing reservation
      if (reservationId) {
        Object.assign(payload, { reservation_id: reservationId });
      }
      
      const response = await axios.post<AvailabilityCheckResponse>(
        'http://localhost:5000/api/reservations/check-availability',
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      setAvailability(prev => ({
        ...prev,
        [carId]: response.data
      }));
      
      // If this is the selected car and it's available, update pricing
      if (selectedCar && selectedCar._id === carId && response.data.available && response.data.pricing) {
        onCarSelect(selectedCar, response.data.pricing);
      }
    } catch (error: any) {
      console.error('Error checking availability:', error);
    } finally {
      setIsCheckingAvailability(false);
    }
  };

  const handleCarSelect = async (car: Car) => {
    setSelectedCar(car);
    setIsDropdownOpen(false);
    
    // Check availability if dates are provided
    if (startDate && endDate) {
      // If we already have availability data, use it
      if (availability[car._id]) {
        if (availability[car._id]?.available && availability[car._id]?.pricing) {
          onCarSelect(car, availability[car._id]?.pricing);
        } else {
          onCarSelect(car);
        }
      } else {
        // Otherwise check availability
        await checkAvailability(car._id);
        // The onCarSelect will be called in the useEffect when availability is updated
      }
    } else {
      onCarSelect(car);
    }
  };

  const getAvailabilityStatusColor = (carId: string) => {
    if (!startDate || !endDate) return '';
    
    if (isCheckingAvailability && selectedCar?._id === carId) {
      return 'text-gold animate-pulse';
    }
    
    if (availability[carId]) {
      return availability[carId]?.available ? 'text-green-400' : 'text-red-400';
    }
    
    return '';
  };

  return (
    <div className={`relative ${className}`}>
      <label htmlFor="car-selector" className="block text-sm font-medium text-gray-300 mb-1">
        Select Car
      </label>
      
      {/* Selected car display or search input */}
      <div 
        className="flex items-center justify-between w-full px-3 py-2 bg-gray-900/50 text-white border border-gray-700 rounded-md cursor-pointer focus:ring-1 focus:ring-gold focus:border-gold"
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
      >
        {selectedCar ? (
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center">
              <CarIcon size={18} className="text-gold mr-2" />
              <div>
                <div className="font-medium">{selectedCar.brand} {selectedCar.model} ({selectedCar.year})</div>
                <div className="text-sm text-gray-400">
                  {selectedCar.license_plate} - <span className="text-gold">${selectedCar.price_per_day}/day</span>
                </div>
              </div>
            </div>
            
            {startDate && endDate && (
              <div className="flex items-center">
                {isCheckingAvailability ? (
                  <Loader2 size={18} className="animate-spin text-gold" />
                ) : availability[selectedCar._id]?.available ? (
                  <CheckCircle size={18} className="text-green-400" />
                ) : (
                  <AlertCircle size={18} className="text-red-400" />
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center w-full">
            <CarIcon size={18} className="text-gold mr-2" />
            <input
              type="text"
              placeholder="Search cars by brand, model, or license plate..."
              className="w-full outline-none bg-transparent text-white placeholder-gray-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onClick={(e) => {
                e.stopPropagation();
                setIsDropdownOpen(true);
              }}
            />
          </div>
        )}
      </div>
      
      {/* Dropdown */}
      {isDropdownOpen && (
        <motion.div 
          className="absolute z-10 w-full mt-1 bg-gray-800/90 border border-white/10 rounded-md shadow-lg max-h-60 overflow-y-auto backdrop-blur-sm"
          variants={dropdownVariants}
          initial="hidden"
          animate="visible"
        >
          {isLoading ? (
            <div className="flex items-center justify-center p-4">
              <Loader2 size={20} className="animate-spin text-gold mr-2" />
              <span className="text-gray-300">Loading cars...</span>
            </div>
          ) : error ? (
            <div className="p-4 text-red-400">{error}</div>
          ) : filteredCars.length === 0 ? (
            <div className="p-4 text-gray-400">No cars found</div>
          ) : (
            <ul className="divide-y divide-white/5">
              {filteredCars.map((car) => (
                <li 
                  key={car._id}
                  className="px-4 py-3 hover:bg-white/5 cursor-pointer transition-colors"
                  onClick={() => handleCarSelect(car)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-white">{car.brand} {car.model} ({car.year})</div>
                      <div className="text-sm text-gray-400 flex items-center gap-2">
                        <span>{car.license_plate}</span>
                        <span className="text-gold">${car.price_per_day}/day</span>
                      </div>
                      
                      <div className="text-xs mt-1">
                        <span className={`px-2 py-0.5 rounded-full ${
                          car.availability_status === 'available' ? 'bg-green-900/30 text-green-400 border border-green-500/30' :
                          car.availability_status === 'rented' ? 'bg-blue-900/30 text-blue-400 border border-blue-500/30' :
                          'bg-yellow-900/30 text-yellow-400 border border-yellow-500/30'
                        }`}>
                          {car.availability_status}
                        </span>
                      </div>
                    </div>
                    
                    {/* Show availability status if dates are provided */}
                    {startDate && endDate && (
                      <div className={`text-sm ${getAvailabilityStatusColor(car._id)}`}>
                        {isCheckingAvailability && selectedCar?._id === car._id ? (
                          <Loader2 size={16} className="animate-spin" />
                        ) : availability[car._id]?.available ? (
                          <CheckCircle size={16} />
                        ) : availability[car._id] ? (
                          <AlertCircle size={16} />
                        ) : null}
                      </div>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </motion.div>
      )}
    </div>
  );
} 