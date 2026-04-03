'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

export default function NotesPanel() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [input, setInput] = useState('');
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('loading'); // loading | ready | unauth | unconfigured | error
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      setStatus('loading');
      const res = await api.get('/notes');
      if (!mounted) return;
      if (res?.error) {
        setNotes([]);
        if (res.status === 401) setStatus('unauth');
        else if (res.status === 503) setStatus('unconfigured');
        else setStatus('error');
      } else {
        setNotes(res.notes || []);
        setStatus('ready');
      }
      setLoading(false);
    }

    if (authLoading) return () => { mounted = false; };
    if (!user) {
      setNotes([]);
      setLoading(false);
      setStatus('unauth');
      return () => { mounted = false; };
    }

    load();
    return () => {
      mounted = false;
    };
  }, [authLoading, user?.id]);

  const [mobileOpen, setMobileOpen] = useState(false);

  const handleAddNote = async () => {
    if (authLoading) return;
    if (adding) return;

    const content = input.trim();
    if (!content) return;
    if (!user) {
      router.push('/login');
      return;
    }
    if (status === 'unconfigured') {
      return;
    }
    if (status === 'error') {
      return;
    }

    setAdding(true);
    try {
      const res = await api.post('/notes', { title: '', content });
      if (res?.error) {
        if (res.status === 503) setStatus('unconfigured');
        else if (res.status === 401) setStatus('unauth');
        else alert(res.error);
        return;
      }
      const note = res.note;
      setNotes((prev) => [note, ...prev]);
      setInput('');
      setStatus('ready');
    } finally {
      setAdding(false);
    }
  };

  const previewText = (note) => {
    const title = (note.title || '').trim();
    if (title) return title;
    const content = (note.content || '').trim();
    return content.length > 40 ? content.slice(0, 40) + '…' : content || 'Untitled';
  };

  // Ensure body scroll lock on mobile when notes open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  return (
    <>
      {/* Floating Action Button for Mobile/Tablet */}
      <button 
        className="xl:hidden fixed bottom-6 right-6 z-40 bg-[#0A4BB5] text-white p-4 rounded-full shadow-xl hover:scale-105 active:scale-95 transition-all outline-none focus:ring-4 focus:ring-[#0A4BB5]/30 flex items-center gap-2 group"
        onClick={() => setMobileOpen(true)}
      >
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
        <span className="font-bold tracking-wide w-0 overflow-hidden opacity-0 group-hover:w-auto group-hover:opacity-100 group-hover:ml-1 transition-all duration-300">Notes</span>
      </button>

      {/* Backdrop */}
      {mobileOpen && (
        <div 
          className="xl:hidden fixed inset-0 bg-black/40 z-[60] backdrop-blur-sm transition-opacity"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Panel */}
      <div className={`
        fixed xl:relative inset-y-0 right-0 z-[70] xl:z-20 w-[320px] sm:w-[360px] bg-[#FCFBFA] border-l border-[#EAEAEA] flex flex-col flex-shrink-0 pt-0 shadow-2xl xl:shadow-none
        transform transition-transform duration-300 ease-spring
        ${mobileOpen ? 'translate-x-0' : 'translate-x-full xl:translate-x-0'}
      `}>
        <div className="flex items-center justify-between p-4 border-b border-[#EAEAEA]/60 bg-white">
          <h2 className="text-lg font-bold text-gray-900 tracking-tight">My Notes</h2>
          <button 
            className="xl:hidden p-2 text-gray-500 hover:text-gray-900 transition-colors rounded-full hover:bg-gray-100"
            onClick={() => setMobileOpen(false)}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>

        <div className="flex flex-col flex-1 overflow-y-auto p-4 pt-5 gap-3 relative">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Write your notes..."
            className="w-full h-32 p-3 font-medium text-sm border border-gray-200 rounded-lg resize-none bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0A4BB5]/20 focus:border-[#0A4BB5] shadow-sm transition-all"
          />

          <div className="flex gap-2">
            <button type="button" className="w-8 h-8 flex items-center justify-center border border-gray-200 rounded hover:border-gray-300 text-sm font-semibold text-gray-700 bg-white hover:bg-gray-50 transition-colors">B</button>
            <button type="button" className="w-8 h-8 flex items-center justify-center border border-gray-200 rounded hover:border-gray-300 text-sm text-gray-700 font-serif italic bg-white hover:bg-gray-50 transition-colors">I</button>
            <button type="button" className="w-8 h-8 flex items-center justify-center border border-gray-200 rounded hover:border-gray-300 text-xl font-bold text-gray-700 bg-white hover:bg-gray-50 transition-colors leading-none pb-1">•</button>
          </div>

          <button
            type="button"
            onClick={handleAddNote}
            disabled={adding}
            className="w-full mt-1 bg-[#0A4BB5] hover:bg-[#083b8f] text-white py-2.5 rounded-lg text-sm font-bold tracking-wide transition-colors shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {adding ? 'Adding…' : (status === 'unauth' ? 'Sign in to save' : 'Add Note')}
          </button>

          <hr className="my-3 border-[#EAEAEA]" />

          <div className="flex-1 flex flex-col gap-2.5 pb-8">
            {loading ? (
              <div className="text-sm font-medium text-gray-500 py-4 text-center animate-pulse">Loading…</div>
            ) : status === 'unauth' ? (
              <div className="text-sm font-medium text-gray-500 py-4 text-center">Sign in to view your notes</div>
            ) : status === 'unconfigured' ? (
              <div className="text-sm font-medium text-orange-600 py-4 text-center bg-orange-50 rounded border border-orange-100">Notes backend offline</div>
            ) : status === 'error' ? (
              <div className="text-sm font-medium text-red-600 py-4 text-center">Unavailable right now</div>
            ) : notes.length === 0 ? (
              <div className="text-sm text-gray-400 py-8 text-center italic font-serif">Your scratchpad is empty</div>
            ) : (
              notes.map((note) => (
                <div
                  key={note.id}
                  onClick={() => router.push(`/notes/${note.id}`)}
                  className="p-3.5 border border-gray-100 bg-white rounded-lg text-sm font-medium text-gray-800 break-words shadow-[0_2px_8px_rgb(0,0,0,0.03)] cursor-pointer hover:border-[#0A4BB5]/40 hover:shadow-md transition-all group"
                >
                  <span className="line-clamp-3 group-hover:text-[#0A4BB5] transition-colors">{previewText(note)}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  );
}
