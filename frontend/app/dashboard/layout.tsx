"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-provider';
import Sidebar from '@/components/Sidebar';
import { Loader2 } from 'lucide-react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { token, isLoading } = useAuth();
  const router = useRouter();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  
  // Listen for sidebar collapse state changes
  const handleSidebarToggle = (collapsed: boolean) => {
    setIsSidebarCollapsed(collapsed);
  };
  
  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !token) {
      router.push('/');
    }
  }, [token, isLoading, router]);
  
  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gradient-to-b from-gray-900 to-black">
        <Loader2 className="h-12 w-12 animate-spin text-gold" />
      </div>
    );
  }
  
  return (
    <div className="flex h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      <Sidebar onCollapsedChange={handleSidebarToggle} />
      
      <div className={`flex-1 transition-all duration-300 ${isSidebarCollapsed ? 'md:ml-20' : 'md:ml-64'} overflow-auto`}>
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
} 