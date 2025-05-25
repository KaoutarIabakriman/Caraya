'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Menu, X, ChevronDown, User, LogIn, Shield, Car, Facebook, Twitter, Instagram } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const pathname = usePathname();

  // Handle scroll event to change header style and detect active section
  useEffect(() => {
    const handleScroll = () => {
      // Update header style based on scroll position
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
      
      // Detect which section is in view
      const sections = ['home', 'features', 'featured', 'testimonials'];
      const currentSection = sections.find(section => {
        const element = document.getElementById(section);
        if (!element) return false;
        
        const rect = element.getBoundingClientRect();
        return rect.top <= 150 && rect.bottom >= 150;
      });
      
      if (currentSection) {
        setActiveSection(currentSection);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Navigation items with section IDs
  const navItems = [
    { name: 'Home', href: '/#home' },
    { name: 'Features', href: '/#features' },
    { name: 'Featured Cars', href: '/#featured' },
    { name: 'Testimonials', href: '/#testimonials' },
  ];

  // Function to handle smooth scroll to sections
  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    const sectionId = href.split('#')[1];
    const section = document.getElementById(sectionId);
    
    if (section) {
      window.scrollTo({
        top: section.offsetTop - 100,
        behavior: 'smooth'
      });
      
      setActiveSection(sectionId);
      
      // Close mobile menu if open
      if (isMenuOpen) {
        setIsMenuOpen(false);
      }
    }
  };

  // Function to determine if a section is active
  const isActive = (href: string) => {
    const sectionId = href.split('#')[1];
    return activeSection === sectionId;
  };

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled 
          ? 'bg-gradient-to-r from-gray-900/95 to-black/95 backdrop-blur-lg py-3 shadow-xl shadow-black/20 border-b border-white/5' 
          : 'bg-gradient-to-r from-gray-900/40 to-black/40 backdrop-blur-sm py-5'
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="relative z-50 group">
            <div className="flex items-center">
              <div className="relative w-10 h-10 mr-2 overflow-hidden">
                {/* Logo background with animated gradient */}
                <div className="absolute inset-0 bg-gradient-to-r from-gold via-amber-500 to-gold rounded-full group-hover:animate-spin-slow transition-all duration-700"></div>
                
                {/* Inner circle */}
                <div className="absolute inset-[2px] bg-gray-900 rounded-full flex items-center justify-center">
                  {/* Car icon */}
                  <Car className="w-5 h-5 text-gold transform -rotate-45 group-hover:scale-110 group-hover:rotate-0 transition-all duration-500" />
                </div>
                
                {/* Outer glow */}
                <div className="absolute inset-0 bg-gold/30 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
              </div>
              
              {/* Logo text with animated underline */}
              <div className="font-bold text-xl font-serif relative">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-300">Car</span>
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-gold to-amber-400">aya</span>
                <div className="absolute -bottom-1 left-0 w-0 h-[2px] bg-gradient-to-r from-gold to-amber-400 group-hover:w-full transition-all duration-500"></div>
              </div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                onClick={(e) => scrollToSection(e, item.href)}
                className="text-sm font-medium transition-all duration-300 relative group"
              >
                <span className={`relative z-10 ${isActive(item.href) ? 'text-gold' : 'text-white group-hover:text-gold'}`}>
                  {item.name}
                </span>
                
                {/* Animated underline */}
                <span className={`absolute -bottom-1 left-0 h-0.5 bg-gradient-to-r from-gold to-amber-400 transition-all duration-300 ${
                  isActive(item.href) ? 'w-full' : 'w-0 group-hover:w-full'
                }`}></span>
                
                {/* Hover glow effect */}
                {isActive(item.href) && (
                  <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-gold blur-sm"></span>
                )}
              </Link>
            ))}
          </nav>

          {/* Auth Buttons */}
          <div className="hidden lg:flex items-center space-x-4">
            <Link 
              href="http://localhost:3000/login" 
              className="group relative overflow-hidden flex items-center text-sm font-medium text-white hover:text-gold transition-colors duration-300 bg-white/5 backdrop-blur-sm border border-white/10 rounded-md px-4 py-2"
            >
              {/* Button background animation */}
              <span className="absolute inset-0 w-0 bg-white/10 group-hover:w-full transition-all duration-500"></span>
              <User className="w-4 h-4 mr-2 relative z-10" />
              <span className="relative z-10">Manager Login</span>
            </Link>
            
            <Link 
              href="http://localhost:3000/admin/login" 
              className="group relative overflow-hidden bg-gradient-to-r from-gold to-amber-500 text-black rounded-md px-4 py-2 text-sm font-medium transition-all duration-300 flex items-center shadow-lg shadow-gold/20"
            >
              {/* Button hover animation */}
              <span className="absolute inset-0 w-0 bg-black/10 group-hover:w-full transition-all duration-500"></span>
              <Shield className="w-4 h-4 mr-2 relative z-10" />
              <span className="relative z-10">Admin Portal</span>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden flex items-center space-x-4">
            <Link 
              href="http://localhost:3000/login" 
              className="flex items-center text-sm font-medium text-white hover:text-gold transition-colors duration-300"
            >
              <User className="w-5 h-5" />
            </Link>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="relative z-50 p-2 text-white hover:text-gold transition-colors"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div 
        className={`fixed inset-0 bg-gradient-to-b from-gray-900/98 to-black/98 backdrop-blur-lg z-40 transition-transform duration-500 ease-in-out transform ${
          isMenuOpen ? 'translate-x-0' : 'translate-x-full'
        } lg:hidden flex flex-col`}
      >
        <div className="container mx-auto px-4 py-20 h-full flex flex-col">
          <nav className="flex flex-col space-y-6 mt-8">
            {navItems.map((item, index) => (
              <motion.div
                key={item.name}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: isMenuOpen ? 1 : 0, x: isMenuOpen ? 0 : 50 }}
                transition={{ duration: 0.3, delay: isMenuOpen ? index * 0.1 : 0 }}
              >
                <Link
                  href={item.href}
                  onClick={(e) => scrollToSection(e, item.href)}
                  className={`text-lg font-medium transition-colors duration-300 flex items-center ${
                    isActive(item.href) 
                      ? 'text-gold' 
                      : 'text-white hover:text-gold'
                  }`}
                >
                  {isActive(item.href) && (
                    <span className="w-1 h-6 bg-gold mr-3 rounded-full"></span>
                  )}
                  <span className="relative">
                    {item.name}
                    {isActive(item.href) && (
                      <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-gold"></span>
                    )}
                  </span>
                </Link>
              </motion.div>
            ))}
          </nav>

          <div className="mt-auto mb-12 flex flex-col space-y-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: isMenuOpen ? 1 : 0, y: isMenuOpen ? 0 : 20 }}
              transition={{ duration: 0.3, delay: isMenuOpen ? 0.5 : 0 }}
            >
              <Link 
                href="http://localhost:3000/login" 
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center justify-center text-white hover:text-gold transition-colors duration-300 py-3 border border-white/10 rounded-md bg-white/5 backdrop-blur-sm"
              >
                <User className="w-5 h-5 mr-2" />
                Manager Login
              </Link>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: isMenuOpen ? 1 : 0, y: isMenuOpen ? 0 : 20 }}
              transition={{ duration: 0.3, delay: isMenuOpen ? 0.6 : 0 }}
            >
              <Link 
                href="http://localhost:3000/admin/login" 
                onClick={() => setIsMenuOpen(false)}
                className="bg-gradient-to-r from-gold to-amber-500 hover:from-amber-500 hover:to-gold text-black rounded-md py-3 text-center font-medium transition-all duration-500 flex items-center justify-center shadow-lg shadow-gold/20"
              >
                <Shield className="w-5 h-5 mr-2" />
                Admin Portal
              </Link>
            </motion.div>
          </div>
          
          {/* Social links for mobile */}
          <motion.div 
            className="flex justify-center space-x-4 mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: isMenuOpen ? 1 : 0 }}
            transition={{ duration: 0.3, delay: isMenuOpen ? 0.7 : 0 }}
          >
            {['Facebook', 'Twitter', 'Instagram', 'LinkedIn'].map((social, index) => (
              <a 
                key={social} 
                href="#" 
                className="w-10 h-10 rounded-full bg-white/5 hover:bg-gold/20 border border-white/10 flex items-center justify-center transition-colors duration-300"
                aria-label={social}
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: isMenuOpen ? 1 : 0 }}
                  transition={{ duration: 0.3, delay: isMenuOpen ? 0.7 + (index * 0.1) : 0 }}
                >
                  {social === 'Facebook' && <Facebook size={18} className="text-white hover:text-gold" />}
                  {social === 'Twitter' && <Twitter size={18} className="text-white hover:text-gold" />}
                  {social === 'Instagram' && <Instagram size={18} className="text-white hover:text-gold" />}
                  {social === 'LinkedIn' && <LogIn size={18} className="text-white hover:text-gold" />}
                </motion.div>
              </a>
            ))}
          </motion.div>
        </div>
      </div>
      
      {/* Custom styles */}
      <style jsx global>{`
        @keyframes spin-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        .animate-spin-slow {
          animation: spin-slow 8s linear infinite;
        }
      `}</style>
    </header>
  );
} 