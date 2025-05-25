'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';

export default function CallToAction() {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <section className="py-24 bg-black relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-tr from-black via-black to-gray-900"></div>
      
      {/* Background shapes */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
        <div className="absolute top-1/4 -left-64 w-96 h-96 rounded-full bg-gold/5 blur-3xl"></div>
        <div className="absolute bottom-1/4 -right-64 w-96 h-96 rounded-full bg-blue-900/10 blur-3xl"></div>
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-6xl mx-auto bg-gradient-to-b from-gray-900 to-black rounded-2xl p-8 md:p-12 border border-gray-800 overflow-hidden relative">
          {/* Decorative line */}
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-gold/50 to-transparent"></div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
                Ready to Experience <span className="text-gold">Luxury</span> on the Road?
              </h2>
              
              <p className="text-gray-300 text-lg mb-8">
                Join our exclusive clientele and discover the perfect blend of performance, comfort, and style. Our premium fleet awaits your command.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Link 
                  href="/cars" 
                  className={`
                    relative inline-flex items-center justify-center overflow-hidden rounded-lg bg-black px-8 py-4 font-medium text-white transition-all duration-300 ease-in-out
                    ${isHovered ? 'shadow-[0_0_25px_rgba(212,175,55,0.3)]' : ''}
                  `}
                  onMouseEnter={() => setIsHovered(true)}
                  onMouseLeave={() => setIsHovered(false)}
                >
                  <span className="relative z-10 flex items-center">
                    Browse Our Collection
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </span>
                  <span className={`absolute inset-0 overflow-hidden rounded-lg transition-all duration-500 ease-in-out ${isHovered ? 'bg-gradient-to-r from-gold/80 via-gold to-gold/80' : 'bg-gradient-to-r from-gold/0 via-gold/0 to-gold/0'}`}></span>
                  <span className="absolute inset-0 rounded-lg border border-gold"></span>
                </Link>
                
                <Link 
                  href="/contact" 
                  className="inline-flex items-center justify-center rounded-lg bg-white/5 backdrop-blur-sm border border-white/10 px-8 py-4 font-medium text-white hover:bg-white/10 transition-colors duration-300"
                >
                  Contact Us
                </Link>
              </div>
            </div>
            
            <div className="relative h-64 lg:h-auto">
              <div className="absolute -top-6 -right-6 w-32 h-32 bg-gold/10 rounded-full blur-2xl"></div>
              <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-blue-900/10 rounded-full blur-2xl"></div>
              
              <div 
                className="relative z-10 h-full w-full rounded-xl overflow-hidden transform transition-transform duration-700 hover:scale-105"
                style={{
                  animation: 'float 6s ease-in-out infinite'
                }}
              >
                <Image 
                  src="/images/cta-car.jpg" 
                  alt="Luxury car" 
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                
                <div className="absolute bottom-0 left-0 w-full p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-bold text-xl">Premium Experience</p>
                      <p className="text-gray-300 text-sm">Starting from $199/day</p>
                    </div>
                    <div className="bg-gold/20 backdrop-blur-sm rounded-lg px-4 py-2 border border-gold/30">
                      <p className="text-gold font-medium">New Arrivals</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <style jsx global>{`
        @keyframes float {
          0% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
          100% {
            transform: translateY(0px);
          }
        }
      `}</style>
    </section>
  );
} 