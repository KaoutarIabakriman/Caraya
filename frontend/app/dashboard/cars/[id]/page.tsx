'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '@/lib/auth-provider';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, Calendar, Edit, Car as CarIcon, Tag, Fuel, Settings, Users, Info, FileText, Loader2, AlertCircle, Shield } from 'lucide-react';
import { motion } from 'framer-motion';

// Define car type with all fields
type Car = {
  _id: string;
  brand: string;
  model: string;
  year: number;
  price_per_day: number;
  availability_status: string;
  features: string[];
  images: string[];
  description: string;
  fuel_type: string;
  transmission: string;
  seats: number;
  color: string;
  license_plate: string;
  mileage: number;
  insurance_info: Record<string, any>;
  maintenance_status: string;
  current_renter_id: string | null;
  rental_history: RentalRecord[];
  created_at: string;
  updated_at: string;
};

type RentalRecord = {
  record_id: string;
  renter_id: string;
  start_date: string;
  end_date: string;
  total_cost: number;
  status: string;
  created_at: string;
};

export default function CarDetailsPage({ params }: { params: { id: string } }) {
  const { token, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [car, setCar] = useState<Car | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        when: "beforeChildren",
        staggerChildren: 0.1,
        duration: 0.3 
      } 
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.4 } }
  };

  useEffect(() => {
    // Redirect if not authenticated
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    // Fetch car details when component mounts
    if (isAuthenticated && token) {
      fetchCarDetails();
    }
  }, [isAuthenticated, token, params.id]);

  const fetchCarDetails = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:5000/api/cars/${params.id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setCar(response.data.car);
      setError(null);
    } catch (error: any) {
      console.error('Error fetching car details:', error);
      setError(error.response?.data?.message || 'Failed to fetch car details');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-900/30 text-green-400 border border-green-500/30';
      case 'rented':
        return 'bg-blue-900/30 text-blue-400 border border-blue-500/30';
      case 'maintenance':
        return 'bg-yellow-900/30 text-yellow-400 border border-yellow-500/30';
      default:
        return 'bg-gray-800/50 text-gray-300 border border-gray-700';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Function to ensure image URLs are properly formatted
  const getFullImageUrl = (url: string) => {
    if (url.startsWith('http')) {
      return url;
    } else if (url.startsWith('/uploads/')) {
      return `http://localhost:5000${url}`;
    } else {
      return url;
    }
  };

  if (isLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-gold" />
      </div>
    );
  }

  if (error || !car) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-900/20 border-l-4 border-red-500 text-red-400 p-4 mb-6 rounded-r-md">
          <div className="flex items-center">
            <AlertCircle className="mr-2" />
            <p>{error || 'Car not found'}</p>
          </div>
        </div>
        <Link 
          href="/dashboard/cars" 
          className="flex items-center gap-2 text-gold hover:text-white transition-colors"
        >
          <ArrowLeft size={18} />
          <span>Back to Cars</span>
        </Link>
      </div>
    );
  }

  return (
    <motion.div 
      className="container mx-auto px-4 py-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div 
        className="mb-6 flex items-center justify-between"
        variants={itemVariants}
      >
        <Link 
          href="/dashboard/cars" 
          className="flex items-center gap-2 text-gold hover:text-white transition-colors"
        >
          <ArrowLeft size={18} />
          <span>Back to Cars</span>
        </Link>
        
        <Link 
          href={`/dashboard/cars/edit/${car._id}`} 
          className="flex items-center gap-2 bg-gradient-to-r from-gold to-amber-500 hover:from-gold hover:to-amber-400 text-black px-4 py-2 rounded-md transition-all duration-300 font-medium"
        >
          <Edit size={18} />
          <span>Edit Car</span>
        </Link>
      </motion.div>
      
      <motion.div 
        className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 rounded-lg border border-white/10 shadow-lg backdrop-blur-sm overflow-hidden"
        variants={itemVariants}
      >
        {/* Car Header */}
        <div className="p-6 border-b border-white/10">
          <div className="flex flex-col md:flex-row md:items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold font-serif text-white">
                <span className="text-gold">{car.brand}</span> {car.model}
              </h1>
              <p className="text-gray-400 mt-1">
                {car.year} • {car.color} • License: {car.license_plate}
              </p>
            </div>
            <div className="mt-4 md:mt-0">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(car.availability_status)}`}>
                {car.availability_status}
              </span>
              <p className="mt-2 text-2xl font-bold text-gold">${car.price_per_day}/day</p>
            </div>
          </div>
        </div>
        
        {/* Car Images */}
        <div className="p-6 border-b border-white/10">
          <div className="flex flex-col">
            <div className="relative h-80 w-full rounded-lg overflow-hidden mb-4 border border-white/10">
              {car.images && car.images.length > 0 ? (
                <Image 
                  src={getFullImageUrl(car.images[activeImageIndex])} 
                  alt={`${car.brand} ${car.model}`} 
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center bg-gray-800">
                  <CarIcon className="text-gray-600" size={48} />
                </div>
              )}
            </div>
            
            {car.images && car.images.length > 1 && (
              <div className="flex space-x-2 overflow-x-auto pb-2">
                {car.images.map((image, index) => (
                  <div 
                    key={index}
                    className={`h-20 w-32 relative rounded-md overflow-hidden cursor-pointer border ${index === activeImageIndex ? 'border-gold' : 'border-white/10'}`}
                    onClick={() => setActiveImageIndex(index)}
                  >
                    <Image 
                      src={getFullImageUrl(image)} 
                      alt={`${car.brand} ${car.model} thumbnail ${index + 1}`} 
                      fill
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        
        {/* Car Details */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 border-b border-white/10">
          <div>
            <h2 className="text-xl font-bold font-serif mb-4 flex items-center text-white">
              <Info className="mr-2 text-gold" size={20} />
              Basic Information
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-400">Brand</p>
                <p className="font-medium text-white">{car.brand}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Model</p>
                <p className="font-medium text-white">{car.model}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Year</p>
                <p className="font-medium text-white">{car.year}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Color</p>
                <p className="font-medium text-white">{car.color}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">License Plate</p>
                <p className="font-medium text-white">{car.license_plate}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Mileage</p>
                <p className="font-medium text-white">{car.mileage.toLocaleString()} km</p>
              </div>
            </div>
          </div>
          
          <div>
            <h2 className="text-xl font-bold font-serif mb-4 flex items-center text-white">
              <Settings className="mr-2 text-gold" size={20} />
              Technical Specifications
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-400">Fuel Type</p>
                <p className="font-medium text-white">{car.fuel_type || 'Not specified'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Transmission</p>
                <p className="font-medium text-white">{car.transmission || 'Not specified'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Seats</p>
                <p className="font-medium text-white">{car.seats || 'Not specified'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Maintenance Status</p>
                <p className="font-medium">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(car.maintenance_status)}`}>
                    {car.maintenance_status}
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Description */}
        {car.description && (
          <div className="p-6 border-b border-white/10">
            <h2 className="text-xl font-bold font-serif mb-4 flex items-center text-white">
              <FileText className="mr-2 text-gold" size={20} />
              Description
            </h2>
            <p className="text-gray-300 whitespace-pre-line">{car.description}</p>
          </div>
        )}
        
        {/* Features */}
        {car.features && car.features.length > 0 && (
          <div className="p-6 border-b border-white/10">
            <h2 className="text-xl font-bold font-serif mb-4 flex items-center text-white">
              <Tag className="mr-2 text-gold" size={20} />
              Features
            </h2>
            <div className="flex flex-wrap gap-2">
              {car.features.map((feature, index) => (
                <span 
                  key={index} 
                  className="px-3 py-1 bg-gray-800/50 text-gray-300 rounded-full text-sm border border-white/10"
                >
                  {feature}
                </span>
              ))}
            </div>
          </div>
        )}
        
        {/* Insurance Info */}
        {car.insurance_info && (car.insurance_info.provider || car.insurance_info.policy_number || car.insurance_info.expiry_date) && (
          <div className="p-6 border-b border-white/10">
            <h2 className="text-xl font-bold font-serif mb-4 flex items-center text-white">
              <Shield className="mr-2 text-gold" size={20} />
              Insurance Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-400">Provider</p>
                <p className="font-medium text-white">{car.insurance_info.provider || 'Not specified'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Policy Number</p>
                <p className="font-medium text-white">{car.insurance_info.policy_number || 'Not specified'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Expiry Date</p>
                <p className="font-medium text-white">
                  {car.insurance_info.expiry_date ? formatDate(car.insurance_info.expiry_date) : 'Not specified'}
                </p>
              </div>
            </div>
          </div>
        )}
        
        {/* Rental History */}
        {car.rental_history && car.rental_history.length > 0 && (
          <div className="p-6">
            <h2 className="text-xl font-bold font-serif mb-4 flex items-center text-white">
              <Calendar className="mr-2 text-gold" size={20} />
              Rental History
            </h2>
            <div className="overflow-x-auto">
              <table className="min-w-full bg-gray-900/50 rounded-lg border border-white/10">
                <thead className="text-gray-300">
                  <tr>
                    <th className="py-3 px-4 text-left font-medium">Start Date</th>
                    <th className="py-3 px-4 text-left font-medium">End Date</th>
                    <th className="py-3 px-4 text-left font-medium">Status</th>
                    <th className="py-3 px-4 text-left font-medium">Total Cost</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {car.rental_history.map((rental) => (
                    <tr key={rental.record_id} className="hover:bg-white/5 transition-colors">
                      <td className="py-3 px-4 text-gray-300">{formatDate(rental.start_date)}</td>
                      <td className="py-3 px-4 text-gray-300">{formatDate(rental.end_date)}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(rental.status)}`}>
                          {rental.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gold font-medium">${rental.total_cost ? rental.total_cost.toFixed(2) : '0.00'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
} 