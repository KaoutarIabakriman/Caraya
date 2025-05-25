'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  ChevronLeft, 
  ChevronRight, 
  Star, 
  Calendar, 
  Fuel, 
  Users, 
  Gauge, 
  Car, 
  CheckCircle, 
  Phone, 
  Mail,
  User,
  MapPin,
  Shield,
  Clock,
  Info,
  X
} from 'lucide-react';
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
  license_plate?: string;
  availability_status?: string;
  manager_id?: string;
};

type Manager = {
  id: string;
  name: string;
  email: string;
  phone: string;
  position?: string;
  experience?: number;
};

// Dictionary of fictional phone numbers for managers
const managerPhoneNumbers: Record<string, string> = {
  'default': '+1 (555) 123-4567',
  'admin': '+1 (555) 987-6543',
  'manager1': '+1 (555) 234-5678',
  'manager2': '+1 (555) 345-6789',
  'manager3': '+1 (555) 456-7890',
};

// Dictionary of fictional positions for managers
const managerPositions: Record<string, string> = {
  'default': 'Fleet Manager',
  'admin': 'Senior Fleet Director',
  'manager1': 'Luxury Vehicle Specialist',
  'manager2': 'Customer Experience Manager',
  'manager3': 'Premium Fleet Coordinator',
};

// Dictionary of fictional experience years for managers
const managerExperience: Record<string, number> = {
  'default': 5,
  'admin': 12,
  'manager1': 7,
  'manager2': 4,
  'manager3': 9,
};

