'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Search, Calendar, MapPin, Car, Fuel, Gauge, Users, Sliders, X, ChevronDown } from 'lucide-react';
import axios from 'axios';
import Link from 'next/link';

type SearchData = {
  brand: string;
  model: string;
  minPrice: number;
  maxPrice: number;
  fuelType: string;
  transmission: string;
  seats: number;
  pickupDate: string;
  dropoffDate: string;
};

type Car = {
  _id: string;
  brand: string;
  model: string;
  year: number;
  price_per_day: number;
  fuel_type: string;
  transmission: string;
  seats: number;
  features: string[];
  images: string[];
  availability_status: string;
  description: string;
  mileage?: number;
  color?: string;
};

export default function Hero() {
  // Search form state
  const [searchData, setSearchData] = useState<SearchData>({
    brand: '',
    model: '',
    minPrice: 0,
    maxPrice: 1000,
    fuelType: '',
    transmission: '',
    seats: 0,
    pickupDate: '',
    dropoffDate: ''
  });

  // Advanced filters state
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  
  // Search results state
  const [searchResults, setSearchResults] = useState<Car[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Filter options from database
  const [brands, setBrands] = useState<string[]>([]);
  const [models, setModels] = useState<string[]>([]);
  const [fuelTypes, setFuelTypes] = useState<string[]>([]);
  const [transmissionTypes, setTransmissionTypes] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState({ min: 0, max: 1000 });

  // Fetch filter options on component mount
  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/cars');
        const cars = response.data.cars;
        
        // Extract unique brands
        const uniqueBrands = Array.from(new Set(cars.map((car: Car) => car.brand))).filter(Boolean) as string[];
        setBrands(uniqueBrands.sort());
        
        // Extract unique models
        const uniqueModels = Array.from(new Set(cars.map((car: Car) => car.model))).filter(Boolean) as string[];
        setModels(uniqueModels.sort());
        
        // Extract unique fuel types
        const uniqueFuelTypes = Array.from(new Set(cars.map((car: Car) => car.fuel_type))).filter(Boolean) as string[];
        setFuelTypes(uniqueFuelTypes.sort());
        
        // Extract unique transmission types
        const uniqueTransmissions = Array.from(new Set(cars.map((car: Car) => car.transmission))).filter(Boolean) as string[];
        setTransmissionTypes(uniqueTransmissions.sort());
        
        // Calculate price range
        const prices = cars.map((car: Car) => car.price_per_day).filter(Boolean);
        if (prices.length > 0) {
          const min = Math.floor(Math.min(...prices));
          const max = Math.ceil(Math.max(...prices));
          setPriceRange({ min, max });
          setSearchData(prev => ({ ...prev, minPrice: min, maxPrice: max }));
        }
      } catch (error) {
        console.error('Error fetching filter options:', error);
      }
    };
    
    fetchFilterOptions();
  }, []);

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setSearchData(prev => ({ ...prev, [name]: value }));
    
    // If brand changes, filter models
    if (name === 'brand' && value) {
      filterModelsByBrand(value);
    }
  };

  // Filter models based on selected brand
  const filterModelsByBrand = async (brand: string) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/cars?brand=${brand}`);
      const cars = response.data.cars;
      const brandModels = Array.from(new Set(cars.map((car: Car) => car.model))).filter(Boolean) as string[];
      setModels(brandModels.sort());
    } catch (error) {
      console.error('Error filtering models by brand:', error);
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Build query parameters
      const params = new URLSearchParams();
      
      if (searchData.brand) params.append('brand', searchData.brand);
      if (searchData.model) params.append('model', searchData.model);
      if (searchData.minPrice > priceRange.min) params.append('min_price', searchData.minPrice.toString());
      if (searchData.maxPrice < priceRange.max) params.append('max_price', searchData.maxPrice.toString());
      if (searchData.fuelType) params.append('fuel_type', searchData.fuelType);
      if (searchData.transmission) params.append('transmission', searchData.transmission);
      if (searchData.seats > 0) params.append('seats', searchData.seats.toString());
      
      // Only add availability=available if dates are specified
      if (searchData.pickupDate && searchData.dropoffDate) {
        params.append('availability', 'available');
      }
      
      const response = await axios.get(`http://localhost:5000/api/cars?${params.toString()}`);
      setSearchResults(response.data.cars);
      setShowResults(true);
      
      // Scroll to results if they're not visible
      setTimeout(() => {
        const resultsElement = document.getElementById('search-results');
        if (resultsElement) {
          resultsElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      }, 100);
      
    } catch (error) {
      console.error('Error searching cars:', error);
    } finally {
      setLoading(false);
    }
  };

  // Format price with currency
  const formatPrice = (price: number) => {
    return `$${price.toFixed(2)}`;
  };

  // Get image URL
  const getImageUrl = (imagePath: string) => {
    if (!imagePath) return '/images/car-placeholder.jpg';
    if (imagePath.startsWith('http')) return imagePath;
    return `http://localhost:5000/uploads/${imagePath}`;
  };

  // Reset search form
  const resetSearch = () => {
    setSearchData({
      brand: '',
      model: '',
      minPrice: priceRange.min,
      maxPrice: priceRange.max,
      fuelType: '',
      transmission: '',
      seats: 0,
      pickupDate: '',
      dropoffDate: ''
    });
    setShowResults(false);
    setShowAdvancedFilters(false);
  };

  // Close search results
  const closeResults = () => {
    setShowResults(false);
  };

  return (
    <section className={`relative ${showResults ? 'min-h-screen' : 'h-screen'} overflow-visible transition-all duration-500`}>
      {/* Background elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-gray-900/90 to-black/80 z-10"></div>
        <Image 
          src="/images/hero-bg.jpg" 
          alt="Luxury car" 
          fill 
          priority
          className="object-cover"
        />
      </div>

      {/* Decorative elements */}
      <div className="absolute top-1/4 -left-64 w-[500px] h-[500px] rounded-full bg-blue-600/20 blur-[120px]"></div>
      <div className="absolute bottom-1/4 -right-64 w-[500px] h-[500px] rounded-full bg-gold/10 blur-[100px]"></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full border border-white/5"></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full border border-white/5"></div>
      
      {/* Content */}
      <div className="relative z-20 container mx-auto px-4 flex flex-col justify-center py-32">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto text-center mb-12"
        >
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 font-serif">
            Experience <span className="text-gold">Luxury</span> on Every Road
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto">
            Discover our exclusive collection of premium vehicles for an unforgettable journey
          </p>
        </motion.div>

        {/* Search form */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="w-full max-w-5xl mx-auto bg-gradient-to-r from-gray-900/90 to-gray-800/90 backdrop-blur-md rounded-xl p-6 border border-white/10 shadow-xl shadow-black/20"
        >
          <form onSubmit={handleSubmit}>
            {/* Basic search */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Brand</label>
                <div className="relative">
                  <Car className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gold h-4 w-4" />
                  <select 
                    name="brand"
                    value={searchData.brand}
                    onChange={handleChange}
                    className="w-full bg-white/5 border border-white/10 rounded-md py-3 pl-10 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-gold/50 transition-all duration-300"
                  >
                    <option value="">All Brands</option>
                    {brands.map(brand => (
                      <option key={brand} value={brand}>{brand}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Model</label>
                <div className="relative">
                  <Car className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gold h-4 w-4" />
                  <select 
                    name="model"
                    value={searchData.model}
                    onChange={handleChange}
                    className="w-full bg-white/5 border border-white/10 rounded-md py-3 pl-10 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-gold/50 transition-all duration-300"
                    disabled={!searchData.brand && models.length > 20}
                  >
                    <option value="">All Models</option>
                    {models.map(model => (
                      <option key={model} value={model}>{model}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Pickup Date (Optional)</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gold h-4 w-4" />
                  <input 
                    type="date" 
                    name="pickupDate"
                    value={searchData.pickupDate}
                    onChange={handleChange}
                    className="w-full bg-white/5 border border-white/10 rounded-md py-3 pl-10 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-gold/50 transition-all duration-300"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Dropoff Date (Optional)</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gold h-4 w-4" />
                  <input 
                    type="date" 
                    name="dropoffDate"
                    value={searchData.dropoffDate}
                    onChange={handleChange}
                    className="w-full bg-white/5 border border-white/10 rounded-md py-3 pl-10 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-gold/50 transition-all duration-300"
                  />
                </div>
              </div>
            </div>
            
            {/* Advanced filters toggle */}
            <div className="flex justify-between items-center mb-4">
              <button
                type="button"
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                className="flex items-center text-sm text-gray-300 hover:text-gold transition-colors"
              >
                <Sliders className="h-4 w-4 mr-1" />
                {showAdvancedFilters ? 'Hide' : 'Show'} Advanced Filters
                <ChevronDown className={`h-4 w-4 ml-1 transition-transform ${showAdvancedFilters ? 'rotate-180' : ''}`} />
              </button>
              
              {(searchData.brand || searchData.model || searchData.fuelType || searchData.transmission || searchData.seats > 0 || searchData.minPrice > priceRange.min || searchData.maxPrice < priceRange.max) && (
                <button
                  type="button"
                  onClick={resetSearch}
                  className="text-sm text-gray-300 hover:text-gold transition-colors"
                >
                  Reset Filters
                </button>
              )}
            </div>
            
            {/* Advanced filters */}
            {showAdvancedFilters && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Fuel Type</label>
                  <div className="relative">
                    <Fuel className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gold h-4 w-4" />
                    <select 
                      name="fuelType"
                      value={searchData.fuelType}
                      onChange={handleChange}
                      className="w-full bg-white/5 border border-white/10 rounded-md py-3 pl-10 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-gold/50 transition-all duration-300"
                    >
                      <option value="">All Fuel Types</option>
                      {fuelTypes.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Transmission</label>
                  <div className="relative">
                    <Gauge className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gold h-4 w-4" />
                    <select 
                      name="transmission"
                      value={searchData.transmission}
                      onChange={handleChange}
                      className="w-full bg-white/5 border border-white/10 rounded-md py-3 pl-10 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-gold/50 transition-all duration-300"
                    >
                      <option value="">All Transmissions</option>
                      {transmissionTypes.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Minimum Seats</label>
                  <div className="relative">
                    <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gold h-4 w-4" />
                    <select 
                      name="seats"
                      value={searchData.seats}
                      onChange={handleChange}
                      className="w-full bg-white/5 border border-white/10 rounded-md py-3 pl-10 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-gold/50 transition-all duration-300"
                    >
                      <option value={0}>Any</option>
                      <option value={2}>2+</option>
                      <option value={4}>4+</option>
                      <option value={5}>5+</option>
                      <option value={7}>7+</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Price Range: {formatPrice(searchData.minPrice)} - {formatPrice(searchData.maxPrice)}
                  </label>
                  <div className="px-3 pt-5 pb-2">
                    <div className="relative h-1 bg-gray-700 rounded-full">
                      <div 
                        className="absolute h-1 bg-gold rounded-full"
                        style={{ 
                          left: `${((searchData.minPrice - priceRange.min) / (priceRange.max - priceRange.min)) * 100}%`,
                          right: `${100 - ((searchData.maxPrice - priceRange.min) / (priceRange.max - priceRange.min)) * 100}%`
                        }}
                      ></div>
                      <input
                        type="range"
                        min={priceRange.min}
                        max={priceRange.max}
                        value={searchData.minPrice}
                        onChange={(e) => setSearchData(prev => ({ ...prev, minPrice: parseInt(e.target.value) }))}
                        className="absolute w-full h-1 opacity-0 cursor-pointer"
                      />
                      <input
                        type="range"
                        min={priceRange.min}
                        max={priceRange.max}
                        value={searchData.maxPrice}
                        onChange={(e) => setSearchData(prev => ({ ...prev, maxPrice: parseInt(e.target.value) }))}
                        className="absolute w-full h-1 opacity-0 cursor-pointer"
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
            
            {/* Search button */}
            <div className="flex justify-center">
              <button 
                type="submit"
                className="bg-gradient-to-r from-gold to-gold/90 hover:from-gold/90 hover:to-gold text-black font-medium py-3 px-8 rounded-md transition-all duration-300 flex items-center justify-center shadow-lg shadow-gold/20 transform hover:translate-y-[-2px]"
                disabled={loading}
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin mr-2"></div>
                ) : (
                  <Search className="mr-2 h-5 w-5" />
                )}
                Find Your Perfect Car
              </button>
            </div>
          </form>
        </motion.div>
        
        {/* Search Results */}
        {showResults && (
          <motion.div
            id="search-results"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-5xl mx-auto mt-6 mb-12 bg-gradient-to-r from-gray-900/90 to-gray-800/90 backdrop-blur-md rounded-xl p-6 border border-white/10 shadow-xl shadow-black/20"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-white">
                {searchResults.length} {searchResults.length === 1 ? 'Car' : 'Cars'} Found
              </h3>
              <button onClick={closeResults} className="text-gray-400 hover:text-white">
                <X size={20} />
              </button>
            </div>
            
            {searchResults.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-400 mb-4">No cars found matching your criteria.</p>
                <button 
                  onClick={resetSearch}
                  className="text-gold hover:text-gold/80 transition-colors"
                >
                  Reset filters and try again
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                {searchResults.slice(0, 6).map(car => (
                  <div 
                    key={car._id}
                    className="flex bg-white/5 rounded-lg overflow-hidden border border-white/10 hover:border-gold/30 transition-all duration-300"
                  >
                    <div className="w-1/3 relative">
                      <Image 
                        src={getImageUrl(car.images?.[0])} 
                        alt={`${car.brand} ${car.model}`}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="w-2/3 p-4">
                      <div className="flex justify-between items-start">
                        <h4 className="text-white font-bold">{car.brand} {car.model}</h4>
                        <span className="text-gold font-medium">{formatPrice(car.price_per_day)}/day</span>
                      </div>
                      <p className="text-gray-400 text-sm mb-2">{car.year}</p>
                      <div className="flex flex-wrap gap-2 mb-3">
                        <span className="text-xs bg-white/10 text-gray-300 px-2 py-1 rounded-full">{car.fuel_type}</span>
                        <span className="text-xs bg-white/10 text-gray-300 px-2 py-1 rounded-full">{car.transmission}</span>
                        <span className="text-xs bg-white/10 text-gray-300 px-2 py-1 rounded-full">{car.seats} Seats</span>
                      </div>
                      <Link 
                        href={`/cars/${car._id}`}
                        className="text-sm text-gold hover:text-gold/80 flex items-center"
                      >
                        View Details
                        <ChevronDown className="w-4 h-4 ml-1 rotate-[-90deg]" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {searchResults.length > 6 && (
              <div className="text-center mt-4">
                <Link 
                  href="/cars"
                  className="text-gold hover:text-gold/80 transition-colors flex items-center justify-center"
                >
                  View all {searchResults.length} cars
                  <ChevronDown className="w-4 h-4 ml-1 rotate-[-90deg]" />
                </Link>
              </div>
            )}
          </motion.div>
        )}
      </div>

      {/* Scroll indicator - Only show when results are not displayed */}
      {!showResults && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 1 }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20"
        >
          <div className="flex flex-col items-center">
            <span className="text-white/70 text-sm mb-2">Scroll to explore</span>
            <div className="w-[30px] h-[50px] rounded-full border-2 border-white/30 flex justify-center pt-2">
              <motion.div
                animate={{ 
                  y: [0, 15, 0],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  repeatType: "loop"
                }}
                className="w-1.5 h-1.5 rounded-full bg-gold"
              />
            </div>
          </div>
        </motion.div>
      )}

      {/* Custom scrollbar styles */}
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(212, 175, 55, 0.5);
          border-radius: 10px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(212, 175, 55, 0.8);
        }
      `}</style>
    </section>
  );
} 