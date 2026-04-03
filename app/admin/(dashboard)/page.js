'use client';

import { useEffect, useState } from 'react';
import AdminStatCard from '@/components/admin/AdminStatCard';
import { api } from '@/lib/api';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadStats() {
      try {
        const data = await api.get('/admin/stats');
        if (data.error) {
          setError(data.error);
        } else {
          setStats(data);
        }
      } catch (err) {
        setError(err.message || 'Failed to load stats');
      } finally {
        setLoading(false);
      }
    }

    loadStats();
  }, []);

  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Overview</h1>
      
      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-md mb-6 border border-red-100">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-gray-500">Loading metrics...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <AdminStatCard 
            title="Total Users" 
            value={stats?.users ?? '-'} 
            description="Registered accounts"
          />
          <AdminStatCard 
            title="Published Posts" 
            value={stats?.posts ?? '-'} 
            description="Total articles across platform"
          />
          <AdminStatCard 
            title="Comments" 
            value={stats?.comments ?? '-'} 
            description="Engagement metrics"
          />
        </div>
      )}

      <div className="mt-12 bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="flex gap-4">
          <a href="/admin/posts" className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-md font-medium text-sm transition-colors">
            Manage Posts
          </a>
          <a href="/admin/users" className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-md font-medium text-sm transition-colors">
            Manage Users
          </a>
        </div>
      </div>
    </div>
  );
}
