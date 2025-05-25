'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronRight, Star, Fuel, Users, Gauge, ChevronLeft, ChevronUp } from 'lucide-react';
import axios from 'axios';
import { motion } from 'framer-motion';

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

export default function FeaturedCars() {
  const [featuredCars, setFeaturedCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState<Record<string, number>>({});
  const [isHovering, setIsHovering] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const fetchFeaturedCars = async () => {
      try {
        setLoading(true);
        const response = await axios.get('http://localhost:5000/api/cars?limit=6&sort=price_per_day:desc');
        
        // Initialize image indices for each car
        const initialIndices: Record<string, number> = {};
        const initialHoverStates: Record<string, boolean> = {};
        response.data.cars.forEach((car: Car) => {
          initialIndices[car._id] = 0;
          initialHoverStates[car._id] = false;
        });
        
        setCurrentImageIndex(initialIndices);
        setIsHovering(initialHoverStates);
        setFeaturedCars(response.data.cars);
      } catch (error) {
        console.error('Error fetching featured cars:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedCars();
  }, []);

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

  return (
    <section id="featured" className="py-24 bg-gradient-to-b from-black to-gray-900 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-gold/20 to-transparent"></div>
      <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-gold/20 to-transparent"></div>
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className="container mx-auto px-4"
      >
        <div className="flex flex-col md:flex-row justify-between items-center mb-16">
          <div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 relative inline-block">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-300">Our </span>
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-gold to-amber-400">Featured</span>
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-300"> Vehicles</span>
              
              {/* Decorative underline */}
              <div className="absolute -bottom-3 left-0 w-full h-[3px]">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gold to-transparent"></div>
                <div className="absolute inset-0 bg-gold/50 blur-sm"></div>
              </div>
            </h2>
            <p className="text-gray-400 max-w-2xl text-lg">
              Experience luxury and performance with our handpicked selection of premium vehicles
            </p>
          </div>
          <Link 
            href="/cars" 
            className="mt-6 md:mt-0 group relative overflow-hidden flex items-center bg-gradient-to-r from-gold/20 to-gold/10 hover:from-gold/30 hover:to-gold/20 px-6 py-3 rounded-full transition-all duration-300"
          >
            <span className="relative z-10 text-white group-hover:text-gold transition-colors duration-300 mr-2 font-medium">View all vehicles</span>
            <div className="relative z-10 w-8 h-8 rounded-full bg-gold/20 flex items-center justify-center group-hover:bg-gold/30 transition-all duration-300">
              <ChevronRight size={18} className="text-gold" />
            </div>
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-r from-black/50 to-black/30 blur-sm"></div>
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center items-center min-h-[400px]">
            <div className="relative w-16 h-16">
              <div className="absolute inset-0 rounded-full border-2 border-gold/20"></div>
              <div className="absolute inset-0 rounded-full border-t-2 border-gold animate-spin"></div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredCars.map((car, index) => (
              <motion.div 
                key={car._id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
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
        
        {featuredCars.length === 0 && !loading && (
          <div className="text-center py-20">
            <p className="text-gray-400 text-lg">No featured cars available at the moment.</p>
          </div>
        )}
      </motion.div>
    </section>
  );
} 