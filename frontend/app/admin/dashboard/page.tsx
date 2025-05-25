'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useAdmin } from '@/lib/admin-provider';
import ProtectedAdminRoute from '@/components/auth/protected-admin-route';
import { useRouter } from 'next/navigation';

export default function AdminDashboardPage() {
  const { admin, logout } = useAdmin();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/admin/login');
  };

  return (
    <ProtectedAdminRoute>
      <div className="min-h-screen bg-gray-50">
        <header className="bg-gray-800 text-white shadow">
          <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
            <div className="flex items-center gap-4">
              <span className="text-sm">
                Welcome, {admin?.name || 'Admin'}
              </span>
              <button
                onClick={handleLogout}
                className="px-3 py-1 text-sm bg-gray-700 hover:bg-gray-600 rounded-md"
              >
                Logout
              </button>
            </div>
          </div>
        </header>

        <div className="bg-white shadow">
          <div className="max-w-7xl mx-auto py-2 px-4 sm:px-6 lg:px-8">
            <nav className="flex space-x-4">
              <Link 
                href="/admin/dashboard" 
                className="px-3 py-2 text-sm font-medium rounded-md bg-gray-800 text-white"
              >
                Dashboard
              </Link>
              <Link 
                href="/admin/managers" 
                className="px-3 py-2 text-sm font-medium rounded-md text-gray-600 hover:text-gray-800 hover:bg-gray-100"
              >
                Manage Managers
              </Link>
            </nav>
          </div>
        </div>

        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {/* Dashboard Stats */}
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-indigo-500 rounded-md p-3">
                      <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Total Managers</dt>
                        <dd>
                          <div className="text-lg font-medium text-gray-900">-- Managers</div>
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-5 py-3">
                  <div className="text-sm">
                    <Link href="/admin/managers" className="font-medium text-indigo-600 hover:text-indigo-500">
                      View all managers
                    </Link>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">Quick Actions</h3>
                  <div className="mt-5">
                    <ul className="divide-y divide-gray-200">
                      <li className="py-3">
                        <Link href="/admin/managers" className="text-indigo-600 hover:text-indigo-900">
                          Add New Manager
                        </Link>
                      </li>
                      <li className="py-3">
                        <Link href="/admin/managers" className="text-indigo-600 hover:text-indigo-900">
                          Manage Existing Managers
                        </Link>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </ProtectedAdminRoute>
  );
} 