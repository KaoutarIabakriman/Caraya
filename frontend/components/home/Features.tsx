'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Shield, Clock, Award, Headphones, CreditCard, MapPin } from 'lucide-react';

type Feature = {
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
};

export default function Features() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );
    
    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }
    
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  const features: Feature[] = [
    {
      icon: <Shield className="w-10 h-10 text-gold" />,
      title: "Premium Insurance",
      description: "Comprehensive coverage for peace of mind during your journey",
      color: "from-amber-500/20 to-amber-600/5"
    },
    {
      icon: <Clock className="w-10 h-10 text-gold" />,
      title: "24/7 Availability",
      description: "Our services are available round the clock for your convenience",
      color: "from-blue-500/20 to-blue-600/5"
    },
    {
      icon: <Award className="w-10 h-10 text-gold" />,
      title: "Quality Guarantee",
      description: "All our vehicles are meticulously maintained to the highest standards",
      color: "from-purple-500/20 to-purple-600/5"
    },
    {
      icon: <Headphones className="w-10 h-10 text-gold" />,
      title: "Dedicated Support",
      description: "Our concierge team is always ready to assist with any requests",
      color: "from-green-500/20 to-green-600/5"
    },
    {
      icon: <CreditCard className="w-10 h-10 text-gold" />,
      title: "Flexible Payment",
      description: "Multiple secure payment options to suit your preferences",
      color: "from-red-500/20 to-red-600/5"
    },
    {
      icon: <MapPin className="w-10 h-10 text-gold" />,
      title: "Convenient Locations",
      description: "Pick up and drop off your vehicle at multiple premium locations",
      color: "from-teal-500/20 to-teal-600/5"
    }
  ];

  return (
    <section 
      id="features"
      className="py-24 relative overflow-hidden bg-gradient-to-b from-gray-900 to-black" 
      ref={sectionRef}
    >
      {/* Dynamic light source following cursor */}
      <div 
        className="absolute w-[800px] h-[800px] rounded-full bg-gradient-radial from-gold/5 via-gold/0 to-transparent blur-3xl pointer-events-none"
        style={{
          left: `${mousePosition.x - 400}px`,
          top: `${mousePosition.y - 400}px`,
          opacity: isVisible ? 0.6 : 0,
          transition: 'opacity 1s ease-out',
        }}
      ></div>
      
      {/* Background elements */}
      <div className="absolute inset-0 z-0">
        {/* 3D grid effect */}
        <div className="absolute inset-0 perspective-1000">
          <div className="absolute inset-0 grid grid-cols-8 grid-rows-8">
            {Array.from({ length: 64 }).map((_, i) => (
              <div 
                key={i}
                className="border-[0.5px] border-white/5"
                style={{
                  transform: `translateZ(${Math.random() * -300}px)`,
                  opacity: 0.1 + Math.random() * 0.2
                }}
              />
            ))}
          </div>
        </div>
        
        {/* Dynamic light spots */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-gradient-radial from-blue-500/10 via-blue-500/5 to-transparent blur-3xl animate-pulse-slow"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-gradient-radial from-purple-500/10 via-purple-500/5 to-transparent blur-3xl animate-pulse-slow delay-1000"></div>
          <div className="absolute top-3/4 right-1/3 w-64 h-64 rounded-full bg-gradient-radial from-gold/10 via-gold/5 to-transparent blur-3xl animate-pulse-slow delay-2000"></div>
        </div>
        
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-radial from-transparent to-black/90"></div>
        
        {/* Animated particles */}
        <div className="absolute inset-0 overflow-hidden">
          {Array.from({ length: 30 }).map((_, i) => (
            <div 
              key={i} 
              className="absolute rounded-full"
              style={{
                width: 2 + Math.random() * 6 + 'px',
                height: 2 + Math.random() * 6 + 'px',
                top: Math.random() * 100 + '%',
                left: Math.random() * 100 + '%',
                background: `rgba(${212 + Math.random() * 43}, ${175 + Math.random() * 80}, ${55 + Math.random() * 200}, ${0.2 + Math.random() * 0.3})`,
                boxShadow: '0 0 10px 2px rgba(212, 175, 55, 0.3)',
                animation: `float-${i % 3} ${10 + Math.random() * 20}s infinite linear`
              }}
            />
          ))}
        </div>
        
        {/* 3D floating spheres */}
        <div className="absolute -left-20 top-20 w-40 h-40 rounded-full bg-gradient-to-br from-gold/20 to-gold/5 blur-xl animate-float-slow"></div>
        <div className="absolute -right-32 bottom-40 w-64 h-64 rounded-full bg-gradient-to-br from-blue-500/10 to-blue-500/5 blur-xl animate-float-slow-reverse"></div>
        <div className="absolute left-1/2 top-1/4 transform -translate-x-1/2 w-96 h-96 rounded-full border border-gold/10 opacity-20 animate-spin-very-slow"></div>
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 30 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6 relative inline-block">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-300">Why Choose </span>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-gold to-amber-400">Our Service</span>
            
            {/* Decorative underline */}
            <div className="absolute -bottom-3 left-0 w-full h-[3px]">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gold to-transparent"></div>
              <div className="absolute inset-0 bg-gold/50 blur-sm"></div>
            </div>
          </h2>
          
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: isVisible ? 1 : 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-gray-400 max-w-2xl mx-auto mt-6 text-lg"
          >
            We offer a premium car rental experience with exceptional service and attention to detail
          </motion.p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {features.map((feature, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, y: 50 }}
              animate={isVisible ? { 
                opacity: 1, 
                y: 0
              } : {}}
              transition={{ 
                duration: 0.8, 
                delay: 0.2 + index * 0.1,
                type: "spring",
                stiffness: 100
              }}
              className="feature-card perspective-card"
            >
              {/* 3D Card with glass morphism */}
              <div className="card-3d-wrapper">
                <div className="card-front">
                  <div className="card-bg bg-gradient-to-br from-gray-800/80 via-gray-900/90 to-black/80 backdrop-blur-xl p-8 rounded-2xl border border-white/10 shadow-xl">
                    {/* Glowing background effect */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} rounded-2xl opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-500`}></div>
                    
                    {/* Animated icon container */}
                    <div className="relative mb-6 icon-3d-container">
                      {/* 3D layered icon effect */}
                      <div className="icon-shadow"></div>
                      <div className="icon-wrapper">
                        {feature.icon}
                      </div>
                    </div>
                    
                    <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                    <p className="text-gray-400">{feature.description}</p>
                    
                    {/* Decorative corner accent */}
                    <div className="corner-accent top-right"></div>
                    <div className="corner-accent bottom-left"></div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Custom styles for animations */}
      <style jsx global>{`
        .perspective-1000 {
          perspective: 1000px;
        }
        
        .transform-gpu {
          transform: translateZ(0);
          will-change: transform;
        }
        
        @keyframes float-0 {
          0%, 100% { transform: translateY(0) translateX(0); }
          25% { transform: translateY(-20px) translateX(10px); }
          50% { transform: translateY(-10px) translateX(20px); }
          75% { transform: translateY(-30px) translateX(-10px); }
        }
        
        @keyframes float-1 {
          0%, 100% { transform: translateY(0) translateX(0); }
          25% { transform: translateY(20px) translateX(-15px); }
          50% { transform: translateY(10px) translateX(-25px); }
          75% { transform: translateY(15px) translateX(10px); }
        }
        
        @keyframes float-2 {
          0%, 100% { transform: translateY(0) translateX(0); }
          25% { transform: translateY(-15px) translateX(-10px); }
          50% { transform: translateY(20px) translateX(15px); }
          75% { transform: translateY(-10px) translateX(20px); }
        }
        
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.05); }
        }
        
        .animate-pulse-slow {
          animation: pulse-slow 8s infinite ease-in-out;
        }
        
        .delay-1000 {
          animation-delay: 1s;
        }
        
        .delay-2000 {
          animation-delay: 2s;
        }
        
        .animate-float-slow {
          animation: float-0 15s infinite ease-in-out;
        }
        
        .animate-float-slow-reverse {
          animation: float-1 20s infinite ease-in-out reverse;
        }
        
        .animate-spin-very-slow {
          animation: spin 60s linear infinite;
        }
        
        @keyframes spin {
          from { transform: translate(-50%, 0) rotate(0deg); }
          to { transform: translate(-50%, 0) rotate(360deg); }
        }
        
        .bg-gradient-radial {
          background-image: radial-gradient(var(--tw-gradient-stops));
        }
        
        /* 3D Card Styles */
        .perspective-card {
          perspective: 1000px;
          height: 100%;
        }
        
        .card-3d-wrapper {
          position: relative;
          width: 100%;
          height: 100%;
          transform-style: preserve-3d;
          transition: transform 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        
        .perspective-card:hover .card-3d-wrapper {
          transform: rotateY(5deg) rotateX(5deg) translateZ(10px);
        }
        
        .card-front {
          position: relative;
          width: 100%;
          height: 100%;
          transform-style: preserve-3d;
          backface-visibility: hidden;
          border-radius: 1rem;
          overflow: hidden;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
        }
        
        .card-bg {
          position: relative;
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          transform-style: preserve-3d;
        }
        
        .card-bg:before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(120deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0) 100%);
          z-index: 1;
          transition: all 0.3s;
        }
        
        .perspective-card:hover .card-bg:before {
          opacity: 0.8;
        }
        
        /* Icon 3D effect */
        .icon-3d-container {
          position: relative;
          width: 80px;
          height: 80px;
          transform-style: preserve-3d;
          transition: transform 0.5s ease;
        }
        
        .perspective-card:hover .icon-3d-container {
          transform: translateZ(20px) rotateY(-10deg) rotateX(10deg);
        }
        
        .icon-shadow {
          position: absolute;
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(212,175,55,0.3) 0%, rgba(212,175,55,0) 70%);
          transform: translateZ(-10px) translateX(10px) translateY(10px);
          filter: blur(8px);
          opacity: 0;
          transition: opacity 0.5s ease;
        }
        
        .perspective-card:hover .icon-shadow {
          opacity: 1;
        }
        
        .icon-wrapper {
          position: relative;
          width: 70px;
          height: 70px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(145deg, #2a2a2a, #1a1a1a);
          border-radius: 50%;
          box-shadow: 8px 8px 16px rgba(0,0,0,0.2), 
                     -8px -8px 16px rgba(255,255,255,0.03);
          transform: translateZ(10px);
          border: 1px solid rgba(255,255,255,0.1);
        }
        
        /* Corner accents */
        .corner-accent {
          position: absolute;
          width: 50px;
          height: 50px;
          overflow: hidden;
        }
        
        .corner-accent.top-right {
          top: 0;
          right: 0;
        }
        
        .corner-accent.bottom-left {
          bottom: 0;
          left: 0;
        }
        
        .corner-accent:before, .corner-accent:after {
          content: '';
          position: absolute;
          background: linear-gradient(90deg, rgba(212,175,55,0) 0%, rgba(212,175,55,1) 100%);
          transition: all 0.5s ease;
        }
        
        .corner-accent.top-right:before {
          top: 0;
          right: 0;
          width: 0;
          height: 1px;
        }
        
        .corner-accent.top-right:after {
          top: 0;
          right: 0;
          width: 1px;
          height: 0;
        }
        
        .corner-accent.bottom-left:before {
          bottom: 0;
          left: 0;
          width: 0;
          height: 1px;
        }
        
        .corner-accent.bottom-left:after {
          bottom: 0;
          left: 0;
          width: 1px;
          height: 0;
        }
        
        .perspective-card:hover .corner-accent.top-right:before,
        .perspective-card:hover .corner-accent.bottom-left:before {
          width: 100%;
        }
        
        .perspective-card:hover .corner-accent.top-right:after,
        .perspective-card:hover .corner-accent.bottom-left:after {
          height: 100%;
        }
      `}</style>
    </section>
  );
} 