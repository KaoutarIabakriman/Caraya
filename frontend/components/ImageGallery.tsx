'use client';

import { useState } from 'react';
import Image from 'next/image';
import axios from 'axios';
import { useAuth } from '@/lib/auth-provider';
import { X, Car as CarIcon } from 'lucide-react';

interface ImageInfo {
  url: string;
  filename?: string;
}

interface ImageGalleryProps {
  images: ImageInfo[];
  onImagesChange: (images: ImageInfo[]) => void;
  className?: string;
}

export default function ImageGallery({ images, onImagesChange, className = '' }: ImageGalleryProps) {
  const { token } = useAuth();
  const [deletingIndex, setDeletingIndex] = useState<number | null>(null);

  const handleDeleteImage = async (index: number) => {
    const image = images[index];
    
    // If this is a newly uploaded image with a filename, delete it from the server
    if (image.filename && image.url.includes('/uploads/')) {
      try {
        setDeletingIndex(index);
        
        // Extract filename from URL if needed
        const filename = image.filename;
        
        await axios.delete(`http://localhost:5000/api/upload/image/${filename}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
      } catch (err) {
        console.error('Error deleting image:', err);
        // Continue with UI update even if server delete fails
      } finally {
        setDeletingIndex(null);
      }
    }
    
    // Update the images array
    const newImages = [...images];
    newImages.splice(index, 1);
    onImagesChange(newImages);
  };

  return (
    <div className={`grid grid-cols-2 md:grid-cols-4 gap-4 ${className}`}>
      {images.map((image, index) => (
        <div key={index} className="relative h-40 bg-gray-100 rounded-md overflow-hidden">
          {image.url ? (
            <div className="relative h-full w-full">
              <Image 
                src={image.url} 
                alt={`Car image ${index + 1}`}
                fill
                className="object-cover"
              />
              <button
                type="button"
                onClick={() => handleDeleteImage(index)}
                disabled={deletingIndex === index}
                className="absolute top-2 right-2 p-1 bg-white rounded-full text-red-500 hover:text-red-700 disabled:opacity-50"
              >
                {deletingIndex === index ? (
                  <div className="animate-spin h-4 w-4 border-2 border-red-500 border-t-transparent rounded-full"></div>
                ) : (
                  <X size={16} />
                )}
              </button>
            </div>
          ) : (
            <div className="h-full w-full flex items-center justify-center">
              <CarIcon className="text-gray-400" size={24} />
            </div>
          )}
        </div>
      ))}
      
      {images.length === 0 && (
        <div className="col-span-2 md:col-span-4 text-center py-10 bg-gray-50 rounded-md">
          <CarIcon className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-2 text-gray-500">No images added yet.</p>
        </div>
      )}
    </div>
  );
} 