export default function CarDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { id } = params;
  
  const [car, setCar] = useState<Car | null>(null);
  const [manager, setManager] = useState<Manager | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showCallModal, setShowCallModal] = useState(false);

  useEffect(() => {
    const fetchCarDetails = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`http://localhost:5000/api/cars/${id}`);
        setCar(response.data.car);
        
        // Once we have the car, fetch the manager details
        if (response.data.car && response.data.car.manager_id) {
          try {
            const managerResponse = await axios.get(`http://localhost:5000/api/managers/${response.data.car.manager_id}`);
            
            // Add fictional phone number and position to the manager data
            const managerId = response.data.car.manager_id;
            const managerData = managerResponse.data.manager;
            
            setManager({
              id: managerId,
              name: managerData.name || 'Unknown Manager',
              email: managerData.email || 'contact@caraya.com',
              phone: managerPhoneNumbers[managerId] || managerPhoneNumbers.default,
              position: managerPositions[managerId] || managerPositions.default,
              experience: managerExperience[managerId] || managerExperience.default
            });
          } catch (managerErr) {
            console.error('Error fetching manager details:', managerErr);
            // Set default manager data if we can't fetch the real manager
            setManager({
              id: 'default',
              name: 'James Wilson',
              email: 'contact@caraya.com',
              phone: managerPhoneNumbers.default,
              position: managerPositions.default,
              experience: managerExperience.default
            });
          }
        } else {
          // Set default manager if car has no manager_id
          setManager({
            id: 'default',
            name: 'James Wilson',
            email: 'contact@caraya.com',
            phone: managerPhoneNumbers.default,
            position: managerPositions.default,
            experience: managerExperience.default
          });
        }
      } catch (err) {
        console.error('Error fetching car details:', err);
        setError('Failed to load car details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchCarDetails();
    }
  }, [id]);

  const nextImage = () => {
    if (!car?.images) return;
    setCurrentImageIndex((prev) => (prev + 1) % car.images.length);
  };

  const prevImage = () => {
    if (!car?.images) return;
    setCurrentImageIndex((prev) => (prev - 1 + car.images.length) % car.images.length);
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

  // Get availability status badge color
  const getStatusColor = (status: string = 'available') => {
    switch (status.toLowerCase()) {
      case 'available':
        return 'bg-green-500/20 text-green-500 border-green-500/30';
      case 'maintenance':
        return 'bg-orange-500/20 text-orange-500 border-orange-500/30';
      case 'rented':
        return 'bg-red-500/20 text-red-500 border-red-500/30';
      default:
        return 'bg-gray-500/20 text-gray-500 border-gray-500/30';
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      <Header />
      
      <div className="pt-32 pb-24">
        <div className="container mx-auto px-4">
          {/* Back button */}
          <div className="mb-8">
            <button 
              onClick={() => router.back()}
              className="flex items-center text-white hover:text-gold transition-colors duration-300"
            >
              <ArrowLeft size={20} className="mr-2" />
              <span>Back to cars</span>
            </button>
          </div>
          
          {loading ? (
            <div className="flex justify-center items-center min-h-[400px]">
              <div className="relative w-16 h-16">
                <div className="absolute inset-0 rounded-full border-2 border-gold/20"></div>
                <div className="absolute inset-0 rounded-full border-t-2 border-gold animate-spin"></div>
              </div>
            </div>
          ) : error ? (
            <div className="text-center py-20 bg-white/5 rounded-xl border border-white/10">
              <h3 className="text-xl font-bold mb-2">Error</h3>
              <p className="text-gray-400 mb-6">{error}</p>
              <button
                onClick={() => router.back()}
                className="bg-gold hover:bg-gold/90 text-black px-6 py-2 rounded-md transition-colors duration-300"
              >
                Go Back
              </button>
            </div>
          ) : car ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Car images and gallery */}
              <div className="lg:col-span-2">
                <div className="relative h-[400px] md:h-[500px] rounded-xl overflow-hidden border border-gray-700">
                  {car.images && car.images.length > 0 ? (
                    <>
                      {car.images.map((image, index) => (
                        <div 
                          key={index} 
                          className="absolute inset-0 transition-opacity duration-500"
                          style={{ opacity: currentImageIndex === index ? 1 : 0 }}
                        >
                          <Image 
                            src={getImageUrl(image)} 
                            alt={`${car.brand} ${car.model} - Image ${index + 1}`} 
                            fill
                            className="object-cover"
                          />
                        </div>
                      ))}
                      
                      {/* Navigation arrows */}
                      {car.images.length > 1 && (
                        <>
                          <button
                            onClick={prevImage}
                            className="absolute left-4 top-1/2 transform -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 flex items-center justify-center text-white hover:bg-black/70 transition-all duration-300"
                            aria-label="Previous image"
                          >
                            <ChevronLeft size={24} />
                          </button>
                          <button
                            onClick={nextImage}
                            className="absolute right-4 top-1/2 transform -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 flex items-center justify-center text-white hover:bg-black/70 transition-all duration-300"
                            aria-label="Next image"
                          >
                            <ChevronRight size={24} />
                          </button>
                        </>
                      )}
                      
                      {/* Image counter */}
                      <div className="absolute bottom-4 right-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm">
                        {currentImageIndex + 1} / {car.images.length}
                      </div>
                    </>
                  ) : (
                    <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                      <Car size={64} className="text-gray-600" />
                      <span className="text-gray-500 ml-4">No images available</span>
                    </div>
                  )}
                </div>
                
                {/* Thumbnails */}
                {car.images && car.images.length > 1 && (
                  <div className="mt-4 flex space-x-2 overflow-x-auto pb-2">
                    {car.images.map((image, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`relative w-20 h-20 rounded-md overflow-hidden flex-shrink-0 border-2 transition-all ${
                          currentImageIndex === index ? 'border-gold' : 'border-transparent hover:border-gray-500'
                        }`}
                      >
                        <Image 
                          src={getImageUrl(image)} 
                          alt={`${car.brand} ${car.model} - Thumbnail ${index + 1}`} 
                          fill
                          className="object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
                
                {/* Car details */}
                <div className="mt-8">
                  <div className="flex flex-wrap items-start justify-between mb-4">
                    <div>
                      <h1 className="text-3xl md:text-4xl font-bold text-white">
                        {car.brand} {car.model} <span className="text-gold">{car.year}</span>
                      </h1>
                      <div className="flex items-center mt-2">
                        <div className="flex mr-3">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star 
                              key={star} 
                              size={18} 
                              className="text-gold fill-current mr-1" 
                            />
                          ))}
                        </div>
                        <span className="text-gray-400">(28 reviews)</span>
                      </div>
                    </div>
                    
                    <div className="mt-4 md:mt-0">
                      <div className="text-3xl font-bold text-gold">
                        {formatPrice(car.price_per_day)}<span className="text-sm font-normal text-gray-400">/day</span>
                      </div>
                      <div className={`mt-2 px-3 py-1 rounded-full text-sm border inline-flex items-center ${getStatusColor(car.availability_status)}`}>
                        <CheckCircle size={14} className="mr-1" />
                        {car.availability_status || 'Available'}
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                      <Fuel className="text-gold mb-2" size={20} />
                      <div className="text-sm text-gray-400">Fuel Type</div>
                      <div className="font-medium">{car.fuel_type || 'N/A'}</div>
                    </div>
                    <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                      <Gauge className="text-gold mb-2" size={20} />
                      <div className="text-sm text-gray-400">Transmission</div>
                      <div className="font-medium">{car.transmission || 'N/A'}</div>
                    </div>
                    <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                      <Users className="text-gold mb-2" size={20} />
                      <div className="text-sm text-gray-400">Seats</div>
                      <div className="font-medium">{car.seats || 'N/A'}</div>
                    </div>
                    <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                      <Clock className="text-gold mb-2" size={20} />
                      <div className="text-sm text-gray-400">Mileage</div>
                      <div className="font-medium">{car.mileage ? `${car.mileage.toLocaleString()} km` : 'N/A'}</div>
                    </div>
                  </div>
                  
                  <div className="mb-8">
                    <h2 className="text-xl font-bold mb-4">Description</h2>
                    <p className="text-gray-300 leading-relaxed">
                      {car.description || `Experience the luxury and performance of the ${car.year} ${car.brand} ${car.model}. This premium vehicle offers exceptional comfort, style, and reliability for your journey.`}
                    </p>
                  </div>
                  
                  <div className="mb-8">
                    <h2 className="text-xl font-bold mb-4">Features</h2>
                    {car.features && car.features.length > 0 ? (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {car.features.map((feature, index) => (
                          <div key={index} className="flex items-center">
                            <CheckCircle size={16} className="text-gold mr-2" />
                            <span>{feature}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-400">No features listed</p>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Sidebar - Manager info and booking */}
              <div className="lg:col-span-1">
                {/* Manager info card */}
                {manager && (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="bg-gradient-to-b from-gray-800/90 to-gray-900/90 backdrop-blur-sm rounded-xl p-6 border border-gray-700 mb-6"
                  >
                    <h3 className="text-xl font-bold mb-4">Car Manager</h3>
                    
                    <div className="flex items-center mb-6">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center shadow-lg border border-gold/30 mr-4">
                        <User size={28} className="text-gold" />
                      </div>
                      <div>
                        <div className="font-bold text-lg">{manager.name}</div>
                        <div className="text-gold text-sm">{manager.position}</div>
                        <div className="text-gray-400 text-sm">{manager.experience} years experience</div>
                      </div>
                    </div>
                    
                    <div className="space-y-3 mb-6">
                      <div className="flex items-center">
                        <Mail size={16} className="text-gold mr-3" />
                        <span className="text-gray-300">{manager.email}</span>
                      </div>
                      <div className="flex items-center">
                        <Phone size={16} className="text-gold mr-3" />
                        <span className="text-gray-300">{manager.phone}</span>
                      </div>
                    </div>
                    
                    <button 
                      onClick={() => setShowCallModal(true)}
                      className="w-full bg-gold hover:bg-gold/90 text-black font-medium py-3 px-4 rounded-lg transition-colors duration-300 flex items-center justify-center"
                    >
                      <Phone size={18} className="mr-2" />
                      Call Manager
                    </button>
                  </motion.div>
                )}
                
                {/* Booking card */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  className="bg-gradient-to-b from-gray-800/90 to-gray-900/90 backdrop-blur-sm rounded-xl p-6 border border-gray-700"
                >
                  <h3 className="text-xl font-bold mb-4">Book This Car</h3>
                  
                  <div className="space-y-4 mb-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Pick-up Date</label>
                        <input 
                          type="date" 
                          className="w-full bg-white/5 border border-white/10 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-gold/50 transition-all duration-300"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Return Date</label>
                        <input 
                          type="date" 
                          className="w-full bg-white/5 border border-white/10 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-gold/50 transition-all duration-300"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1">Pick-up Location</label>
                      <select className="w-full bg-white/5 border border-white/10 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-gold/50 transition-all duration-300">
                        <option value="downtown">Downtown Office</option>
                        <option value="airport">Airport Terminal</option>
                        <option value="hotel">Hotel Delivery</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="border-t border-gray-700 pt-4 mb-6">
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-400">Daily rate:</span>
                      <span>{formatPrice(car.price_per_day)}</span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-400">Insurance:</span>
                      <span>{formatPrice(car.price_per_day * 0.15)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total per day:</span>
                      <span className="text-gold">{formatPrice(car.price_per_day * 1.15)}</span>
                    </div>
                  </div>
                  
                  <Link 
                    href={`/booking/${car._id}`}
                    className="w-full bg-gold hover:bg-gold/90 text-black font-medium py-3 px-4 rounded-lg transition-colors duration-300 flex items-center justify-center"
                  >
                    <Calendar size={18} className="mr-2" />
                    Book Now
                  </Link>
                  
                  <div className="mt-4 text-center text-sm text-gray-400">
                    <div className="flex items-center justify-center">
                      <Shield size={14} className="mr-1" />
                      <span>Free cancellation up to 24 hours before pickup</span>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          ) : (
            <div className="text-center py-20 bg-white/5 rounded-xl border border-white/10">
              <h3 className="text-xl font-bold mb-2">Car not found</h3>
              <p className="text-gray-400 mb-6">The car you are looking for does not exist or has been removed.</p>
              <Link
                href="/cars"
                className="bg-gold hover:bg-gold/90 text-black px-6 py-2 rounded-md transition-colors duration-300"
              >
                Browse Cars
              </Link>
            </div>
          )}
        </div>
      </div>
      
      {/* Call Manager Modal */}
      {showCallModal && manager && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-gray-800 rounded-xl p-6 max-w-md w-full border border-gray-700 relative"
          >
            <button 
              onClick={() => setShowCallModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              <X size={20} />
            </button>
            
            <div className="text-center mb-6">
              <div className="w-20 h-20 rounded-full bg-gold/10 flex items-center justify-center mx-auto mb-4">
                <Phone size={32} className="text-gold" />
              </div>
              <h3 className="text-xl font-bold">Call Manager</h3>
              <p className="text-gray-400 mt-1">Connect with {manager.name} about this vehicle</p>
            </div>
            
            <div className="bg-black/30 rounded-lg p-4 mb-6 text-center">
              <p className="text-lg font-bold text-gold">{manager.phone}</p>
              <p className="text-sm text-gray-400 mt-1">Available 9:00 AM - 6:00 PM, Monday to Friday</p>
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={() => setShowCallModal(false)}
                className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-lg transition-colors duration-300"
              >
                Cancel
              </button>
              <a
                href={`tel:${manager.phone.replace(/\s/g, '')}`}
                className="flex-1 bg-gold hover:bg-gold/90 text-black py-3 rounded-lg transition-colors duration-300 flex items-center justify-center"
              >
                <Phone size={18} className="mr-2" />
                Call Now
              </a>
            </div>
          </motion.div>
        </div>
      )}
      
      <Credits />
      <Footer />
    </main>
  );
} 