'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Quote, Briefcase, Camera, Building2, Gift, MousePointer } from 'lucide-react';

type Testimonial = {
  id: number;
  name: string;
  role: string;
  icon: string;
  content: string;
  rating: number;
  carRented: string;
};

export default function Testimonials() {
  const testimonials: Testimonial[] = [
    {
      id: 1,
      name: 'Alexander Thompson',
      role: 'Business Executive',
      icon: 'Briefcase',
      content: 'The service was impeccable. The BMW 7 Series I rented was in pristine condition and made my business trip so much more comfortable. The staff was professional and the pickup/return process was seamless.',
      rating: 5,
      carRented: 'BMW 7 Series'
    },
    {
      id: 2,
      name: 'Sophia Rodriguez',
      role: 'Travel Blogger',
      icon: 'Camera',
      content: "As someone who travels frequently, I've used many car rental services, but this one stands out. The Mercedes G-Wagon was perfect for my coastal road trip. The online booking process was straightforward and the car was exactly as advertised.",
      rating: 5,
      carRented: 'Mercedes G-Wagon'
    },
    {
      id: 3,
      name: 'Michael Chen',
      role: 'Architect',
      icon: 'Building2',
      content: 'I needed a luxury vehicle for a client meeting and the Audi A8 was perfect. The attention to detail in the service provided was exceptional. Will definitely be using this service again for future needs.',
      rating: 4,
      carRented: 'Audi A8'
    },
    {
      id: 4,
      name: 'Emma Wilson',
      role: 'Wedding Planner',
      icon: 'Gift',
      content: "I rented a Rolls Royce Phantom for my client's wedding and it was the highlight of their day. The car was immaculate and the chauffeur was professional and punctual. Highly recommend for special occasions!",
      rating: 5,
      carRented: 'Rolls Royce Phantom'
    }
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const nextTestimonial = () => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    setCurrentIndex((prev) => (prev === testimonials.length - 1 ? 0 : prev + 1));
    
    setTimeout(() => {
      setIsAnimating(false);
    }, 500);
  };

  const prevTestimonial = () => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    setCurrentIndex((prev) => (prev === 0 ? testimonials.length - 1 : prev - 1));
    
    setTimeout(() => {
      setIsAnimating(false);
    }, 500);
  };

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      nextTestimonial();
    }, 8000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // Handle mouse movement for 3D effect
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    
    const x = e.clientX - rect.left; // x position within the element
    const y = e.clientY - rect.top;  // y position within the element
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const rotateX = (y - centerY) / 20;
    const rotateY = (centerX - x) / 20;
    
    setMousePosition({ x: rotateY, y: rotateX });
  };

  const handleMouseLeave = () => {
    setMousePosition({ x: 0, y: 0 });
  };

  // Function to render the appropriate icon
  const renderIcon = (iconName: string) => {
    switch (iconName) {
      case 'Briefcase':
        return <Briefcase size={32} className="text-gold" />;
      case 'Camera':
        return <Camera size={32} className="text-gold" />;
      case 'Building2':
        return <Building2 size={32} className="text-gold" />;
      case 'Gift':
        return <Gift size={32} className="text-gold" />;
      default:
        return <Briefcase size={32} className="text-gold" />;
    }
  };

  return (
    <section className="py-24 bg-gradient-to-b from-gray-900 to-black relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-gold/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-gold/5 rounded-full blur-3xl"></div>
      <div className="absolute top-1/4 right-1/4 w-32 h-32 bg-gold/5 rounded-full blur-xl"></div>
      <div className="absolute bottom-1/3 left-1/4 w-48 h-48 bg-gold/5 rounded-full blur-2xl"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-bold mb-4 relative inline-block">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-300">What Our </span>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-gold to-amber-400">Clients</span>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-300"> Say</span>
            
            {/* Decorative underline */}
            <div className="absolute -bottom-3 left-0 w-full h-[3px]">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gold to-transparent"></div>
              <div className="absolute inset-0 bg-gold/50 blur-sm"></div>
            </div>
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto mt-6 text-lg">
            Discover why our clients choose us for their premium car rental needs
          </p>
        </motion.div>

        <div className="max-w-5xl mx-auto relative">
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="absolute -left-8 top-1/2 -translate-y-1/2 z-20"
          >
            <button 
              onClick={prevTestimonial}
              className="w-12 h-12 rounded-full bg-black/50 border border-gray-700 flex items-center justify-center text-white hover:bg-gold/20 hover:border-gold/50 transition-all duration-300 hover:scale-110"
              disabled={isAnimating}
            >
              <ChevronLeft size={24} />
            </button>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="absolute -right-8 top-1/2 -translate-y-1/2 z-20"
          >
            <button 
              onClick={nextTestimonial}
              className="w-12 h-12 rounded-full bg-black/50 border border-gray-700 flex items-center justify-center text-white hover:bg-gold/20 hover:border-gold/50 transition-all duration-300 hover:scale-110"
              disabled={isAnimating}
            >
              <ChevronRight size={24} />
            </button>
          </motion.div>

          <div className="relative h-[450px] md:h-[350px] overflow-hidden">
            {testimonials.map((testimonial, index) => (
              <motion.div 
                key={testimonial.id}
                className={`absolute inset-0 transition-all duration-500 ${
                  index === currentIndex 
                    ? 'opacity-100 translate-x-0' 
                    : index < currentIndex || (currentIndex === 0 && index === testimonials.length - 1)
                      ? 'opacity-0 -translate-x-full' 
                      : 'opacity-0 translate-x-full'
                }`}
                style={{
                  perspective: '1500px'
                }}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
              >
                <motion.div 
                  className="bg-gradient-to-b from-gray-800/90 to-gray-900/90 backdrop-blur-sm rounded-2xl p-8 md:p-12 border border-gray-700 h-full flex flex-col md:flex-row items-center shadow-[0_10px_50px_rgba(0,0,0,0.8)]"
                  style={{
                    rotateX: mousePosition.y,
                    rotateY: mousePosition.x,
                    transformStyle: 'preserve-3d'
                  }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                >
                  <div className="md:w-1/3 mb-6 md:mb-0 flex flex-col items-center relative" style={{ transform: 'translateZ(20px)' }}>
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center mb-6 shadow-lg border border-gold/30 relative">
                      {/* Glowing effect behind icon */}
                      <div className="absolute inset-0 rounded-full bg-gold/10 blur-md"></div>
                      
                      {/* 3D floating icon */}
                      <motion.div 
                        animate={{ 
                          y: [0, -5, 0],
                        }}
                        transition={{ 
                          repeat: Infinity, 
                          duration: 3,
                          ease: "easeInOut" 
                        }}
                        className="relative z-10"
                      >
                        {renderIcon(testimonial.icon)}
                      </motion.div>
                    </div>
                    
                    <h4 className="text-xl font-bold text-white">{testimonial.name}</h4>
                    <p className="text-gold text-sm">{testimonial.role}</p>
                    
                    <div className="flex items-center mt-3">
                      {[...Array(5)].map((_, i) => (
                        <motion.svg 
                          key={i} 
                          className={`w-4 h-4 mx-0.5 ${i < testimonial.rating ? 'text-gold' : 'text-gray-600'}`} 
                          fill="currentColor" 
                          viewBox="0 0 20 20"
                          initial={{ rotateY: 90, opacity: 0 }}
                          animate={{ rotateY: 0, opacity: 1 }}
                          transition={{ delay: i * 0.1, duration: 0.3 }}
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </motion.svg>
                      ))}
                    </div>
                    
                    <div className="mt-4 py-2 px-4 bg-black/30 rounded-full text-gold text-sm border border-gold/20">
                      Rented: {testimonial.carRented}
                    </div>
                  </div>
                  
                  <div className="md:w-2/3 md:pl-8 relative" style={{ transform: 'translateZ(30px)' }}>
                    <Quote 
                      size={48} 
                      className="absolute -top-4 -left-2 text-gold/20" 
                    />
                    <p className="text-gray-300 italic relative z-10 text-lg leading-relaxed">
                      "{testimonial.content}"
                    </p>
                    
                    {/* Decorative elements */}
                    <div className="absolute -bottom-4 -right-2 rotate-180">
                      <Quote 
                        size={32} 
                        className="text-gold/20" 
                      />
                    </div>
                  </div>
                  
                  {/* 3D lighting effect */}
                  <div 
                    className="absolute inset-0 rounded-2xl opacity-40 pointer-events-none"
                    style={{
                      background: `radial-gradient(circle at ${mousePosition.x < 0 ? 40 : 60}% ${mousePosition.y < 0 ? 40 : 60}%, rgba(212,175,55,0.15), transparent 60%)`,
                    }}
                  ></div>
                </motion.div>
              </motion.div>
            ))}
          </div>

          <div className="flex justify-center mt-8">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  if (isAnimating) return;
                  setIsAnimating(true);
                  setCurrentIndex(index);
                  setTimeout(() => {
                    setIsAnimating(false);
                  }, 500);
                }}
                className={`w-2.5 h-2.5 rounded-full mx-1.5 transition-all duration-300 ${
                  currentIndex === index ? 'bg-gold w-6' : 'bg-gray-600 hover:bg-gray-500'
                }`}
                aria-label={`Go to testimonial ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
} 