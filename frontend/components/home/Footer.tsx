'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin, ChevronRight, Send } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-black text-white relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-gold/30 to-transparent"></div>
      <div className="absolute top-0 left-1/4 w-64 h-64 bg-blue-900/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-gold/5 rounded-full blur-3xl"></div>
      
      {/* Animated particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {Array.from({ length: 8 }).map((_, i) => (
          <div 
            key={i}
            className="absolute bg-white/20 rounded-full"
            style={{
              width: Math.random() * 4 + 1 + 'px',
              height: Math.random() * 4 + 1 + 'px',
              top: Math.random() * 100 + '%',
              left: Math.random() * 100 + '%',
              opacity: Math.random() * 0.5 + 0.3,
              animation: `footerFloat ${Math.random() * 10 + 15}s linear infinite`,
              animationDelay: `-${Math.random() * 10}s`,
            }}
          ></div>
        ))}
      </div>
      
      <div className="container mx-auto px-4 py-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <Link href="/" className="flex items-center mb-6 group">
              <div className="relative w-10 h-10 mr-2 overflow-hidden">
                {/* Logo background with animated gradient */}
                <div className="absolute inset-0 bg-gradient-to-r from-gold via-amber-500 to-gold rounded-full group-hover:animate-spin-slow transition-all duration-700"></div>
                
                {/* Inner circle */}
                <div className="absolute inset-[2px] bg-gray-900 rounded-full flex items-center justify-center">
                  {/* Car icon */}
                  <div className="w-5 h-5 text-gold transform -rotate-45 group-hover:scale-110 group-hover:rotate-0 transition-all duration-500">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2" />
                      <circle cx="7" cy="17" r="2" />
                      <circle cx="17" cy="17" r="2" />
                    </svg>
                  </div>
                </div>
              </div>
              <span className="font-bold text-xl font-serif relative">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-300">Car</span>
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-gold to-amber-400">aya</span>
                <div className="absolute -bottom-1 left-0 w-0 h-[2px] bg-gradient-to-r from-gold to-amber-400 group-hover:w-full transition-all duration-500"></div>
              </span>
            </Link>
            <p className="text-gray-400 mb-6">
              Experience luxury and performance with our premium car rental service. We offer a wide range of high-end vehicles for any occasion.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="w-9 h-9 rounded-full bg-white/5 hover:bg-gold/20 border border-white/10 flex items-center justify-center transition-colors duration-300 group">
                <Facebook size={18} className="text-white group-hover:text-gold transition-colors" />
              </a>
              <a href="#" className="w-9 h-9 rounded-full bg-white/5 hover:bg-gold/20 border border-white/10 flex items-center justify-center transition-colors duration-300 group">
                <Twitter size={18} className="text-white group-hover:text-gold transition-colors" />
              </a>
              <a href="#" className="w-9 h-9 rounded-full bg-white/5 hover:bg-gold/20 border border-white/10 flex items-center justify-center transition-colors duration-300 group">
                <Instagram size={18} className="text-white group-hover:text-gold transition-colors" />
              </a>
              <a href="#" className="w-9 h-9 rounded-full bg-white/5 hover:bg-gold/20 border border-white/10 flex items-center justify-center transition-colors duration-300 group">
                <Linkedin size={18} className="text-white group-hover:text-gold transition-colors" />
              </a>
            </div>
          </motion.div>
          
          {/* Quick Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            viewport={{ once: true }}
          >
            <h3 className="text-lg font-bold mb-6 relative inline-block">
              Quick Links
              <span className="absolute -bottom-2 left-0 w-12 h-[2px] bg-gradient-to-r from-gold to-amber-500"></span>
            </h3>
            <ul className="space-y-3">
              {[
                { name: 'Home', href: '/' },
                { name: 'Our Fleet', href: '/cars' },
                { name: 'Services', href: '/services' },
                { name: 'About Us', href: '/about' },
                { name: 'Contact', href: '/contact' }
              ].map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-gray-400 hover:text-gold transition-colors duration-300 flex items-center group">
                    <ChevronRight size={16} className="mr-2 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 text-gold" />
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>
          
          {/* Services */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <h3 className="text-lg font-bold mb-6 relative inline-block">
              Our Services
              <span className="absolute -bottom-2 left-0 w-12 h-[2px] bg-gradient-to-r from-gold to-amber-500"></span>
            </h3>
            <ul className="space-y-3">
              {[
                { name: 'Luxury Car Rentals', href: '/services/luxury-rentals' },
                { name: 'Chauffeur Services', href: '/services/chauffeur' },
                { name: 'Airport Transfers', href: '/services/airport' },
                { name: 'Special Events', href: '/services/events' },
                { name: 'Corporate Services', href: '/services/corporate' }
              ].map((service) => (
                <li key={service.name}>
                  <Link href={service.href} className="text-gray-400 hover:text-gold transition-colors duration-300 flex items-center group">
                    <ChevronRight size={16} className="mr-2 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 text-gold" />
                    {service.name}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>
          
          {/* Contact */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            viewport={{ once: true }}
          >
            <h3 className="text-lg font-bold mb-6 relative inline-block">
              Contact Us
              <span className="absolute -bottom-2 left-0 w-12 h-[2px] bg-gradient-to-r from-gold to-amber-500"></span>
            </h3>
            <ul className="space-y-4">
              <li className="flex items-start group">
                <MapPin size={18} className="text-gold mt-1 mr-3 flex-shrink-0 group-hover:animate-pulse" />
                <span className="text-gray-400 group-hover:text-gray-300 transition-colors">
                  123 Luxury Avenue, Beverly Hills, CA 90210, USA
                </span>
              </li>
              <li className="flex items-center group">
                <Phone size={18} className="text-gold mr-3 flex-shrink-0 group-hover:animate-pulse" />
                <a href="tel:+11234567890" className="text-gray-400 hover:text-gold transition-colors duration-300">
                  +1 (123) 456-7890
                </a>
              </li>
              <li className="flex items-center group">
                <Mail size={18} className="text-gold mr-3 flex-shrink-0 group-hover:animate-pulse" />
                <a href="mailto:info@caraya.com" className="text-gray-400 hover:text-gold transition-colors duration-300">
                  info@caraya.com
                </a>
              </li>
            </ul>
            
            <div className="mt-6 bg-gradient-to-br from-white/5 to-transparent backdrop-blur-sm border border-white/10 rounded-lg p-4 shadow-xl">
              <p className="text-sm text-white mb-2">Subscribe to our newsletter</p>
              <form className="flex">
                <input 
                  type="email" 
                  placeholder="Your email" 
                  className="bg-black/50 border border-gray-700 rounded-l-md px-4 py-2 text-sm flex-grow focus:outline-none focus:border-gold transition-colors duration-300"
                />
                <button 
                  type="submit" 
                  className="bg-gradient-to-r from-gold to-amber-500 hover:from-amber-500 hover:to-gold text-black font-medium rounded-r-md px-4 py-2 text-sm transition-all duration-300 flex items-center"
                >
                  <Send size={14} className="mr-1" />
                  Join
                </button>
              </form>
            </div>
          </motion.div>
        </div>
        
        <div className="border-t border-gray-800/50 pt-8 mt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-500 text-sm mb-4 md:mb-0">
            &copy; {currentYear} Caraya. All rights reserved.
          </p>
          <div className="flex flex-wrap justify-center space-x-6">
            <Link href="/terms" className="text-gray-500 hover:text-gold text-sm transition-colors duration-300">
              Terms of Service
            </Link>
            <Link href="/privacy" className="text-gray-500 hover:text-gold text-sm transition-colors duration-300">
              Privacy Policy
            </Link>
            <Link href="/faq" className="text-gray-500 hover:text-gold text-sm transition-colors duration-300">
              FAQ
            </Link>
          </div>
        </div>
      </div>
      
      {/* CSS for footer particles */}
      <style jsx global>{`
        @keyframes footerFloat {
          0% {
            transform: translateY(0) translateX(0);
          }
          50% {
            transform: translateY(-50px) translateX(20px);
          }
          100% {
            transform: translateY(-100px) translateX(-10px);
            opacity: 0;
          }
        }
      `}</style>
    </footer>
  );
} 