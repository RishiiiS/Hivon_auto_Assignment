'use client';

import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';

export default function AdminLayout({ children }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/admin/login');
      } else if (user.role !== 'admin') {
        router.push('/');
      }
    }
  }, [user, loading, router]);

  if (loading || !user || user.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-500 font-medium">Checking admin credentials...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <aside className="w-64 bg-slate-900 text-white flex flex-col">
        <div className="p-6 border-b border-slate-800">
          <h1 className="text-xl font-bold font-serif tracking-tight">Archive Admin</h1>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          <Link href="/admin" className="block px-3 py-2 rounded-md hover:bg-slate-800 transition-colors">
            Dashboard
          </Link>
          <Link href="/admin/posts" className="block px-3 py-2 rounded-md hover:bg-slate-800 transition-colors">
            Posts
          </Link>
          <Link href="/admin/users" className="block px-3 py-2 rounded-md hover:bg-slate-800 transition-colors">
            Users
          </Link>
        </nav>
        <div className="p-4 border-t border-slate-800">
          <Link href="/" className="block px-3 py-2 rounded-md hover:bg-slate-800 transition-colors text-slate-400">
            &larr; Back to Site
          </Link>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-h-screen overflow-x-hidden">
        <header className="bg-white border-b border-gray-200 h-16 flex items-center px-8 shrink-0">
          <div className="ml-auto flex items-center gap-4">
            <span className="text-sm font-medium text-gray-700">{user.email}</span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 uppercase tracking-wide">
              Admin
            </span>
          </div>
        </header>
        <div className="flex-1 p-8 overflow-y-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
