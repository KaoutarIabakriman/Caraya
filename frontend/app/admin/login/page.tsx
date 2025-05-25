'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Link from 'next/link';
import { useAdmin } from '@/lib/admin-provider';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { LogIn, Lock, Mail, ArrowLeft, Shield } from 'lucide-react';

// Form schema
const loginSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address' }),
  password: z.string().min(1, { message: 'Password is required' }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function AdminLoginPage() {
  const router = useRouter();
  const { login } = useAdmin();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    setError(null);
    
    try {
      await login(data.email, data.password);
      router.push('/admin/dashboard');
    } catch (err: any) {
      setError(err.message || 'Failed to login. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        when: "beforeChildren",
        staggerChildren: 0.1,
        duration: 0.6 
      } 
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5 } }
  };

  // Background animation
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: e.clientX,
        y: e.clientY
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-b from-gray-900 to-black text-white">
      {/* Background elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-gray-900/90 to-black/80 z-10"></div>
        <motion.div 
          className="absolute inset-0 z-5"
          style={{
            backgroundImage: 'url(/images/hero-bg.jpg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
          animate={{
            scale: [1, 1.05, 1],
            filter: ["brightness(0.8)", "brightness(0.9)", "brightness(0.8)"]
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            repeatType: "reverse"
          }}
        />
      </div>

      {/* Animated particles */}
      <div className="absolute inset-0 z-5 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-white/10"
            style={{
              width: Math.random() * 6 + 2,
              height: Math.random() * 6 + 2,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0, 0.5, 0],
            }}
            transition={{
              duration: Math.random() * 5 + 5,
              repeat: Infinity,
              delay: Math.random() * 5,
            }}
          />
        ))}
      </div>

      {/* Decorative elements that follow mouse */}
      <motion.div 
        className="absolute top-1/4 w-[500px] h-[500px] rounded-full bg-blue-600/10 blur-[120px] z-5"
        animate={{
          x: mousePosition.x * 0.02 - 250,
          y: mousePosition.y * 0.02 - 250,
        }}
        transition={{ type: "spring", damping: 50, stiffness: 50 }}
      />
      <motion.div 
        className="absolute bottom-1/4 w-[500px] h-[500px] rounded-full bg-gold/5 blur-[100px] z-5"
        animate={{
          x: -mousePosition.x * 0.01 + 250,
          y: -mousePosition.y * 0.01 + 250,
        }}
        transition={{ type: "spring", damping: 50, stiffness: 50 }}
      />

      {/* Animated rings */}
      <motion.div 
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full border border-white/5 z-5"
        animate={{ 
          rotate: 360,
          scale: [1, 1.05, 1]
        }}
        transition={{ 
          rotate: { duration: 40, repeat: Infinity, ease: "linear" },
          scale: { duration: 10, repeat: Infinity, repeatType: "reverse" }
        }}
      />
      <motion.div 
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full border border-white/5 z-5"
        animate={{ 
          rotate: -360,
          scale: [1, 1.1, 1]
        }}
        transition={{ 
          rotate: { duration: 30, repeat: Infinity, ease: "linear" },
          scale: { duration: 8, repeat: Infinity, repeatType: "reverse" }
        }}
      />

      <motion.div 
        className="max-w-md w-full z-10"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <div className="bg-gradient-to-r from-gray-900/90 to-gray-800/90 backdrop-blur-md rounded-xl p-8 border border-white/10 shadow-xl shadow-black/20">
          <motion.div variants={itemVariants} className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white font-serif mb-2">
              <span className="text-gold">Caraya</span> Rental
            </h1>
            <div className="flex items-center justify-center gap-2 mb-1">
              <Shield size={20} className="text-gold" />
              <h2 className="text-2xl font-bold text-white font-serif">Admin Login</h2>
            </div>
            <motion.div 
              className="h-1 w-16 bg-gradient-to-r from-gold to-gold/50 mx-auto mt-3"
              initial={{ width: 0 }}
              animate={{ width: 64 }}
              transition={{ delay: 0.5, duration: 0.8 }}
            ></motion.div>
          </motion.div>
          
          <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
            <motion.div variants={itemVariants} className="relative">
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1 pl-1">
                Email address
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                  <Mail size={18} />
                </span>
                <input
                  id="email"
                  type="email"
                  {...register('email')}
                  className="pl-10 w-full bg-gray-800/50 border border-white/10 rounded-lg py-3 px-4 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-transparent transition-all duration-300"
                  placeholder="Enter your email"
                />
              </div>
              {errors.email && (
                <p className="text-red-400 text-xs mt-1 pl-1">{errors.email.message}</p>
              )}
            </motion.div>
            
            <motion.div variants={itemVariants} className="relative">
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1 pl-1">
                Password
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                  <Lock size={18} />
                </span>
                <input
                  id="password"
                  type="password"
                  {...register('password')}
                  className="pl-10 w-full bg-gray-800/50 border border-white/10 rounded-lg py-3 px-4 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-transparent transition-all duration-300"
                  placeholder="Enter your password"
                />
              </div>
              {errors.password && (
                <p className="text-red-400 text-xs mt-1 pl-1">{errors.password.message}</p>
              )}
            </motion.div>

            {error && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-900/30 border border-red-500/30 text-red-300 px-4 py-3 rounded-lg text-sm"
              >
                {error}
              </motion.div>
            )}

            <motion.div variants={itemVariants}>
              <button
                type="submit"
                disabled={isLoading}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-black bg-gold hover:bg-gold/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gold disabled:opacity-50 transition-all duration-300 overflow-hidden"
              >
                <span className="absolute right-full group-hover:right-0 top-0 h-full w-full bg-white/20 transition-all duration-500 transform skew-x-12"></span>
                <span className="relative flex items-center">
                  {isLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Logging in...
                    </>
                  ) : (
                    <>
                      <LogIn size={18} className="mr-2" />
                      Sign in as Admin
                    </>
                  )}
                </span>
              </button>
            </motion.div>
          </form>

          <motion.div 
            variants={itemVariants}
            className="mt-6 text-center"
          >
            <Link 
              href="/" 
              className="inline-flex items-center text-sm text-gray-400 hover:text-gold transition-colors duration-300"
            >
              <ArrowLeft size={16} className="mr-1" />
              Return to home page
            </Link>
          </motion.div>

          <motion.div 
            variants={itemVariants}
            className="mt-6 p-4 bg-gray-800/50 border border-white/5 rounded-lg"
          >
            <p className="text-center text-sm text-gray-300 mb-2">Default admin credentials:</p>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="flex items-center justify-end text-gray-400">Email:</div>
              <div className="text-gold">admin@carental.com</div>
              <div className="flex items-center justify-end text-gray-400">Password:</div>
              <div className="text-gold">admin123</div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
} 