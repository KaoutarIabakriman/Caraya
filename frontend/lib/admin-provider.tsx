'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import Cookies from 'js-cookie';
import axios from 'axios';

type Admin = {
  id: string;
  email: string;
  name: string;
  role: string;
};

type AdminContextType = {
  admin: Admin | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  error: string | null;
};

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const AdminProvider = ({ children }: { children: ReactNode }) => {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if admin is already logged in
    const storedToken = Cookies.get('admin_token');
    if (storedToken) {
      setToken(storedToken);
      fetchAdmin(storedToken);
    } else {
      setIsLoading(false);
    }
  }, []);

  const fetchAdmin = async (authToken: string) => {
    try {
      console.log('Fetching admin profile with token:', authToken);
      const response = await axios.get('http://localhost:5000/api/admin/profile', {
        headers: {
          Authorization: `Bearer ${authToken}`
        }
      });
      console.log('Admin profile response:', response.data);
      setAdmin(response.data.admin);
      setIsLoading(false);
    } catch (error: any) {
      console.error('Error fetching admin profile:', error);
      console.error('Response data:', error.response?.data);
      console.error('Response status:', error.response?.status);
      logout();
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    setError(null);
    try {
      console.log('Attempting admin login with email:', email);
      const response = await axios.post('http://localhost:5000/api/admin/login', {
        email,
        password
      });
      
      console.log('Admin login response:', response.data);
      const { token, admin } = response.data;
      
      // Store token in cookie (expires in 1 day)
      Cookies.set('admin_token', token, { expires: 1 });
      
      setToken(token);
      setAdmin(admin);
    } catch (error: any) {
      console.error('Login error:', error);
      console.error('Response data:', error.response?.data);
      console.error('Response status:', error.response?.status);
      setError(error.response?.data?.message || 'Failed to login. Please try again.');
      throw error;
    }
  };

  const logout = () => {
    Cookies.remove('admin_token');
    setToken(null);
    setAdmin(null);
  };

  return (
    <AdminContext.Provider
      value={{
        admin,
        token,
        isAuthenticated: !!token,
        isLoading,
        login,
        logout,
        error
      }}
    >
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
}; 