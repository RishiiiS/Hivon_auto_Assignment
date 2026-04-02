'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useState, useRef, useEffect } from 'react';

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading, logout } = useAuth();
  
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [search, setSearch] = useState('');
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const q = search.trim();
    if (!q) return;
    router.push(`/search?query=${encodeURIComponent(q)}`);
  };
  
  return (
    <nav id="global-navbar" className="fixed top-0 w-full h-16 bg-white border-b border-gray-100 z-50 flex items-center justify-between px-6 lg:px-10 shadow-[0_2px_10px_rgb(0,0,0,0.02)]">
      <div className="flex items-center gap-3">
        <svg className="w-5 h-5 text-[#0A4BB5]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
           <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
        <Link href="/" className="font-serif font-extrabold text-xl text-gray-900 tracking-tight transition-transform hover:scale-[1.01]">The Archive</Link>
      </div>
      
      <div className="hidden md:flex flex-1 justify-center px-6">
        {pathname === '/about' && user ? (
          <div className="flex items-center gap-6 text-[11px] font-extrabold tracking-[0.22em] uppercase text-gray-500">
            <Link href="/" className="hover:text-gray-900 transition-colors">
              Home
            </Link>
            <Link href="/profile" className="hover:text-gray-900 transition-colors">
              Profile
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSearchSubmit} className="w-full max-w-[520px]">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2.5"
                    d="M21 21l-4.35-4.35M16.65 16.65A7.5 7.5 0 1116.65 1.5a7.5 7.5 0 010 15.15z"
                  />
                </svg>
              </span>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search posts..."
                className="w-full h-10 pl-10 pr-3 rounded-full border border-gray-200 bg-[#FCFBFA] text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0A4BB5]/20 focus:border-[#0A4BB5]"
              />
            </div>
          </form>
        )}
      </div>

      <div className="flex items-center gap-5">
        <Link href="/search" className="md:hidden text-gray-500 hover:text-[#0A4BB5] transition-colors p-1">
          <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-4.35-4.35M16.65 16.65A7.5 7.5 0 1116.65 1.5a7.5 7.5 0 010 15.15z" />
          </svg>
        </Link>
        
        {loading ? (
           <div className="w-8 h-8 rounded-full bg-gray-100 animate-pulse border border-gray-200"></div>
        ) : user ? (
           <div className="flex items-center gap-3 sm:gap-5">
             <Link href="/create-post" className="flex items-center gap-1.5 text-[11px] font-bold text-gray-600 hover:text-[#0A4BB5] uppercase tracking-widest transition-colors bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100 hover:bg-blue-50">
               <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4"/></svg>
               Write
             </Link>
             <div className="relative" ref={dropdownRef}>
                {user.avatar_url ? (
                  <img 
                    src={user.avatar_url} 
                    className="w-8 h-8 md:w-9 md:h-9 rounded-full object-cover shadow-sm border border-gray-200 cursor-pointer hover:border-[#0A4BB5] transition-all focus:outline-none focus:ring-2 focus:ring-[#0A4BB5]" 
                    alt="Profile"
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    tabIndex={0}
                    onKeyDown={(e) => { if (e.key === 'Enter') setDropdownOpen(!dropdownOpen); }}
                  />
                ) : (
                  <div 
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    onKeyDown={(e) => { if (e.key === 'Enter') setDropdownOpen(!dropdownOpen); }}
                    tabIndex={0}
                    className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] flex items-center justify-center text-white font-bold text-sm cursor-pointer shadow-sm border border-gray-200 hover:border-[#0A4BB5] transition-all focus:outline-none focus:ring-2 focus:ring-[#0A4BB5]"
                  >
                    {(user.name || 'U').charAt(0).toUpperCase()}
                  </div>
                )}
               
               {dropdownOpen && (
                 <div className="absolute right-0 mt-3 w-40 bg-white border border-gray-100 shadow-xl rounded-xl overflow-hidden z-50 transform origin-top-right transition-all duration-200 animate-in fade-in slide-in-from-top-2">
                    <div className="px-4 py-3 border-b border-gray-50 flex flex-col gap-0.5">
                      <span className="text-xs font-bold text-gray-900 truncate">{user.name || "My Account"}</span>
                      {user.email && <span className="text-[10px] text-gray-500 truncate">{user.email}</span>}
                    </div>
                    <Link 
                      href="/profile" 
                      onClick={() => setDropdownOpen(false)}
                      className="w-full text-left px-4 py-3 text-xs font-bold tracking-wide text-gray-700 hover:bg-gray-50 hover:text-[#0A4BB5] flex items-center justify-between transition-colors border-b border-gray-50"
                    >
                      My Profile
                    </Link>
                    <button 
                      onClick={() => {
                        setDropdownOpen(false);
                        logout();
                      }} 
                      className="w-full text-left px-4 py-3 text-xs font-bold tracking-wide text-red-600 hover:bg-red-50 flex items-center justify-between transition-colors"
                    >
                      Log out
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
                    </button>
                 </div>
               )}
             </div>
           </div>
        ) : (
           <div className="flex items-center gap-1 sm:gap-2">
             <Link href="/login" className="px-3 sm:px-4 py-2 text-[11px] font-bold text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md tracking-wider uppercase transition-colors">Sign In</Link>
             <Link href="/signup" className="hidden sm:inline-flex px-4 py-1.5 bg-gray-900 text-white text-[10px] font-bold tracking-widest uppercase rounded hover:bg-black hover:shadow-md transition-all">Sign Up</Link>
           </div>
        )}
      </div>
    </nav>
  );
}
