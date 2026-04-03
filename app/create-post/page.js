'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { useAuth } from '@/hooks/useAuth';

export default function CreatePostPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [saveTime, setSaveTime] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef(null);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: 'Tell your story...',
        emptyEditorClass: 'is-editor-empty',
      }),
    ],
    immediatelyRender: false,
    content: '',
    onUpdate: ({ editor }) => {
      setBody(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'w-full text-xl font-sans text-gray-800 focus:outline-none bg-transparent min-h-[500px] leading-relaxed tracking-wide outline-none prose prose-lg !max-w-none',
      },
    },
  });

  const toggleBold = () => {
    editor?.chain().focus().toggleBold().run();
  };

  const toggleItalic = () => {
    editor?.chain().focus().toggleItalic().run();
  };

  // Simulating auto-save text
  useEffect(() => {
    if (title || body) {
      const now = new Date();
      setSaveTime(`Draft saved at ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`);
    } else {
      setSaveTime('');
    }
  }, [title, body]);

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file.');
      return;
    }

    setUploadingImage(true);
    setError('');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Upload failed');
      }

      setImageUrl(data.url);
    } catch (err) {
      setError(err.message);
    } finally {
      setUploadingImage(false);
      e.target.value = '';
    }
  };

  const handlePublish = async (e) => {
    e.preventDefault();
    if (!title || !body) {
      setError("Title and story body are required to publish.");
      return;
    }
    setLoading(true);
    try {
      await api.post('/posts/create', { title, body, image_url: imageUrl });
      router.push('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col bg-white overflow-x-hidden font-sans selection:bg-blue-100 relative z-50">
      
      {/* 1. Top Navbar (Static, #FAFAFA bg exactly matching Stitch screenshot) */}
      <nav className="sticky top-0 w-full h-16 bg-[#FAFAFA] z-50 flex items-center justify-between px-6 lg:px-10 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <svg className="w-5 h-5 text-black" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
             <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
          <span className="font-serif font-extrabold text-xl text-gray-900 tracking-tight">The Archive</span>
        </div>
        <div className="flex items-center gap-6">
          <span className="text-gray-500 text-xs font-semibold tracking-wide hidden sm:block">
            {loading ? 'Publishing...' : (saveTime || 'Draft saved at 10:42 AM')}
          </span>
          <button 
            onClick={handlePublish}
            disabled={loading}
            className="bg-[#0A4BB5] hover:bg-[#083b8f] text-white text-sm font-semibold rounded-md px-5 py-2 transition-all shadow-sm disabled:opacity-70"
          >
            Publish
          </button>
          {/* Avatar */}
          <button
            type="button"
            onClick={() => router.push(user ? '/profile' : '/login')}
            className="w-8 h-8 md:w-9 md:h-9 rounded-full overflow-hidden shadow-sm border border-gray-200 cursor-pointer hover:border-[#0A4BB5] transition-all flex items-center justify-center bg-white"
            aria-label="Profile"
          >
            {authLoading ? (
              <div className="w-full h-full bg-gray-100 animate-pulse" />
            ) : user?.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={user.avatar_url} className="w-full h-full object-cover" alt="Avatar" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] flex items-center justify-center text-white font-bold text-sm">
                {(user?.name || 'U').charAt(0).toUpperCase()}
              </div>
            )}
          </button>
        </div>
      </nav>

      {/* 2. Main Editor Content */}
      <div className="flex-1 w-full pt-16 pb-32">
         {error && (
            <div className="max-w-3xl mx-auto px-4 mt-6">
              <div className="text-red-600 text-xs p-3 bg-red-50 rounded border border-red-100 text-center">{error}</div>
            </div>
         )}

         <div className="w-full max-w-[800px] mx-auto px-4 md:px-8 mt-10 relative">
           
           {/* Cover Image Upload Area */}
           <div 
              onClick={handleImageClick}
              className="w-full h-72 md:h-96 bg-[#FAFAFA] border border-dashed border-gray-200 rounded-sm flex flex-col items-center justify-center mb-12 group hover:bg-gray-50 cursor-pointer transition-colors relative overflow-hidden"
           >
             <input 
               type="file" 
               accept="image/*" 
               className="hidden" 
               ref={fileInputRef} 
               onChange={handleFileChange}
             />
             
             {uploadingImage ? (
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full border-4 border-gray-200 border-t-[#0A4BB5] animate-spin mb-3 shadow-sm"></div>
                  <span className="text-[10px] font-bold text-gray-500 tracking-widest uppercase mb-1">Uploading...</span>
                </div>
             ) : imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={imageUrl} alt="Cover" className="absolute inset-0 w-full h-full object-cover" />
             ) : (
                <div className="opacity-80 group-hover:opacity-100 flex flex-col items-center transition-opacity">
                   <svg className="w-8 h-8 text-gray-500 mb-3" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                      {/* Plus icon on top right corner of camera */}
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 4v6m-3-3h6" />
                   </svg>
                   <span className="text-xs font-bold text-gray-600 tracking-widest uppercase mb-1.5">Add cover image</span>
                   <span className="text-[10px] text-gray-400 italic font-medium">1600 × 900 recommended</span>
                </div>
             )}
           </div>

           {/* Title Input */}
           <input 
              type="text" 
              className="w-full text-5xl md:text-[64px] font-serif font-extrabold text-gray-900 placeholder:text-gray-300 focus:outline-none bg-transparent tracking-tighter leading-[1.1] mb-8"
              placeholder="Enter your title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
           />

           {/* Inline Toolbar (Insert Block, B, I) */}
           <div className="flex items-center gap-6 mb-12 text-gray-900">
              <button disabled className="flex items-center gap-2 text-xs font-bold text-gray-400 cursor-not-allowed tracking-wide uppercase transition-colors">
                 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <circle cx="12" cy="12" r="9" strokeWidth="1.5"/>
                   <path strokeLinecap="round" strokeWidth="1.5" d="M12 8v8m-4-4h8"/>
                 </svg>
                 Insert Block
              </button>
              
              <div className="w-px h-5 bg-gray-200"></div>
              
              <div className="flex gap-5 items-center">
                 <button onClick={toggleBold} className={`font-extrabold text-sm transition-colors ${editor?.isActive('bold') ? 'text-blue-600' : 'hover:text-blue-600 outline-none'}`}>B</button>
                 <button onClick={toggleItalic} className={`italic font-serif text-base font-bold transition-colors ${editor?.isActive('italic') ? 'text-blue-600' : 'hover:text-blue-600 outline-none'}`}>I</button>
              </div>
           </div>

           {/* Body Editor Section */}
           <div className="relative w-full">
             
             {/* Floating Menu Toolbar (Left of body, visible on md+ screens exactly as screenshot 2) */}
             <div className="absolute -left-16 top-0 hidden md:flex flex-col gap-3 group opacity-60 hover:opacity-100 transition-opacity">
               <button className="w-10 h-10 border border-gray-200 rounded flex items-center justify-center bg-white text-gray-500 hover:text-gray-900 hover:shadow shadow-sm transition-all">
                 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <rect x="3" y="3" width="18" height="18" rx="2" strokeWidth="1.5" />
                   <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor"/>
                   <path strokeWidth="1.5" d="M21 15l-5-5L5 21"/>
                 </svg>
               </button>
               <button className="w-10 h-10 border border-gray-200 rounded flex items-center justify-center bg-white text-gray-500 hover:text-gray-900 hover:shadow shadow-sm transition-all">
                 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"/>
                 </svg>
               </button>
               <button className="w-10 h-10 border border-gray-200 rounded flex items-center justify-center bg-white text-gray-500 hover:text-gray-900 hover:shadow shadow-sm transition-all">
                 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 6h16M4 12h16M4 18h8"/>
                 </svg>
               </button>
             </div>
             
             {/* Dynamic Textarea using TipTap */}
             <EditorContent editor={editor} />
           </div>

         </div>
      </div>

      {/* 3. Footer (Static, #FAFAFA bg matching Stitch screenshot) */}
      <footer className="w-full bg-[#FAFAFA] py-10 px-6 lg:px-10 flex flex-col md:flex-row justify-between items-start md:items-end border-t border-[#F0F0F0]">
         <div className="flex flex-col gap-2">
            <h3 className="font-serif font-extrabold text-gray-900 text-lg tracking-tight">The Editorial Archive</h3>
            <p className="text-xs text-gray-500 font-medium tracking-wide">© 2024 The Editorial Archive. Designed for the Digital Curator.</p>
         </div>
         <div className="flex gap-6 text-xs font-semibold text-gray-500 mt-6 md:mt-0 tracking-wide">
            <a href="#" className="hover:text-gray-900 transition-colors">About</a>
            <a href="#" className="hover:text-gray-900 transition-colors">Help</a>
         </div>
      </footer>

      {/* Injecting CSS to ensure it bypasses layout constraints cleanly for this specific route */}
      <style dangerouslySetInnerHTML={{__html: `
        #global-navbar { display: none !important; }
        #global-footer { display: none !important; }
        #global-body aside { display: none !important; }
        #global-body { padding-top: 0 !important; background-color: #ffffff !important; overflow-x: hidden !important; }
        #global-main { max-width: 100% !important; padding: 0 !important; margin: 0 !important; overflow-x: hidden !important; }

        .tiptap p.is-editor-empty:first-child::before {
          color: #d1d5db; /* text-gray-300 */
          content: attr(data-placeholder);
          float: left;
          height: 0;
          pointer-events: none;
        }
        
        .tiptap p { margin-bottom: 0.75em; }
        .tiptap strong { font-weight: 800; color: #111827; }
        .tiptap em { font-style: italic; }
      `}} />
    </div>
  );
}
