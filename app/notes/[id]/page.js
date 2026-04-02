'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';

export default function NoteDetailPage() {
  const { id } = useParams();
  const router = useRouter();

  const [note, setNote] = useState(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      const res = await api.get(`/notes/${id}`);
      if (!mounted) return;
      if (res?.error) {
        setNote(null);
      } else {
        setNote(res.note);
        setTitle(res.note?.title || '');
        setContent(res.note?.content || '');
      }
      setLoading(false);
    }
    if (id) load();
    return () => {
      mounted = false;
    };
  }, [id]);

  const handleSave = async () => {
    setSaving(true);
    const res = await api.put(`/notes/${id}`, { title, content });
    setSaving(false);
    if (res?.error) {
      alert(res.error);
      return;
    }
    setNote(res.note);
  };

  const handleDelete = async () => {
    if (!confirm('Delete this note?')) return;
    const res = await api.delete(`/notes/${id}`);
    if (res?.error) {
      alert(res.error);
      return;
    }
    router.push('/');
  };

  if (loading) {
    return <div className="py-20 text-center text-gray-500 font-medium">Loading note…</div>;
  }

  if (!note) {
    return (
      <div className="py-20 text-center">
        <div className="text-gray-900 font-semibold mb-2">Note not found.</div>
        <button
          type="button"
          onClick={() => router.push('/')}
          className="text-[#0A4BB5] font-bold text-sm hover:underline"
        >
          Back to Home
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[900px] mx-auto pb-16">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-serif font-extrabold text-gray-900 tracking-tight">
            Note
          </h1>
          <p className="text-sm text-gray-500 font-medium mt-1">Saved to your private notes.</p>
        </div>
        <button
          type="button"
          onClick={() => router.push('/')}
          className="text-xs font-bold tracking-widest uppercase text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md hover:bg-gray-50 transition-colors"
        >
          Back
        </button>
      </div>

      <div className="space-y-5">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title (optional)"
          className="w-full h-11 px-4 rounded-md border border-gray-200 bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0A4BB5]/20 focus:border-[#0A4BB5]"
        />

        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write your note..."
          className="w-full min-h-[260px] p-4 rounded-md border border-gray-200 bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0A4BB5]/20 focus:border-[#0A4BB5] resize-none"
        />

        <div className="flex gap-3">
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="flex-1 bg-[#0A4BB5] hover:bg-[#083b8f] text-white py-2.5 rounded-md font-semibold transition-colors disabled:opacity-70"
          >
            {saving ? 'Saving…' : 'Save'}
          </button>
          <button
            type="button"
            onClick={handleDelete}
            className="px-5 py-2.5 rounded-md font-semibold border border-red-200 text-red-600 hover:bg-red-50 transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

