'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useFetch } from '@/hooks/useFetch';
import { useAuth } from '@/hooks/useAuth';
import { api } from '@/lib/api';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';

export default function EditPostPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user: currentUser, loading: authLoading } = useAuth();
  const { data, loading, error } = useFetch(`/posts/${id}`);

  const post = data?.post;

  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [initialized, setInitialized] = useState(false);
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
    onUpdate: ({ editor: ed }) => {
      setBody(ed.getHTML());
    },
    editorProps: {
      attributes: {
        class:
          'w-full text-xl font-sans text-gray-800 focus:outline-none bg-transparent min-h-[420px] leading-relaxed tracking-wide outline-none prose prose-lg !max-w-none',
      },
    },
  });

  useEffect(() => {
    if (!post || !editor || initialized) return;
    setTitle(post.title || '');
    setImageUrl(post.image_url || '');
    setBody(post.body || '');
    editor.commands.setContent(post.body || '');
    setInitialized(true);
  }, [post, editor, initialized]);

  const authorId = post?.userId ?? post?.author_id ?? post?.user_id ?? post?.users?.id;
  const isAuthor =
    authorId != null && currentUser?.id != null && String(authorId) === String(currentUser.id);
  const isAdmin = currentUser?.role === 'admin';
  const canModify = Boolean(currentUser && (isAuthor || isAdmin));

  const handleImageClick = () => fileInputRef.current?.click();

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setFormError('Please select a valid image file.');
      return;
    }

    setFormError('');
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Upload failed');
      setImageUrl(json.url);
    } catch (err) {
      setFormError(err.message);
    } finally {
      e.target.value = '';
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!title || !body) {
      setFormError('Title and story body are required.');
      return;
    }

    setSaving(true);
    try {
      const res = await api.put(`/posts/${id}`, { title, body, image_url: imageUrl });
      if (res?.error) throw new Error(res.error);
      router.push(`/posts/${id}`);
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading || authLoading) {
    return <div className="py-24 text-center text-gray-500 font-medium">Loading…</div>;
  }

  if (error || !post) {
    return <div className="py-24 text-center text-red-600 font-semibold">Post not found.</div>;
  }

  if (!canModify) {
    return (
      <div className="py-24 text-center">
        <div className="text-gray-900 font-semibold mb-2">You don&apos;t have access to edit this post.</div>
        <button
          type="button"
          onClick={() => router.back()}
          className="text-[#0A4BB5] font-bold text-sm hover:underline"
        >
          Go back
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[900px] mx-auto pb-16">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-serif font-extrabold text-gray-900 tracking-tight">
            Edit post
          </h1>
          <p className="text-sm text-gray-500 font-medium mt-1">Update your title, cover image, and story.</p>
        </div>
        <button
          type="button"
          onClick={() => router.push(`/posts/${id}`)}
          className="text-xs font-bold tracking-widest uppercase text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
      </div>

      {formError && (
        <div className="mb-6 text-red-600 text-xs p-3 bg-red-50 rounded border border-red-100 text-center">
          {formError}
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-10">
        <div>
          <div className="text-[10px] font-bold text-gray-500 tracking-widest uppercase mb-3">Cover image</div>
          <div
            onClick={handleImageClick}
            className="w-full h-64 md:h-80 bg-[#FAFAFA] border border-dashed border-gray-200 rounded-sm flex items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors relative overflow-hidden"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            {imageUrl ? (
              <img src={imageUrl} alt="Cover" className="absolute inset-0 w-full h-full object-cover" />
            ) : (
              <div className="opacity-80 flex flex-col items-center">
                <span className="text-xs font-bold text-gray-600 tracking-widest uppercase mb-1.5">Add cover image</span>
                <span className="text-[10px] text-gray-400 italic font-medium">1600 × 900 recommended</span>
              </div>
            )}
          </div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
          />
        </div>

        <div>
          <div className="text-[10px] font-bold text-gray-500 tracking-widest uppercase mb-3">Title</div>
          <input
            type="text"
            className="w-full text-4xl md:text-[52px] font-serif font-extrabold text-gray-900 placeholder:text-gray-300 focus:outline-none bg-transparent tracking-tighter leading-[1.1]"
            placeholder="Enter your title..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div>
          <div className="flex items-center gap-5 mb-4">
            <button
              type="button"
              onClick={() => editor?.chain().focus().toggleBold().run()}
              className={`font-extrabold text-sm transition-colors ${editor?.isActive('bold') ? 'text-[#0A4BB5]' : 'hover:text-[#0A4BB5]'}`}
            >
              B
            </button>
            <button
              type="button"
              onClick={() => editor?.chain().focus().toggleItalic().run()}
              className={`italic font-serif text-base font-bold transition-colors ${editor?.isActive('italic') ? 'text-[#0A4BB5]' : 'hover:text-[#0A4BB5]'}`}
            >
              I
            </button>
          </div>

          <EditorContent editor={editor} />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full bg-[#0A4BB5] hover:bg-[#083b8f] text-white py-3.5 rounded-md font-semibold transition-colors shadow-sm disabled:opacity-70"
        >
          {saving ? 'Saving…' : 'Save changes'}
        </button>
      </form>
    </div>
  );
}
