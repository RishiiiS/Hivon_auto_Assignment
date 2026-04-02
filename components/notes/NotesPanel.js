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

  return (
    <div className="relative z-20 w-[360px] min-h-screen border-l border-[#EAEAEA] p-4 flex flex-col flex-shrink-0 overflow-hidden bg-[#FCFBFA] pointer-events-auto">
      <h2 className="text-lg font-semibold mb-2 text-gray-900">My Notes</h2>

      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Write your notes..."
        className="w-full h-32 p-3 border border-gray-200 rounded-md resize-none mb-3 bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0A4BB5]/20 focus:border-[#0A4BB5]"
      />

      <div className="flex gap-2 mb-2">
        <button type="button" className="px-2 py-1 border border-gray-200 rounded text-sm font-semibold text-gray-700 bg-white hover:bg-gray-50 transition-colors">B</button>
        <button type="button" className="px-2 py-1 border border-gray-200 rounded text-sm font-semibold text-gray-700 bg-white hover:bg-gray-50 transition-colors">I</button>
        <button type="button" className="px-2 py-1 border border-gray-200 rounded text-sm font-semibold text-gray-700 bg-white hover:bg-gray-50 transition-colors">•</button>
      </div>

      <button
        type="button"
        onClick={handleAddNote}
        disabled={adding}
        className="w-full bg-[#0A4BB5] hover:bg-[#083b8f] text-white py-2 rounded-md mb-3 font-semibold transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {adding ? 'Adding…' : (status === 'unauth' ? 'Sign in to add' : 'Add Note')}
      </button>

      <div className="flex-1 flex flex-col gap-2 overflow-y-auto pr-1">
        {loading ? (
          <div className="text-sm text-gray-500 py-2">Loading…</div>
        ) : status === 'unauth' ? (
          <div className="text-sm text-gray-500 py-2">Sign in to view and save notes.</div>
        ) : status === 'unconfigured' ? (
          <div className="text-sm text-gray-500 py-2">Notes backend isn’t configured yet.</div>
        ) : status === 'error' ? (
          <div className="text-sm text-gray-500 py-2">Notes are temporarily unavailable.</div>
        ) : (
          notes.map((note) => (
            <div
              key={note.id}
              onClick={() => router.push(`/notes/${note.id}`)}
              className="p-3 border border-gray-100 bg-white rounded-md text-sm text-gray-800 break-words shadow-[0_1px_10px_rgb(0,0,0,0.03)] cursor-pointer hover:border-gray-200 transition-colors"
            >
              {previewText(note)}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
