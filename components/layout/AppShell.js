'use client';

import { usePathname } from 'next/navigation';
import Sidebar from '@/components/layout/Sidebar';
import NotesPanel from '@/components/notes/NotesPanel';

export default function AppShell({ children }) {
  const pathname = usePathname();
  const showNotes = pathname === '/';

  return (
    <div className="flex-1 flex w-full">
      <Sidebar />

      <div className="flex-1 min-w-0 flex justify-center">
        <main id="global-main" className="w-full max-w-[1100px] min-w-0 px-4 md:px-6 pt-8 md:pt-10 pb-16">
          {children}
        </main>
      </div>

      {showNotes ? <NotesPanel /> : null}
    </div>
  );
}
