'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '@/lib/auth-provider';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Plus, X, Car as CarIcon } from 'lucide-react';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import ImageUpload from '@/components/ImageUpload';
import ImageGallery from '@/components/ImageGallery';

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

export default function EditCarPage({ params }: { params: { id: string } }) {
  const { token, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [images, setImages] = useState<ImageInfo[]>([]);

  // Initialize form
  const { 
    register, 
    handleSubmit, 
    control,
    reset,
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

  // Fetch car data
  useEffect(() => {
    // Redirect if not authenticated
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
      return;
    }

    if (isAuthenticated && token) {
      fetchCarData();
    }
  }, [isAuthenticated, isLoading, token, params.id]);

  const fetchCarData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:5000/api/cars/${params.id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      const carData = response.data.car;
      
      // Convert string features to feature objects
      const featureObjects = carData.features?.map((feature: string) => ({
        value: feature,
        id: Date.now() + Math.random().toString()
      })) || [];
      
      // Format the data for the form
      reset({
        brand: carData.brand || '',
        model: carData.model || '',
        year: carData.year || new Date().getFullYear(),
        price_per_day: carData.price_per_day || 0,
        availability_status: carData.availability_status || 'available',
        features: featureObjects,
        description: carData.description || '',
        fuel_type: carData.fuel_type || '',
        transmission: carData.transmission || '',
        seats: carData.seats || 5,
        color: carData.color || '',
        license_plate: carData.license_plate || '',
        mileage: carData.mileage || 0,
        insurance_info: {
          provider: carData.insurance_info?.provider || '',
          policy_number: carData.insurance_info?.policy_number || '',
          expiry_date: carData.insurance_info?.expiry_date || ''
        },
        maintenance_status: carData.maintenance_status || 'good'
      });

      // Set images
      setImages(carData.images?.map((url: string) => ({ url })) || []);

      setError(null);
    } catch (err: any) {
      console.error('Error fetching car data:', err);
      setError(err.response?.data?.message || 'Failed to fetch car data');
    } finally {
      setLoading(false);
    }
  };

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
      await axios.put(`http://localhost:5000/api/cars/${params.id}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      // Redirect to car details page
      router.push(`/dashboard/cars/${params.id}`);
    } catch (err: any) {
      console.error('Error updating car:', err);
      setError(err.response?.data?.message || 'Failed to update car. Please try again.');
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

  if (isLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex items-center">
        <Link 
          href={`/dashboard/cars/${params.id}`} 
          className="flex items-center gap-2 text-blue-600 hover:underline"
        >
          <ArrowLeft size={18} />
          <span>Back to Car Details</span>
        </Link>
      </div>
      
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-3xl font-bold text-gray-900">Edit Car</h1>
        </div>
        
        <form onSubmit={handleSubmit(onSubmit)} className="p-6">
          {error && (
            <div className="mb-6 bg-red-100 border-l-4 border-red-500 text-red-700 p-4">
              <p>{error}</p>
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Basic Information */}
            <div className="col-span-1 md:col-span-2">
              <h2 className="text-xl font-bold mb-4">Basic Information</h2>
            </div>
            
            {/* Brand */}
            <div>
              <label htmlFor="brand" className="block text-sm font-medium text-gray-700 mb-1">
                Brand *
              </label>
              <input
                id="brand"
                type="text"
                className={`w-full px-3 py-2 border rounded-md ${errors.brand ? 'border-red-500' : 'border-gray-300'}`}
                {...register('brand')}
              />
              {errors.brand && (
                <p className="mt-1 text-sm text-red-600">{errors.brand.message}</p>
              )}
            </div>
            
            {/* Model */}
            <div>
              <label htmlFor="model" className="block text-sm font-medium text-gray-700 mb-1">
                Model *
              </label>
              <input
                id="model"
                type="text"
                className={`w-full px-3 py-2 border rounded-md ${errors.model ? 'border-red-500' : 'border-gray-300'}`}
                {...register('model')}
              />
              {errors.model && (
                <p className="mt-1 text-sm text-red-600">{errors.model.message}</p>
              )}
            </div>
            
            {/* Year */}
            <div>
              <label htmlFor="year" className="block text-sm font-medium text-gray-700 mb-1">
                Year *
              </label>
              <input
                id="year"
                type="number"
                className={`w-full px-3 py-2 border rounded-md ${errors.year ? 'border-red-500' : 'border-gray-300'}`}
                {...register('year')}
              />
              {errors.year && (
                <p className="mt-1 text-sm text-red-600">{errors.year.message}</p>
              )}
            </div>
            
            {/* Price per day */}
            <div>
              <label htmlFor="price_per_day" className="block text-sm font-medium text-gray-700 mb-1">
                Price per Day ($) *
              </label>
              <input
                id="price_per_day"
                type="number"
                step="0.01"
                className={`w-full px-3 py-2 border rounded-md ${errors.price_per_day ? 'border-red-500' : 'border-gray-300'}`}
                {...register('price_per_day')}
              />
              {errors.price_per_day && (
                <p className="mt-1 text-sm text-red-600">{errors.price_per_day.message}</p>
              )}
            </div>
            
            {/* Color */}
            <div>
              <label htmlFor="color" className="block text-sm font-medium text-gray-700 mb-1">
                Color
              </label>
              <input
                id="color"
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                {...register('color')}
              />
            </div>
            
            {/* License Plate */}
            <div>
              <label htmlFor="license_plate" className="block text-sm font-medium text-gray-700 mb-1">
                License Plate
              </label>
              <input
                id="license_plate"
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                {...register('license_plate')}
              />
            </div>
            
            {/* Mileage */}
            <div>
              <label htmlFor="mileage" className="block text-sm font-medium text-gray-700 mb-1">
                Mileage (km)
              </label>
              <input
                id="mileage"
                type="number"
                className={`w-full px-3 py-2 border rounded-md ${errors.mileage ? 'border-red-500' : 'border-gray-300'}`}
                {...register('mileage')}
              />
              {errors.mileage && (
                <p className="mt-1 text-sm text-red-600">{errors.mileage.message}</p>
              )}
            </div>
            
            {/* Availability Status */}
            <div>
              <label htmlFor="availability_status" className="block text-sm font-medium text-gray-700 mb-1">
                Availability Status
              </label>
              <select
                id="availability_status"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                {...register('availability_status')}
              >
                <option value="available">Available</option>
                <option value="maintenance">Maintenance</option>
                <option value="rented">Rented</option>
              </select>
            </div>
            
            {/* Technical Specifications */}
            <div className="col-span-1 md:col-span-2 mt-6">
              <h2 className="text-xl font-bold mb-4">Technical Specifications</h2>
            </div>
            
            {/* Fuel Type */}
            <div>
              <label htmlFor="fuel_type" className="block text-sm font-medium text-gray-700 mb-1">
                Fuel Type
              </label>
              <select
                id="fuel_type"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                {...register('fuel_type')}
              >
                <option value="">Select Fuel Type</option>
                <option value="gasoline">Gasoline</option>
                <option value="diesel">Diesel</option>
                <option value="electric">Electric</option>
                <option value="hybrid">Hybrid</option>
                <option value="plugin_hybrid">Plug-in Hybrid</option>
              </select>
            </div>
            
            {/* Transmission */}
            <div>
              <label htmlFor="transmission" className="block text-sm font-medium text-gray-700 mb-1">
                Transmission
              </label>
              <select
                id="transmission"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                {...register('transmission')}
              >
                <option value="">Select Transmission</option>
                <option value="manual">Manual</option>
                <option value="automatic">Automatic</option>
                <option value="semi_automatic">Semi-Automatic</option>
                <option value="cvt">CVT</option>
              </select>
            </div>
            
            {/* Seats */}
            <div>
              <label htmlFor="seats" className="block text-sm font-medium text-gray-700 mb-1">
                Seats
              </label>
              <input
                id="seats"
                type="number"
                min="1"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                {...register('seats')}
              />
            </div>
            
            {/* Maintenance Status */}
            <div>
              <label htmlFor="maintenance_status" className="block text-sm font-medium text-gray-700 mb-1">
                Maintenance Status
              </label>
              <select
                id="maintenance_status"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                {...register('maintenance_status')}
              >
                <option value="good">Good</option>
                <option value="needs_attention">Needs Attention</option>
                <option value="critical">Critical</option>
              </select>
            </div>
            
            {/* Description */}
            <div className="col-span-1 md:col-span-2 mt-6">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                id="description"
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                {...register('description')}
              ></textarea>
            </div>
            
            {/* Features */}
            <div className="col-span-1 md:col-span-2 mt-6">
              <h2 className="text-xl font-bold mb-4">Features</h2>
              <div className="mb-4">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Add a feature (e.g., GPS, Bluetooth)"
                    value={newFeature}
                    onChange={(e) => setNewFeature(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())}
                  />
                  <button
                    type="button"
                    onClick={addFeature}
                    className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    <Plus size={18} />
                  </button>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {featureFields.map((field, index) => (
                  <div key={field.id} className="bg-gray-100 px-3 py-1 rounded-full flex items-center gap-2">
                    <span>{field.value}</span>
                    <button
                      type="button"
                      onClick={() => removeFeature(index)}
                      className="text-gray-500 hover:text-red-500"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
                {featureFields.length === 0 && (
                  <p className="text-gray-500 text-sm">No features added yet.</p>
                )}
              </div>
            </div>
            
            {/* Images */}
            <div className="col-span-1 md:col-span-2 mt-6">
              <h2 className="text-xl font-bold mb-4">Images</h2>
              <div className="mb-4">
                <ImageUpload onImageUploaded={handleImageUploaded} />
                <p className="mt-2 text-sm text-gray-500">
                  Upload car images (JPG, PNG, GIF, WEBP). Maximum size: 5MB per image.
                </p>
              </div>
              
              <ImageGallery 
                images={images} 
                onImagesChange={setImages} 
                className="mt-4"
              />
            </div>
            
            {/* Insurance Information */}
            <div className="col-span-1 md:col-span-2 mt-6">
              <h2 className="text-xl font-bold mb-4">Insurance Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="insurance_provider" className="block text-sm font-medium text-gray-700 mb-1">
                    Provider
                  </label>
                  <input
                    id="insurance_provider"
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    {...register('insurance_info.provider')}
                  />
                </div>
                <div>
                  <label htmlFor="insurance_policy" className="block text-sm font-medium text-gray-700 mb-1">
                    Policy Number
                  </label>
                  <input
                    id="insurance_policy"
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    {...register('insurance_info.policy_number')}
                  />
                </div>
                <div>
                  <label htmlFor="insurance_expiry" className="block text-sm font-medium text-gray-700 mb-1">
                    Expiry Date
                  </label>
                  <input
                    id="insurance_expiry"
                    type="date"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    {...register('insurance_info.expiry_date')}
                  />
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end gap-4 mt-8">
            <Link 
              href={`/dashboard/cars/${params.id}`} 
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {isSubmitting ? 'Updating...' : 'Update Car'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 