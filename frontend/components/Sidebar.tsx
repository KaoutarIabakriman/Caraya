import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth-provider';
import { Menu, X, Home, User, Car, Calendar, LogOut, FileText, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

interface SidebarProps {
  onCollapsedChange?: (collapsed: boolean) => void;
}

export default function Sidebar({ onCollapsedChange }: SidebarProps) {
  const pathname = usePathname();
  const { logout, user } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Notify parent component when collapsed state changes
  useEffect(() => {
    if (onCollapsedChange) {
      onCollapsedChange(isCollapsed);
    }
  }, [isCollapsed, onCollapsedChange]);

  const isActive = (path: string) => {
    // Handle exact match for dashboard home
    if (path === '/dashboard' && pathname === '/dashboard') {
      return true;
    }
    // Handle nested routes
    if (path !== '/dashboard' && pathname?.startsWith(path)) {
      return true;
    }
    return false;
  };

  const links = [
    { href: '/dashboard', label: 'Dashboard', icon: Home },
    { href: '/dashboard/cars', label: 'Cars', icon: Car },
    { href: '/dashboard/clients', label: 'Clients', icon: User },
    { href: '/dashboard/reservations', label: 'Reservations', icon: Calendar },
    { href: '/dashboard/reports', label: 'Reports', icon: FileText },
  ];

  return (
    <>
      {/* Mobile menu button */}
      <div className="md:hidden flex items-center p-4 bg-gradient-to-r from-gray-900 to-gray-800 text-white border-b border-white/10">
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="text-gray-300 hover:text-white focus:outline-none"
        >
          {isMobileMenuOpen ? (
            <X size={24} />
          ) : (
            <Menu size={24} />
          )}
        </button>
        <span className="ml-2 text-lg font-bold font-serif">
          <span className="text-gold">Caraya</span> Rental
        </span>
      </div>

      {/* Sidebar for desktop */}
      <div 
        className={`hidden md:flex md:flex-col md:fixed md:inset-y-0 bg-gradient-to-b from-gray-900 to-gray-800 border-r border-white/10 transition-all duration-300 ${
          isCollapsed ? 'md:w-20' : 'md:w-64'
        }`}
      >
        <div className="flex flex-col flex-grow pt-5 pb-4 overflow-y-auto">
          <div className={`flex items-center flex-shrink-0 px-4 ${isCollapsed ? 'justify-center' : ''}`}>
            {isCollapsed ? (
              <span className="text-xl font-bold font-serif text-gold">C</span>
            ) : (
              <span className="text-xl font-bold font-serif text-white">
                <span className="text-gold">Caraya</span> Rental
              </span>
            )}
          </div>
          
          {/* Manager profile summary - only show when expanded */}
          {!isCollapsed && (
            <div className="mt-6 px-4">
              <div className="flex items-center p-3 bg-gray-800/50 rounded-lg border border-white/10">
                <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-gold">
                  <User size={20} />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-white">{user?.name || 'Manager'}</p>
                  <p className="text-xs text-gray-400">{user?.email || 'manager@caraya.com'}</p>
                </div>
              </div>
            </div>
          )}
          
          <div className="mt-8 flex-grow flex flex-col">
            <nav className="flex-1 px-2 space-y-1">
              {links.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`group flex items-center ${isCollapsed ? 'justify-center' : ''} px-3 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                      isActive(link.href)
                        ? 'bg-gold text-black'
                        : 'text-gray-300 hover:bg-gray-800/50 hover:text-white'
                    }`}
                  >
                    <Icon
                      className={`${isCollapsed ? '' : 'mr-3'} flex-shrink-0 h-5 w-5 ${
                        isActive(link.href) ? 'text-black' : 'text-gray-400 group-hover:text-gray-300'
                      }`}
                    />
                    {!isCollapsed && link.label}
                  </Link>
                );
              })}
            </nav>
          </div>
          <div className={`p-4 border-t border-white/10 ${isCollapsed ? 'flex justify-center' : ''}`}>
            {isCollapsed ? (
              <button
                onClick={logout}
                className="flex items-center justify-center w-10 h-10 text-gray-300 rounded-md hover:bg-gray-800/50 hover:text-white transition-colors"
                title="Sign Out"
              >
                <LogOut className="h-5 w-5 text-gray-400" />
              </button>
            ) : (
              <button
                onClick={logout}
                className="w-full flex items-center px-3 py-2 text-sm font-medium text-gray-300 rounded-md hover:bg-gray-800/50 hover:text-white transition-colors"
              >
                <LogOut className="mr-3 flex-shrink-0 h-5 w-5 text-gray-400" />
                Sign Out
              </button>
            )}
          </div>
        </div>
        
        {/* Collapse toggle button */}
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute right-0 top-1/2 transform translate-x-1/2 -translate-y-1/2 bg-gray-800 border border-white/10 rounded-full p-1.5 text-gray-300 hover:text-white focus:outline-none"
        >
          {isCollapsed ? (
            <ChevronRight size={16} />
          ) : (
            <ChevronLeft size={16} />
          )}
        </button>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40 flex">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setIsMobileMenuOpen(false)}
          ></motion.div>
          <motion.div 
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative flex-1 flex flex-col max-w-xs w-full bg-gradient-to-b from-gray-900 to-gray-800 border-r border-white/10"
          >
            <div className="absolute top-0 right-0 -mr-12 pt-2">
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              >
                <span className="sr-only">Close sidebar</span>
                <X className="h-6 w-6 text-white" />
              </button>
            </div>
            <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
              <div className="flex-shrink-0 flex items-center px-4">
                <span className="text-xl font-bold font-serif text-white">
                  <span className="text-gold">Caraya</span> Rental
                </span>
              </div>
              
              {/* Manager profile summary (mobile) */}
              <div className="mt-6 px-4">
                <div className="flex items-center p-3 bg-gray-800/50 rounded-lg border border-white/10">
                  <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-gold">
                    <User size={20} />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-white">{user?.name || 'Manager'}</p>
                    <p className="text-xs text-gray-400">{user?.email || 'manager@caraya.com'}</p>
                  </div>
                </div>
              </div>
              
              <nav className="mt-5 px-2 space-y-1">
                {links.map((link) => {
                  const Icon = link.icon;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                        isActive(link.href)
                          ? 'bg-gold text-black'
                          : 'text-gray-300 hover:bg-gray-800/50 hover:text-white'
                      }`}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <Icon
                        className={`mr-3 flex-shrink-0 h-5 w-5 ${
                          isActive(link.href) ? 'text-black' : 'text-gray-400 group-hover:text-gray-300'
                        }`}
                      />
                      {link.label}
                    </Link>
                  );
                })}
              </nav>
            </div>
            <div className="flex-shrink-0 flex border-t border-white/10 p-4">
              <button
                onClick={() => {
                  logout();
                  setIsMobileMenuOpen(false);
                }}
                className="flex items-center px-3 py-2 text-sm font-medium text-gray-300 rounded-md hover:bg-gray-800/50 hover:text-white transition-colors w-full"
              >
                <LogOut className="mr-3 flex-shrink-0 h-5 w-5 text-gray-400" />
                Sign Out
              </button>
            </div>
          </motion.div>
          <div className="flex-shrink-0 w-14"></div>
        </div>
      )}
    </>
  );
} 