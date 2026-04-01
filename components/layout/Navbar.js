'use client';

import Link from 'next/link';

export default function Navbar() {
  return (
    <nav className="fixed top-0 w-full h-16 bg-white border-b border-gray-200 z-50 flex items-center px-4 md:px-6">
      <div className="flex-1 font-bold text-xl text-blue-600">
        <Link href="/">BlogPlatform</Link>
      </div>
      
      <div className="flex-1 text-center hidden sm:block">
        <input 
          type="text" 
          placeholder="Search posts..." 
          className="w-full max-w-sm px-4 py-2 border rounded-full bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="flex-1 flex justify-end gap-3">
        <Link href="/login" className="px-4 py-2 text-gray-600 hover:text-gray-900 font-medium">
          Login
        </Link>
        <Link href="/signup" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium">
          Sign Up
        </Link>
      </div>
    </nav>
  );
}
