import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '@/lib/auth-provider';
import { Car } from '@/types/car';
import { AvailabilityCheckResponse } from '@/types/reservation';
import { Loader2, Car as CarIcon, AlertCircle, CheckCircle } from 'lucide-react';

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
      
      // Filter out non-available cars unless they're the selected car
      const availableCars = response.data.cars.filter((car: Car) => 
        car.availability_status === 'available' || car._id === selectedCarId
      );
      
      setCars(availableCars);
      setFilteredCars(availableCars);
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

  return (
    <div className={`relative ${className}`}>
      <label htmlFor="car-selector" className="block text-sm font-medium text-gray-700 mb-1">
        Car
      </label>
      
      {/* Selected car display or search input */}
      <div 
        className="flex items-center justify-between w-full px-3 py-2 border border-gray-300 rounded-md cursor-pointer"
        onClick={() => setSelectedCar(null)}
      >
        {selectedCar ? (
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center">
              <CarIcon size={18} className="text-gray-500 mr-2" />
              <div>
                <div className="font-medium">{selectedCar.brand} {selectedCar.model} ({selectedCar.year})</div>
                <div className="text-sm text-gray-500">
                  {selectedCar.license_plate} - ${selectedCar.price_per_day}/day
                </div>
              </div>
            </div>
            
            {startDate && endDate && (
              <div className="flex items-center">
                {isCheckingAvailability ? (
                  <Loader2 size={18} className="animate-spin text-blue-500" />
                ) : availability[selectedCar._id]?.available ? (
                  <CheckCircle size={18} className="text-green-500" />
                ) : (
                  <AlertCircle size={18} className="text-red-500" />
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center w-full">
            <CarIcon size={18} className="text-gray-500 mr-2" />
            <input
              type="text"
              placeholder="Search cars..."
              className="w-full outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        )}
      </div>
      
      {/* Dropdown */}
      {!selectedCar && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center p-4">
              <Loader2 size={20} className="animate-spin text-blue-500 mr-2" />
              <span>Loading cars...</span>
            </div>
          ) : error ? (
            <div className="p-4 text-red-500">{error}</div>
          ) : filteredCars.length === 0 ? (
            <div className="p-4 text-gray-500">No cars found</div>
          ) : (
            <ul>
              {filteredCars.map((car) => (
                <li 
                  key={car._id}
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                  onClick={() => handleCarSelect(car)}
                >
                  <div className="font-medium">{car.brand} {car.model} ({car.year})</div>
                  <div className="text-sm text-gray-500 flex justify-between">
                    <span>{car.license_plate}</span>
                    <span>${car.price_per_day}/day</span>
                  </div>
                  
                  {/* Show availability status if dates are provided */}
                  {startDate && endDate && availability[car._id] && (
                    <div className={`text-sm mt-1 ${availability[car._id]?.available ? 'text-green-600' : 'text-red-600'}`}>
                      {availability[car._id]?.available ? 
                        'Available for selected dates' : 
                        'Not available for selected dates'}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
} 