'use client';

import { useEffect, useState } from 'react';

export default function NotesPanel() {
  const [input, setInput] = useState('');
  const [notes, setNotes] = useState([]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('notes');
      if (saved) setNotes(JSON.parse(saved));
    } catch {
      // ignore corrupted localStorage
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('notes', JSON.stringify(notes));
  }, [notes]);

  const handleAddNote = () => {
    if (!input.trim()) return;
    setNotes([input, ...notes]);
    setInput('');
  };

  return (
    <div className="w-[360px] min-h-screen border-l border-[#EAEAEA] p-4 flex flex-col flex-shrink-0 overflow-hidden bg-[#FCFBFA]">
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
        className="w-full bg-[#0A4BB5] hover:bg-[#083b8f] text-white py-2 rounded-md mb-3 font-semibold transition-colors"
      >
        Add Note
      </button>

      <div className="flex-1 flex flex-col gap-2 overflow-y-auto pr-1">
        {notes.map((note, index) => (
          <div key={index} className="p-3 border border-gray-100 bg-white rounded-md text-sm text-gray-800 break-words whitespace-pre-wrap shadow-[0_1px_10px_rgb(0,0,0,0.03)]">
            {note}
          </div>
        ))}
      </div>
    </div>
  );
}
