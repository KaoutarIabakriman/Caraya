'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

type Category = {
  id: string;
  name: string;
  description: string;
  image: string;
  count: number;
};

export default function Categories() {
  const categories: Category[] = [
    {
      id: 'luxury',
      name: 'Luxury',
      description: 'Experience ultimate comfort and sophistication with our luxury collection',
      image: '/images/categories/luxury.jpg',
      count: 12
    },
    {
      id: 'sports',
      name: 'Sports',
      description: 'Feel the adrenaline with high-performance sports cars',
      image: '/images/categories/sports.jpg',
      count: 8
    },
    {
      id: 'suv',
      name: 'SUV',
      description: 'Perfect for adventures and family trips with spacious interiors',
      image: '/images/categories/suv.jpg',
      count: 15
    },
    {
      id: 'convertible',
      name: 'Convertible',
      description: 'Enjoy the open air and freedom with our stylish convertibles',
      image: '/images/categories/convertible.jpg',
      count: 6
    }
  ];

  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);

  return (
    <section className="py-24 bg-black">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Browse by <span className="text-gold">Category</span>
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Discover our diverse range of vehicles tailored to meet your specific needs and preferences
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((category, index) => (
            <Link 
              href={`/cars?category=${category.id}`}
              key={category.id}
              className="block"
              onMouseEnter={() => setHoveredCategory(category.id)}
              onMouseLeave={() => setHoveredCategory(null)}
            >
              <div 
                className="relative h-80 rounded-xl overflow-hidden group"
                style={{ 
                  animationDelay: `${index * 0.15}s`,
                  opacity: 0,
                  animation: 'fadeIn 0.8s ease-out forwards'
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent z-10"></div>
                
                <Image 
                  src={category.image} 
                  alt={category.name} 
                  fill
                  className={`object-cover transition-transform duration-700 ${hoveredCategory === category.id ? 'scale-110' : 'scale-100'}`}
                />
                
                <div className="absolute inset-0 z-20 flex flex-col justify-end p-6">
                  <div className={`w-12 h-12 rounded-full bg-gold/20 backdrop-blur-md flex items-center justify-center mb-4 transition-all duration-500 ${hoveredCategory === category.id ? 'scale-110' : 'scale-100'}`}>
                    <span className="text-gold font-bold">{category.count}</span>
                  </div>
                  
                  <h3 className="text-2xl font-bold text-white mb-2">
                    {category.name}
                  </h3>
                  
                  <p className={`text-gray-300 text-sm transition-all duration-500 ${hoveredCategory === category.id ? 'opacity-100 max-h-20' : 'opacity-70 max-h-10 overflow-hidden'}`}>
                    {category.description}
                  </p>
                  
                  <div className={`mt-4 overflow-hidden transition-all duration-500 ${hoveredCategory === category.id ? 'max-h-10 opacity-100' : 'max-h-0 opacity-0'}`}>
                    <span className="inline-flex items-center text-gold text-sm font-medium">
                      Browse collection
                      <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                      </svg>
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </section>
  );
} 