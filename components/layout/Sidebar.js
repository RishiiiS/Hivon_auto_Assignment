'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

const HomeIcon = ({ active }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
    <polyline points="9 22 9 12 15 12 15 22"></polyline>
  </svg>
);

const UserIcon = ({ active }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
    <circle cx="12" cy="7" r="4"></circle>
  </svg>
);

const InfoIcon = ({ active }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <path d="M12 16v-4" />
    <path d="M12 8h.01" />
  </svg>
);

export default function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuth();

  return (
    <aside id="global-sidebar" className="hidden md:flex flex-col w-[220px] lg:w-[240px] h-[calc(100vh-4rem)] border-r border-[#EAEAEA] bg-transparent sticky top-16 pt-8 px-4 shrink-0 overflow-y-auto">
      <nav className="flex flex-col gap-1.5">
        <Link 
          href="/" 
          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${pathname === '/' ? 'bg-[#FCFBFA] shadow-sm font-bold text-[#0A4BB5] border border-gray-100' : 'text-gray-600 hover:bg-gray-100 font-semibold border border-transparent'}`}
        >
          <HomeIcon active={pathname === '/'} />
          <span className="text-[15px] tracking-wide">Home</span>
        </Link>

        <Link
          href="/about"
          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${pathname === '/about' ? 'bg-[#FCFBFA] shadow-sm font-bold text-[#0A4BB5] border border-gray-100' : 'text-gray-600 hover:bg-gray-100 font-semibold border border-transparent'}`}
        >
          <InfoIcon active={pathname === '/about'} />
          <span className="text-[15px] tracking-wide">About</span>
        </Link>
        
        {user && (
          <Link 
            href="/profile" 
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${pathname === '/profile' ? 'bg-[#FCFBFA] shadow-sm font-bold text-[#0A4BB5] border border-gray-100' : 'text-gray-600 hover:bg-gray-100 font-semibold border border-transparent'}`}
          >
            <UserIcon active={pathname === '/profile'} />
            <span className="text-[15px] tracking-wide">Profile</span>
          </Link>
        )}
      </nav>
    </aside>
  );
}
