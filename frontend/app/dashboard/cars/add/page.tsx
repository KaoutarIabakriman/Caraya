'use client';

import { useState } from 'react';
import axios from 'axios';
import { useAuth } from '@/lib/auth-provider';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Plus, X, Car as CarIcon, Save, Tag, Fuel, Settings, Calendar, DollarSign, Info, AlertCircle, Loader2, Image as ImageIcon, Shield } from 'lucide-react';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import ImageUpload from '@/components/ImageUpload';
import ImageGallery from '@/components/ImageGallery';
import { motion } from 'framer-motion';

// Define image type
interface ImageInfo {
  url: string;
  filename?: string;
}

// Define feature type
interface FeatureItem {
  value: string;
  id: string;
}

// Define form schema
const carSchema = z.object({
  brand: z.string().min(1, 'Brand is required'),
  model: z.string().min(1, 'Model is required'),
  year: z.coerce.number().int().min(1900, 'Year must be at least 1900').max(new Date().getFullYear() + 1, `Year cannot be greater than ${new Date().getFullYear() + 1}`),
  price_per_day: z.coerce.number().positive('Price must be positive'),
  availability_status: z.enum(['available', 'maintenance', 'rented']).default('available'),
  features: z.array(z.object({ value: z.string(), id: z.string() })).default([]),
  description: z.string().optional(),
  fuel_type: z.string().optional(),
  transmission: z.string().optional(),
  seats: z.coerce.number().int().positive().optional(),
  color: z.string().optional(),
  license_plate: z.string().optional(),
  mileage: z.coerce.number().nonnegative('Mileage cannot be negative').default(0),
  insurance_info: z.object({
    provider: z.string().optional(),
    policy_number: z.string().optional(),
    expiry_date: z.string().optional(),
  }).optional(),
  maintenance_status: z.enum(['good', 'needs_attention', 'critical']).default('good'),
});

type CarFormData = z.infer<typeof carSchema>;

