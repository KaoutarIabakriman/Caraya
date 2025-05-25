'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Search, Filter, X, ArrowLeft, Fuel, Users, Gauge, Star } from 'lucide-react';
import axios from 'axios';
import Header from '@/components/home/Header';
import Footer from '@/components/home/Footer';
import Credits from '@/components/home/Credits';

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
  is_available: boolean;
  description: string;
  mileage?: number;
  color?: string;
};

type FilterOptions = {
  brands: string[];
  models: string[];
  fuelTypes: string[];
  transmissionTypes: string[];
  minPrice: number;
  maxPrice: number;
};

export default function CarsPage() {
  // State for cars and pagination
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCars, setTotalCars] = useState(0);
  const carsPerPage = 9;
  
  // State for image carousel
  const [currentImageIndex, setCurrentImageIndex] = useState<Record<string, number>>({});
  const [isHovering, setIsHovering] = useState<Record<string, boolean>>({});
  
  // State for filters
  const [showFilters, setShowFilters] = useState(false);
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    brands: [],
    models: [],
    fuelTypes: [],
    transmissionTypes: [],
    minPrice: 0,
    maxPrice: 1000
  });
  
  // State for search and filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilters, setSelectedFilters] = useState({
    brand: '',
    model: '',
    fuelType: '',
    transmission: '',
    minPrice: 0,
    maxPrice: 1000
  });
  
  // Fetch all cars with filters
  useEffect(() => {
    const fetchCars = async () => {
      try {
        setLoading(true);
        
        // Build query parameters
        const params = new URLSearchParams();
        params.append('page', page.toString());
        params.append('limit', carsPerPage.toString());
        
        if (searchTerm) {
          params.append('search', searchTerm);
        }
        
        if (selectedFilters.brand) {
          params.append('brand', selectedFilters.brand);
        }
        
        if (selectedFilters.model) {
          params.append('model', selectedFilters.model);
        }
        
        if (selectedFilters.fuelType) {
          params.append('fuel_type', selectedFilters.fuelType);
        }
        
        if (selectedFilters.transmission) {
          params.append('transmission', selectedFilters.transmission);
        }
        
        if (selectedFilters.minPrice > filterOptions.minPrice) {
          params.append('min_price', selectedFilters.minPrice.toString());
        }
        
        if (selectedFilters.maxPrice < filterOptions.maxPrice) {
          params.append('max_price', selectedFilters.maxPrice.toString());
        }
        
        const response = await axios.get(`http://localhost:5000/api/cars?${params.toString()}`);
        
        // Initialize image indices for each car
        const initialIndices: Record<string, number> = {};
        const initialHoverStates: Record<string, boolean> = {};
        response.data.cars.forEach((car: Car) => {
          initialIndices[car._id] = 0;
          initialHoverStates[car._id] = false;
        });
        
        setCurrentImageIndex(initialIndices);
        setIsHovering(initialHoverStates);
        setCars(response.data.cars);
        setTotalCars(response.data.total);
        setTotalPages(Math.ceil(response.data.total / carsPerPage));
      } catch (error) {
        console.error('Error fetching cars:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchCars();
  }, [page, searchTerm, selectedFilters]);
  
  // Fetch filter options
  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/cars');
        const cars = response.data.cars;
        
        // Extract unique brands
        const uniqueBrands = Array.from(new Set(cars.map((car: Car) => car.brand))).filter(Boolean) as string[];
        
        // Extract unique models
        const uniqueModels = Array.from(new Set(cars.map((car: Car) => car.model))).filter(Boolean) as string[];
        
        // Extract unique fuel types
        const uniqueFuelTypes = Array.from(new Set(cars.map((car: Car) => car.fuel_type))).filter(Boolean) as string[];
        
        // Extract unique transmission types
        const uniqueTransmissions = Array.from(new Set(cars.map((car: Car) => car.transmission))).filter(Boolean) as string[];
        
        // Calculate price range
        const prices = cars.map((car: Car) => car.price_per_day).filter(Boolean);
        const minPrice = Math.floor(Math.min(...prices));
        const maxPrice = Math.ceil(Math.max(...prices));
        
        setFilterOptions({
          brands: uniqueBrands.sort(),
          models: uniqueModels.sort(),
          fuelTypes: uniqueFuelTypes.sort(),
          transmissionTypes: uniqueTransmissions.sort(),
          minPrice,
          maxPrice
        });
        
        setSelectedFilters(prev => ({
          ...prev,
          minPrice,
          maxPrice
        }));
      } catch (error) {
        console.error('Error fetching filter options:', error);
      }
    };
    
    fetchFilterOptions();
  }, []);
  
  // Handle image navigation
  const nextImage = (carId: string, totalImages: number) => {
    setCurrentImageIndex(prev => ({
      ...prev,
      [carId]: (prev[carId] + 1) % totalImages
    }));
  };

  const prevImage = (carId: string, totalImages: number) => {
    setCurrentImageIndex(prev => ({
      ...prev,
      [carId]: (prev[carId] - 1 + totalImages) % totalImages
    }));
  };

  // Handle mouse enter/leave for carousel controls
  const handleMouseEnter = (carId: string) => {
    setIsHovering(prev => ({
      ...prev,
      [carId]: true
    }));
  };

  const handleMouseLeave = (carId: string) => {
    setIsHovering(prev => ({
      ...prev,
      [carId]: false
    }));
  };
  
  // Format price with currency
  const formatPrice = (price: number) => {
    return `$${price.toFixed(2)}`;
  };

  // Get image URL (handle both local and external URLs)
  const getImageUrl = (imagePath: string) => {
    if (!imagePath) return '/images/car-placeholder.jpg';
    if (imagePath.startsWith('http')) {
      return imagePath;
    }
    return `http://localhost:5000/uploads/${imagePath}`;
  };
  
  // Handle search form submission
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1); // Reset to first page on new search
  };
  
  // Handle filter changes
  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // If brand changes, reset model
    if (name === 'brand' && value !== selectedFilters.brand) {
      setSelectedFilters(prev => ({
        ...prev,
        [name]: value,
        model: ''
      }));
    } else {
      setSelectedFilters(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    // Reset to first page when filters change
    setPage(1);
  };
  
  // Reset filters
  const resetFilters = () => {
    setSelectedFilters({
      brand: '',
      model: '',
      fuelType: '',
      transmission: '',
      minPrice: filterOptions.minPrice,
      maxPrice: filterOptions.maxPrice
    });
    setSearchTerm('');
    setPage(1);
  };
  
  // Get filtered models based on selected brand
  const getFilteredModels = () => {
    if (!selectedFilters.brand) return filterOptions.models;
    return filterOptions.models.filter(model => {
      const car = cars.find(car => car.model === model);
      return car && car.brand === selectedFilters.brand;
    });
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      <Header />
      
      <div className="pt-32 pb-24">
        <div className="container mx-auto px-4">
          {/* Back button and title */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
            <div className="flex items-center mb-4 md:mb-0">
              <Link 
                href="/" 
                className="flex items-center mr-6 text-white hover:text-gold transition-colors duration-300"
              >
                <ArrowLeft size={20} className="mr-2" />
                <span>Back to Home</span>
              </Link>
              
              <h1 className="text-3xl font-bold">
                <span className="text-white">Our </span>
                <span className="text-gold">Cars</span>
              </h1>
            </div>
            
            <div className="flex items-center">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center bg-gold/20 hover:bg-gold/30 text-gold px-4 py-2 rounded-md transition-colors duration-300 mr-4"
              >
                <Filter size={18} className="mr-2" />
                {showFilters ? 'Hide Filters' : 'Show Filters'}
              </button>
              
              <form onSubmit={handleSearch} className="relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search cars..."
                  className="bg-white/5 border border-white/10 rounded-md py-2 pl-10 pr-4 text-white w-full md:w-64 focus:outline-none focus:ring-2 focus:ring-gold/50 transition-all duration-300"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                {searchTerm && (
                  <button
                    type="button"
                    onClick={() => setSearchTerm('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    <X size={16} />
                  </button>
                )}
              </form>
            </div>
          </div>
          
          {/* Filters */}
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-gradient-to-r from-gray-800/50 to-gray-900/50 backdrop-blur-sm p-6 rounded-xl border border-white/10 mb-8"
            >
              <div className="flex flex-wrap -mx-2">
                <div className="px-2 w-full md:w-1/2 lg:w-1/4 mb-4">
                  <label className="block text-sm font-medium text-gray-300 mb-1">Brand</label>
                  <select
                    name="brand"
                    value={selectedFilters.brand}
                    onChange={handleFilterChange}
                    className="w-full bg-white/5 border border-white/10 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-gold/50 transition-all duration-300"
                  >
                    <option value="">All Brands</option>
                    {filterOptions.brands.map(brand => (
                      <option key={brand} value={brand}>{brand}</option>
                    ))}
                  </select>
                </div>
                
                <div className="px-2 w-full md:w-1/2 lg:w-1/4 mb-4">
                  <label className="block text-sm font-medium text-gray-300 mb-1">Model</label>
                  <select
                    name="model"
                    value={selectedFilters.model}
                    onChange={handleFilterChange}
                    className="w-full bg-white/5 border border-white/10 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-gold/50 transition-all duration-300"
                    disabled={!selectedFilters.brand && getFilteredModels().length > 20}
                  >
                    <option value="">All Models</option>
                    {getFilteredModels().map(model => (
                      <option key={model} value={model}>{model}</option>
                    ))}
                  </select>
                </div>
                
                <div className="px-2 w-full md:w-1/2 lg:w-1/4 mb-4">
                  <label className="block text-sm font-medium text-gray-300 mb-1">Fuel Type</label>
                  <select
                    name="fuelType"
                    value={selectedFilters.fuelType}
                    onChange={handleFilterChange}
                    className="w-full bg-white/5 border border-white/10 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-gold/50 transition-all duration-300"
                  >
                    <option value="">All Fuel Types</option>
                    {filterOptions.fuelTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
                
                <div className="px-2 w-full md:w-1/2 lg:w-1/4 mb-4">
                  <label className="block text-sm font-medium text-gray-300 mb-1">Transmission</label>
                  <select
                    name="transmission"
                    value={selectedFilters.transmission}
                    onChange={handleFilterChange}
                    className="w-full bg-white/5 border border-white/10 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-gold/50 transition-all duration-300"
                  >
                    <option value="">All Transmissions</option>
                    {filterOptions.transmissionTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
                
                <div className="px-2 w-full lg:w-1/2 mb-4">
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Price Range: {formatPrice(selectedFilters.minPrice)} - {formatPrice(selectedFilters.maxPrice)}
                  </label>
                  <div className="px-3 pt-5 pb-2">
                    <div className="relative h-1 bg-gray-700 rounded-full">
                      <div 
                        className="absolute h-1 bg-gold rounded-full"
                        style={{ 
                          left: `${((selectedFilters.minPrice - filterOptions.minPrice) / (filterOptions.maxPrice - filterOptions.minPrice)) * 100}%`,
                          right: `${100 - ((selectedFilters.maxPrice - filterOptions.minPrice) / (filterOptions.maxPrice - filterOptions.minPrice)) * 100}%`
                        }}
                      ></div>
                      <input
                        type="range"
                        name="minPrice"
                        min={filterOptions.minPrice}
                        max={filterOptions.maxPrice}
                        value={selectedFilters.minPrice}
                        onChange={handleFilterChange}
                        className="absolute w-full h-1 opacity-0 cursor-pointer"
                      />
                      <input
                        type="range"
                        name="maxPrice"
                        min={filterOptions.minPrice}
                        max={filterOptions.maxPrice}
                        value={selectedFilters.maxPrice}
                        onChange={handleFilterChange}
                        className="absolute w-full h-1 opacity-0 cursor-pointer"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="px-2 w-full lg:w-1/2 mb-4 flex items-end">
                  <button
                    onClick={resetFilters}
                    className="bg-transparent hover:bg-white/10 text-white border border-white/20 px-4 py-2 rounded-md transition-colors duration-300"
                  >
                    Reset Filters
                  </button>
                </div>
              </div>
            </motion.div>
          )}
          
          {/* Results summary */}
          <div className="mb-6 text-gray-400">
            {loading ? (
              <p>Loading cars...</p>
            ) : (
              <p>Showing {cars.length} of {totalCars} cars</p>
            )}
          </div>
          
          {/* Cars grid */}
          {loading ? (
            <div className="flex justify-center items-center min-h-[400px]">
              <div className="relative w-16 h-16">
                <div className="absolute inset-0 rounded-full border-2 border-gold/20"></div>
                <div className="absolute inset-0 rounded-full border-t-2 border-gold animate-spin"></div>
              </div>
            </div>
          ) : (
            <>
              {cars.length === 0 ? (
                <div className="text-center py-20 bg-white/5 rounded-xl border border-white/10">
                  <h3 className="text-xl font-bold mb-2">No cars found</h3>
                  <p className="text-gray-400 mb-6">Try adjusting your filters or search term</p>
                  <button
                    onClick={resetFilters}
                    className="bg-gold hover:bg-gold/90 text-black px-6 py-2 rounded-md transition-colors duration-300"
                  >
                    Reset Filters
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {cars.map((car, index) => (
                    <motion.div 
                      key={car._id}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: index * 0.1 }}
                      className="group bg-gradient-to-b from-gray-800/80 to-gray-900/80 backdrop-blur-sm rounded-xl overflow-hidden border border-gray-700 hover:border-gold/30 transition-all duration-500 hover:shadow-[0_0_30px_rgba(212,175,55,0.15)] transform-gpu hover:-translate-y-1"
                      onMouseEnter={() => handleMouseEnter(car._id)}
                      onMouseLeave={() => handleMouseLeave(car._id)}
                    >
                      <div className="relative h-64 overflow-hidden">
                        {/* Image carousel */}
                        {car.images && car.images.length > 0 ? (
                          <>
                            <div className="relative w-full h-full">
                              {car.images.map((image, imgIndex) => (
                                <div 
                                  key={imgIndex}
                                  className="absolute inset-0 transition-opacity duration-500"
                                  style={{ opacity: currentImageIndex[car._id] === imgIndex ? 1 : 0 }}
                                >
                                  <Image 
                                    src={getImageUrl(image)} 
                                    alt={`${car.brand} ${car.model} - Image ${imgIndex + 1}`} 
                                    fill
                                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                                  />
                                </div>
                              ))}
                            </div>
                            
                            {/* Image navigation dots */}
                            {car.images.length > 1 && (
                              <div className="absolute bottom-3 left-0 right-0 flex justify-center space-x-2 z-10">
                                {car.images.map((_, imgIndex) => (
                                  <button
                                    key={imgIndex}
                                    onClick={(e) => {
                                      e.preventDefault();
                                      setCurrentImageIndex(prev => ({
                                        ...prev,
                                        [car._id]: imgIndex
                                      }));
                                    }}
                                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                                      currentImageIndex[car._id] === imgIndex 
                                        ? 'bg-gold w-4' 
                                        : 'bg-white/50 hover:bg-white'
                                    }`}
                                    aria-label={`View image ${imgIndex + 1}`}
                                  />
                                ))}
                              </div>
                            )}
                            
                            {/* Navigation arrows (only show on hover and if multiple images) */}
                            {car.images.length > 1 && isHovering[car._id] && (
                              <>
                                <button
                                  onClick={(e) => {
                                    e.preventDefault();
                                    prevImage(car._id, car.images.length);
                                  }}
                                  className="absolute left-2 top-1/2 transform -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 flex items-center justify-center text-white hover:bg-black/70 transition-all duration-300 z-10"
                                  aria-label="Previous image"
                                >
                                  <ChevronLeft size={18} />
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.preventDefault();
                                    nextImage(car._id, car.images.length);
                                  }}
                                  className="absolute right-2 top-1/2 transform -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 flex items-center justify-center text-white hover:bg-black/70 transition-all duration-300 z-10"
                                  aria-label="Next image"
                                >
                                  <ChevronRight size={18} />
                                </button>
                              </>
                            )}
                          </>
                        ) : (
                          <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                            <span className="text-gray-500">No image available</span>
                          </div>
                        )}
                        <div className="absolute top-4 right-4 bg-black/70 backdrop-blur-sm text-gold px-4 py-1.5 rounded-full text-sm font-medium border border-gold/20 shadow-lg shadow-black/50">
                          {formatPrice(car.price_per_day)}/day
                        </div>
                      </div>

                      <div className="p-6">
                        <div className="flex items-center mb-3">
                          <div className="flex">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star 
                                key={star} 
                                size={16} 
                                className={`${star <= 5 ? 'text-gold' : 'text-gray-600'} fill-current`} 
                              />
                            ))}
                          </div>
                          <span className="text-gray-400 text-sm ml-2">(24 reviews)</span>
                        </div>

                        <h3 className="text-xl font-bold text-white mb-2 group-hover:text-gold transition-colors duration-300">
                          {car.brand} {car.model} <span className="text-gold/70 font-normal">{car.year}</span>
                        </h3>
                        
                        <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                          {car.description || `Experience the luxury and performance of the ${car.year} ${car.brand} ${car.model}.`}
                        </p>

                        <div className="grid grid-cols-3 gap-2 mb-6">
                          <div className="flex items-center text-gray-300 text-sm">
                            <Fuel size={16} className="mr-1.5 text-gold" />
                            <span>{car.fuel_type}</span>
                          </div>
                          <div className="flex items-center text-gray-300 text-sm">
                            <Users size={16} className="mr-1.5 text-gold" />
                            <span>{car.seats} Seats</span>
                          </div>
                          <div className="flex items-center text-gray-300 text-sm">
                            <Gauge size={16} className="mr-1.5 text-gold" />
                            <span>{car.transmission}</span>
                          </div>
                        </div>

                        <Link 
                          href={`/cars/${car._id}`}
                          className="group relative block w-full bg-transparent overflow-hidden border border-gold text-gold font-medium py-2.5 px-4 rounded-md transition-all duration-500 z-10"
                        >
                          <span className="relative z-10 group-hover:text-black transition-colors duration-500 flex items-center justify-center">
                            View Details
                            <ChevronRight size={16} className="ml-1.5 transition-transform duration-300 group-hover:translate-x-1" />
                          </span>
                          <span className="absolute inset-0 bg-gradient-to-r from-gold to-amber-500 w-0 group-hover:w-full transition-all duration-500"></span>
                        </Link>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
              
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center mt-12">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                      disabled={page === 1}
                      className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors duration-300 ${
                        page === 1 
                          ? 'bg-gray-800 text-gray-600 cursor-not-allowed' 
                          : 'bg-gray-800 text-white hover:bg-gold hover:text-black'
                      }`}
                    >
                      <ChevronLeft size={18} />
                    </button>
                    
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => (
                      <button
                        key={pageNum}
                        onClick={() => setPage(pageNum)}
                        className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors duration-300 ${
                          page === pageNum 
                            ? 'bg-gold text-black' 
                            : 'bg-gray-800 text-white hover:bg-gold/20'
                        }`}
                      >
                        {pageNum}
                      </button>
                    ))}
                    
                    <button
                      onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={page === totalPages}
                      className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors duration-300 ${
                        page === totalPages 
                          ? 'bg-gray-800 text-gray-600 cursor-not-allowed' 
                          : 'bg-gray-800 text-white hover:bg-gold hover:text-black'
                      }`}
                    >
                      <ChevronRight size={18} />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
      
      <Credits />
      <Footer />
    </main>
  );
} 