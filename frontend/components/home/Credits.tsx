'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, useAnimation, useMotionValue, useTransform } from 'framer-motion';
import { Code, Star, Sparkles, CircleUser, Hexagon, Gem, Award } from 'lucide-react';
import Image from 'next/image';

export default function Credits() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [scrollY, setScrollY] = useState(0);
  const sparklesControls = useAnimation();
  const gemControls = useAnimation();
  const awardControls = useAnimation();
  
  // For parallax effect
  const y = useMotionValue(0);
  const backgroundY = useTransform(y, [0, 1], [0, 0.5]);
  const rotate = useMotionValue(0);
  
  // Mouse movement for 3D effect
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left; // x position within the element
    const y = e.clientY - rect.top;  // y position within the element
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    // Calculate rotation based on mouse position
    const rotateX = ((y - centerY) / centerY) * 10; // Max 10 degrees
    const rotateY = ((centerX - x) / centerX) * 10; // Max 10 degrees
    
    setMousePosition({ x: rotateY, y: rotateX });
    rotate.set(rotateY / 2);
  };

  const handleMouseLeave = () => {
    setMousePosition({ x: 0, y: 0 });
    rotate.set(0);
  };

  // Floating animations
  useEffect(() => {
    sparklesControls.start({
      y: [0, -15, 0],
      x: [0, 5, 0],
      transition: { 
        duration: 4, 
        repeat: Infinity, 
        ease: "easeInOut" 
      }
    });
    
    gemControls.start({
      y: [0, -10, 0],
      rotate: [0, 10, 0],
      transition: { 
        duration: 5, 
        repeat: Infinity, 
        ease: "easeInOut" 
      }
    });
    
    awardControls.start({
      y: [0, -8, 0],
      x: [0, -5, 0],
      transition: { 
        duration: 4.5, 
        repeat: Infinity, 
        ease: "easeInOut",
        delay: 0.5
      }
    });
    
    // Scroll effect
    const handleScroll = () => {
      setScrollY(window.scrollY);
      y.set(window.scrollY * 0.1);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [sparklesControls, gemControls, awardControls, y]);

  return (
    <section className="py-24 relative overflow-hidden">
      {/* Dynamic Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-black via-gray-900 to-black">
        {/* Animated background grid */}
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `linear-gradient(to right, rgba(212,175,55,0.1) 1px, transparent 1px), 
                              linear-gradient(to bottom, rgba(212,175,55,0.1) 1px, transparent 1px)`,
            backgroundSize: '40px 40px',
            transform: `translateY(${scrollY * 0.1}px)`
          }}
        ></div>
        
        {/* Animated glow effects */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px] animate-pulse"></div>
        <div className="absolute bottom-1/3 right-1/3 w-64 h-64 bg-purple-500/10 rounded-full blur-[80px] animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 right-1/4 w-80 h-80 bg-gold/10 rounded-full blur-[90px] animate-pulse" style={{ animationDelay: '2s' }}></div>
        
        {/* Particle effect */}
        {Array.from({ length: 20 }).map((_, i) => (
          <div 
            key={i}
            className="absolute bg-white/30 rounded-full"
            style={{
              width: Math.random() * 3 + 1 + 'px',
              height: Math.random() * 3 + 1 + 'px',
              top: Math.random() * 100 + '%',
              left: Math.random() * 100 + '%',
              opacity: Math.random() * 0.5 + 0.3,
              animation: `float ${Math.random() * 10 + 10}s linear infinite`,
              animationDelay: `-${Math.random() * 10}s`,
              transform: `translateY(${scrollY * (Math.random() * 0.2)}px)`
            }}
          ></div>
        ))}
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <motion.div 
          ref={containerRef}
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          viewport={{ once: true, margin: "-100px" }}
          className="max-w-5xl mx-auto"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          style={{
            perspective: '1500px'
          }}
        >
          <motion.div 
            className="bg-gradient-to-br from-gray-900/80 via-gray-800/80 to-gray-900/80 backdrop-blur-lg rounded-2xl p-6 sm:p-10 border border-gray-700/50 shadow-[0_20px_80px_rgba(0,0,0,0.8)] relative overflow-hidden"
            style={{
              rotateX: mousePosition.y,
              rotateY: mousePosition.x,
              transformStyle: 'preserve-3d'
            }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
          >
            {/* Glass reflection effect */}
            <div 
              className="absolute inset-0 opacity-10 pointer-events-none"
              style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0) 50%, rgba(255,255,255,0) 100%)',
                transform: `rotate(${mousePosition.x * -2}deg)`
              }}
            ></div>
            
            {/* Floating 3D elements */}
            <motion.div 
              animate={sparklesControls}
              className="absolute top-6 right-10 hidden sm:block"
              style={{ transformStyle: 'preserve-3d', transform: 'translateZ(40px)' }}
            >
              <Sparkles size={28} className="text-gold" />
            </motion.div>
            
            <motion.div 
              animate={gemControls}
              className="absolute bottom-8 left-10 hidden sm:block"
              style={{ transformStyle: 'preserve-3d', transform: 'translateZ(30px)' }}
            >
              <Gem size={24} className="text-blue-400" />
            </motion.div>
            
            <motion.div 
              animate={awardControls}
              className="absolute top-1/2 right-8 hidden sm:block"
              style={{ transformStyle: 'preserve-3d', transform: 'translateZ(35px)' }}
            >
              <Award size={22} className="text-gold/60" />
            </motion.div>
            
            {/* Main content */}
            <div className="flex flex-col items-center text-center relative z-10" style={{ transform: 'translateZ(50px)' }}>
              {/* Logo/icon */}
              <motion.div 
                initial={{ scale: 0, rotate: -20 }}
                whileInView={{ scale: 1, rotate: 0 }}
                transition={{ 
                  type: "spring", 
                  stiffness: 260, 
                  damping: 20, 
                  delay: 0.2 
                }}
                viewport={{ once: true }}
                className="relative mb-8"
              >
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center shadow-xl border border-gray-700/50 relative transform rotate-45">
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-gold/20 to-blue-500/20 blur-md opacity-70"></div>
                  
                  <div className="absolute inset-0 rounded-xl overflow-hidden">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(120,119,198,0.3),rgba(255,255,255,0))]"></div>
                  </div>
                  
                  <Hexagon 
                    size={36} 
                    className="text-gold relative z-10 transform -rotate-45" 
                    strokeWidth={1.5}
                    fill="url(#gold-gradient)" 
                  />
                </div>
                
                {/* SVG gradient definition */}
                <svg width="0" height="0" className="absolute">
                  <defs>
                    <linearGradient id="gold-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#D4AF37" />
                      <stop offset="100%" stopColor="#F5D76E" />
                    </linearGradient>
                  </defs>
                </svg>
              </motion.div>
              
              {/* Title with animated gradient */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.3 }}
                viewport={{ once: true }}
                className="mb-2"
              >
                <h3 className="text-xl md:text-3xl font-bold relative inline-block">
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">Designed & Developed</span>
                </h3>
              </motion.div>
              
              {/* Names with 3D effect */}
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.5 }}
                viewport={{ once: true }}
                className="mb-8 relative"
              >
                <div className="absolute -inset-1 bg-gradient-to-r from-gold/20 via-blue-500/20 to-purple-500/20 rounded-lg blur-xl opacity-70"></div>
                <h2 className="text-2xl sm:text-3xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gold via-amber-400 to-gold relative">
                  Abdellah Raissouni & Kaoutar Iabakriman
                </h2>
              </motion.div>
              
              {/* Description with animated typing effect */}
              <motion.p 
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 1, delay: 0.7 }}
                viewport={{ once: true }}
                className="text-gray-300 max-w-2xl leading-relaxed text-sm sm:text-base"
              >
                A premium car rental experience meticulously crafted with Flask and MongoDB backend,
                paired with a React/Next.js frontend. Every API endpoint and database interaction has been
                thoughtfully designed to deliver an exceptional user journey.
              </motion.p>
              
              {/* Tech stack badges */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.9 }}
                viewport={{ once: true }}
                className="flex flex-wrap justify-center gap-3 mt-8"
              >
                {[
                  { name: 'Flask', icon: '/images/tech/flask.svg' },
                  { name: 'MongoDB', icon: '/images/tech/mongodb.svg' },
                  { name: 'React', icon: '/images/tech/react.svg' },
                  { name: 'Next.js', icon: '/images/tech/nextjs.svg' },
                  { name: 'TypeScript', icon: '/images/tech/typescript.svg' },
                  { name: 'Tailwind CSS', icon: '/images/tech/tailwind.svg' },
                  { name: 'Framer Motion', icon: '/images/tech/framer.svg' }
                ].map((tech, index) => (
                  <div 
                    key={tech.name} 
                    className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gray-800/50 backdrop-blur-sm rounded-full border border-gray-700/50 text-xs sm:text-sm font-medium text-gray-300 flex items-center"
                    style={{ 
                      transform: `translateZ(${30 + index * 5}px)`,
                      animationDelay: `${index * 0.1}s`
                    }}
                  >
                    <div className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2 relative">
                      <Image 
                        src={tech.icon} 
                        alt={`${tech.name} logo`} 
                        width={16} 
                        height={16} 
                        className="object-contain"
                      />
                    </div>
                    {tech.name}
                  </div>
                ))}
              </motion.div>
            </div>
            
            {/* Dynamic lighting effect */}
            <div 
              className="absolute inset-0 rounded-2xl opacity-40 pointer-events-none"
              style={{
                background: `radial-gradient(circle at ${mousePosition.x < 0 ? 40 : 60}% ${mousePosition.y < 0 ? 40 : 60}%, rgba(212,175,55,0.15), transparent 60%), 
                            radial-gradient(circle at ${mousePosition.x > 0 ? 30 : 70}% ${mousePosition.y > 0 ? 30 : 70}%, rgba(59,130,246,0.1), transparent 50%)`
              }}
            ></div>
            
            {/* Border glow effects */}
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-gold/30 to-transparent"></div>
            <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-blue-500/30 to-transparent"></div>
            <div className="absolute top-0 left-0 h-full w-[1px] bg-gradient-to-b from-transparent via-gold/20 to-transparent"></div>
            <div className="absolute top-0 right-0 h-full w-[1px] bg-gradient-to-b from-transparent via-blue-500/20 to-transparent"></div>
          </motion.div>
        </motion.div>
      </div>
      
      {/* CSS for particle animation */}
      <style jsx global>{`
        @keyframes float {
          0% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-100px);
          }
          100% {
            transform: translateY(-200vh);
            opacity: 0;
          }
        }
      `}</style>
    </section>
  );
} 