export default function AddCarPage() {
  const { token, isAuthenticated } = useAuth();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [images, setImages] = useState<ImageInfo[]>([]);

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

  // Initialize form
  const { 
    register, 
    handleSubmit, 
    control,
    formState: { errors } 
  } = useForm<CarFormData>({
    resolver: zodResolver(carSchema),
    defaultValues: {
      brand: '',
      model: '',
      year: new Date().getFullYear(),
      price_per_day: 0,
      availability_status: 'available',
      features: [],
      description: '',
      fuel_type: '',
      transmission: '',
      seats: 5,
      color: '',
      license_plate: '',
      mileage: 0,
      insurance_info: {
        provider: '',
        policy_number: '',
        expiry_date: ''
      },
      maintenance_status: 'good'
    }
  });

  // Field arrays for features
  const { fields: featureFields, append: appendFeature, remove: removeFeature } = useFieldArray({
    control,
    name: 'features'
  });

  // Handle form submission
  const onSubmit = async (data: CarFormData) => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      // Extract feature values from feature objects
      const featureValues = data.features.map(feature => feature.value);

      // Add images to the data
      const formData = {
        ...data,
        features: featureValues,
        images: images.map(img => img.url)
      };

      // Submit to API
      const response = await axios.post('http://localhost:5000/api/cars', formData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      // Redirect to car details page
      router.push(`/dashboard/cars/${response.data.car._id}`);
    } catch (err: any) {
      console.error('Error creating car:', err);
      setError(err.response?.data?.message || 'Failed to create car. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Add new feature
  const [newFeature, setNewFeature] = useState('');
  const addFeature = () => {
    if (newFeature.trim()) {
      appendFeature({ value: newFeature.trim(), id: Date.now().toString() });
      setNewFeature('');
    }
  };

  // Handle image upload
  const handleImageUploaded = (url: string, filename: string) => {
    setImages([...images, { url, filename }]);
  };

  return (
    <motion.div 
      className="container mx-auto px-4 py-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div 
        className="mb-6 flex items-center"
        variants={itemVariants}
      >
        <Link 
          href="/dashboard/cars" 
          className="flex items-center gap-2 text-gold hover:text-white transition-colors"
        >
          <ArrowLeft size={18} />
          <span>Back to Cars</span>
        </Link>
      </motion.div>
      
      <motion.div 
        className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 rounded-lg border border-white/10 shadow-lg backdrop-blur-sm overflow-hidden"
        variants={itemVariants}
      >
        <div className="p-6 border-b border-white/10">
          <h1 className="text-3xl font-bold font-serif text-white flex items-center">
            <CarIcon className="mr-3 text-gold" size={28} />
            <span>Add <span className="text-gold">New Car</span></span>
          </h1>
        </div>
        
        <form onSubmit={handleSubmit(onSubmit)} className="p-6">
          {error && (
            <div className="mb-6 bg-red-900/20 border-l-4 border-red-500 text-red-400 p-4 rounded-r-md">
              <div className="flex items-center">
                <AlertCircle className="mr-2 flex-shrink-0" />
                <p>{error}</p>
              </div>
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Basic Information */}
            <div className="col-span-1 md:col-span-2">
              <h2 className="text-xl font-bold font-serif mb-4 flex items-center text-white">
                <Info className="mr-2 text-gold" size={20} />
                Basic Information
              </h2>
            </div>
            
            {/* Brand */}
            <div>
              <label htmlFor="brand" className="block text-sm font-medium text-gray-300 mb-1 flex items-center">
                Brand <span className="text-red-400 ml-1">*</span>
              </label>
              <input
                id="brand"
                type="text"
                className={`w-full px-3 py-2 bg-gray-900/50 text-white border rounded-md focus:ring-1 focus:ring-gold focus:border-gold ${errors.brand ? 'border-red-500' : 'border-gray-700'}`}
                {...register('brand')}
              />
              {errors.brand && (
                <p className="mt-1 text-sm text-red-400">{errors.brand.message}</p>
              )}
            </div>
            
            {/* Model */}
            <div>
              <label htmlFor="model" className="block text-sm font-medium text-gray-300 mb-1 flex items-center">
                Model <span className="text-red-400 ml-1">*</span>
              </label>
              <input
                id="model"
                type="text"
                className={`w-full px-3 py-2 bg-gray-900/50 text-white border rounded-md focus:ring-1 focus:ring-gold focus:border-gold ${errors.model ? 'border-red-500' : 'border-gray-700'}`}
                {...register('model')}
              />
              {errors.model && (
                <p className="mt-1 text-sm text-red-400">{errors.model.message}</p>
              )}
            </div>
            
            {/* Year */}
            <div>
              <label htmlFor="year" className="block text-sm font-medium text-gray-300 mb-1 flex items-center">
                <Calendar size={16} className="mr-1 text-gray-400" />
                Year <span className="text-red-400 ml-1">*</span>
              </label>
              <input
                id="year"
                type="number"
                className={`w-full px-3 py-2 bg-gray-900/50 text-white border rounded-md focus:ring-1 focus:ring-gold focus:border-gold ${errors.year ? 'border-red-500' : 'border-gray-700'}`}
                {...register('year')}
              />
              {errors.year && (
                <p className="mt-1 text-sm text-red-400">{errors.year.message}</p>
              )}
            </div>
            
            {/* Price per day */}
            <div>
              <label htmlFor="price_per_day" className="block text-sm font-medium text-gray-300 mb-1 flex items-center">
                <DollarSign size={16} className="mr-1 text-gray-400" />
                Price per Day ($) <span className="text-red-400 ml-1">*</span>
              </label>
              <input
                id="price_per_day"
                type="number"
                step="0.01"
                className={`w-full px-3 py-2 bg-gray-900/50 text-white border rounded-md focus:ring-1 focus:ring-gold focus:border-gold ${errors.price_per_day ? 'border-red-500' : 'border-gray-700'}`}
                {...register('price_per_day')}
              />
              {errors.price_per_day && (
                <p className="mt-1 text-sm text-red-400">{errors.price_per_day.message}</p>
              )}
            </div>
            
            {/* Color */}
            <div>
              <label htmlFor="color" className="block text-sm font-medium text-gray-300 mb-1">
                Color
              </label>
              <input
                id="color"
                type="text"
                className="w-full px-3 py-2 bg-gray-900/50 text-white border border-gray-700 rounded-md focus:ring-1 focus:ring-gold focus:border-gold"
                {...register('color')}
              />
            </div>
            
            {/* License Plate */}
            <div>
              <label htmlFor="license_plate" className="block text-sm font-medium text-gray-300 mb-1">
                License Plate
              </label>
              <input
                id="license_plate"
                type="text"
                className="w-full px-3 py-2 bg-gray-900/50 text-white border border-gray-700 rounded-md focus:ring-1 focus:ring-gold focus:border-gold"
                {...register('license_plate')}
              />
            </div>
            
            {/* Mileage */}
            <div>
              <label htmlFor="mileage" className="block text-sm font-medium text-gray-300 mb-1">
                Mileage (km)
              </label>
              <input
                id="mileage"
                type="number"
                className={`w-full px-3 py-2 bg-gray-900/50 text-white border rounded-md focus:ring-1 focus:ring-gold focus:border-gold ${errors.mileage ? 'border-red-500' : 'border-gray-700'}`}
                {...register('mileage')}
              />
              {errors.mileage && (
                <p className="mt-1 text-sm text-red-400">{errors.mileage.message}</p>
              )}
            </div>
            
            {/* Availability Status */}
            <div>
              <label htmlFor="availability_status" className="block text-sm font-medium text-gray-300 mb-1">
                Availability Status
              </label>
              <select
                id="availability_status"
                className="w-full px-3 py-2 bg-gray-900/50 text-white border border-gray-700 rounded-md focus:ring-1 focus:ring-gold focus:border-gold"
                {...register('availability_status')}
              >
                <option value="available">Available</option>
                <option value="maintenance">Maintenance</option>
                <option value="rented">Rented</option>
              </select>
            </div>
            
            {/* Technical Specifications */}
            <div className="col-span-1 md:col-span-2 mt-4">
              <h2 className="text-xl font-bold font-serif mb-4 flex items-center text-white">
                <Settings className="mr-2 text-gold" size={20} />
                Technical Specifications
              </h2>
            </div>
            
            {/* Fuel Type */}
            <div>
              <label htmlFor="fuel_type" className="block text-sm font-medium text-gray-300 mb-1 flex items-center">
                <Fuel size={16} className="mr-1 text-gray-400" />
                Fuel Type
              </label>
              <input
                id="fuel_type"
                type="text"
                className="w-full px-3 py-2 bg-gray-900/50 text-white border border-gray-700 rounded-md focus:ring-1 focus:ring-gold focus:border-gold"
                {...register('fuel_type')}
              />
            </div>
            
            {/* Transmission */}
            <div>
              <label htmlFor="transmission" className="block text-sm font-medium text-gray-300 mb-1">
                Transmission
              </label>
              <select
                id="transmission"
                className="w-full px-3 py-2 bg-gray-900/50 text-white border border-gray-700 rounded-md focus:ring-1 focus:ring-gold focus:border-gold"
                {...register('transmission')}
              >
                <option value="">Select Transmission</option>
                <option value="automatic">Automatic</option>
                <option value="manual">Manual</option>
                <option value="semi-automatic">Semi-Automatic</option>
              </select>
            </div>
            
            {/* Seats */}
            <div>
              <label htmlFor="seats" className="block text-sm font-medium text-gray-300 mb-1">
                Seats
              </label>
              <input
                id="seats"
                type="number"
                className="w-full px-3 py-2 bg-gray-900/50 text-white border border-gray-700 rounded-md focus:ring-1 focus:ring-gold focus:border-gold"
                {...register('seats')}
              />
            </div>
            
            {/* Maintenance Status */}
            <div>
              <label htmlFor="maintenance_status" className="block text-sm font-medium text-gray-300 mb-1">
                Maintenance Status
              </label>
              <select
                id="maintenance_status"
                className="w-full px-3 py-2 bg-gray-900/50 text-white border border-gray-700 rounded-md focus:ring-1 focus:ring-gold focus:border-gold"
                {...register('maintenance_status')}
              >
                <option value="good">Good</option>
                <option value="needs_attention">Needs Attention</option>
                <option value="critical">Critical</option>
              </select>
            </div>
            
            {/* Description */}
            <div className="col-span-1 md:col-span-2 mt-4">
              <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-1">
                Description
              </label>
              <textarea
                id="description"
                rows={4}
                className="w-full px-3 py-2 bg-gray-900/50 text-white border border-gray-700 rounded-md focus:ring-1 focus:ring-gold focus:border-gold"
                {...register('description')}
              ></textarea>
            </div>
            
            {/* Features */}
            <div className="col-span-1 md:col-span-2 mt-4">
              <h2 className="text-xl font-bold font-serif mb-4 flex items-center text-white">
                <Tag className="mr-2 text-gold" size={20} />
                Features
              </h2>
              
              <div className="flex flex-wrap gap-2 mb-4">
                {featureFields.map((field, index) => (
                  <div key={field.id} className="flex items-center bg-gray-800/50 text-gray-300 rounded-full px-3 py-1 border border-white/10">
                    <span>{field.value}</span>
                    <button
                      type="button"
                      onClick={() => removeFeature(index)}
                      className="ml-2 text-gray-400 hover:text-red-400 transition-colors"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
                
                {featureFields.length === 0 && (
                  <p className="text-gray-400 text-sm">No features added yet.</p>
                )}
              </div>
              
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newFeature}
                  onChange={(e) => setNewFeature(e.target.value)}
                  placeholder="Add a feature..."
                  className="flex-1 px-3 py-2 bg-gray-900/50 text-white border border-gray-700 rounded-md focus:ring-1 focus:ring-gold focus:border-gold"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addFeature();
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={addFeature}
                  className="px-3 py-2 bg-gray-800 text-gold border border-gold/30 rounded-md hover:bg-gold/10 transition-colors"
                >
                  <Plus size={18} />
                </button>
              </div>
            </div>
            
            {/* Insurance Information */}
            <div className="col-span-1 md:col-span-2 mt-4">
              <h2 className="text-xl font-bold font-serif mb-4 flex items-center text-white">
                <Shield className="mr-2 text-gold" size={20} />
                Insurance Information
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="insurance_provider" className="block text-sm font-medium text-gray-300 mb-1">
                    Provider
                  </label>
                  <input
                    id="insurance_provider"
                    type="text"
                    className="w-full px-3 py-2 bg-gray-900/50 text-white border border-gray-700 rounded-md focus:ring-1 focus:ring-gold focus:border-gold"
                    {...register('insurance_info.provider')}
                  />
                </div>
                
                <div>
                  <label htmlFor="insurance_policy_number" className="block text-sm font-medium text-gray-300 mb-1">
                    Policy Number
                  </label>
                  <input
                    id="insurance_policy_number"
                    type="text"
                    className="w-full px-3 py-2 bg-gray-900/50 text-white border border-gray-700 rounded-md focus:ring-1 focus:ring-gold focus:border-gold"
                    {...register('insurance_info.policy_number')}
                  />
                </div>
                
                <div>
                  <label htmlFor="insurance_expiry_date" className="block text-sm font-medium text-gray-300 mb-1">
                    Expiry Date
                  </label>
                  <input
                    id="insurance_expiry_date"
                    type="date"
                    className="w-full px-3 py-2 bg-gray-900/50 text-white border border-gray-700 rounded-md focus:ring-1 focus:ring-gold focus:border-gold"
                    {...register('insurance_info.expiry_date')}
                  />
                </div>
              </div>
            </div>
            
            {/* Images */}
            <div className="col-span-1 md:col-span-2 mt-4">
              <h2 className="text-xl font-bold font-serif mb-4 flex items-center text-white">
                <ImageIcon className="mr-2 text-gold" size={20} />
                Images
              </h2>
              
              <ImageGallery 
                images={images} 
                onImagesChange={setImages} 
                className="mb-4" 
              />
              
              <ImageUpload onImageUploaded={handleImageUploaded} />
            </div>
          </div>
          
          <div className="flex justify-end mt-8 border-t border-white/10 pt-6">
            <Link
              href="/dashboard/cars"
              className="px-4 py-2 border border-white/10 text-gray-300 rounded-md hover:bg-white/5 transition-colors mr-4"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-gold to-amber-500 hover:from-gold hover:to-amber-400 text-black rounded-md transition-all duration-300 disabled:opacity-50 font-medium"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="animate-spin h-4 w-4" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save size={18} />
                  <span>Save Car</span>
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
} 