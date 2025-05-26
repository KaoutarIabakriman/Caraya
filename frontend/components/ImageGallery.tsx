'use client';

import { useState } from 'react';
import Image from 'next/image';
import axios from 'axios';
import { useAuth } from '@/lib/auth-provider';
import { X, Car as CarIcon, Loader2 } from 'lucide-react';

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
        <div key={index} className="relative h-40 bg-gray-800/50 rounded-md overflow-hidden border border-white/10">
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
                className="absolute top-2 right-2 p-1.5 bg-black/70 backdrop-blur-sm rounded-full text-red-400 hover:text-red-300 hover:bg-black/80 transition-colors disabled:opacity-50"
              >
                {deletingIndex === index ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <X size={16} />
                )}
              </button>
            </div>
          ) : (
            <div className="h-full w-full flex items-center justify-center">
              <CarIcon className="text-gray-600" size={24} />
            </div>
          )}
        </div>
      ))}
      
      {images.length === 0 && (
        <div className="col-span-2 md:col-span-4 text-center py-10 bg-gray-800/50 rounded-md border border-white/10">
          <CarIcon className="mx-auto h-12 w-12 text-gray-600" />
          <p className="mt-2 text-gray-400">No images added yet.</p>
        </div>
      )}
    </div>
  );
} 