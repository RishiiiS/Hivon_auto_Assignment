'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { api } from '@/lib/api';
import PostCard from '@/components/post/PostCard';

const FONT_SERIF = "'Playfair Display', Georgia, 'Times New Roman', serif";

export default function ProfilePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [posts, setPosts] = useState([]);
  const [postsLoading, setPostsLoading] = useState(true);
  
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    let isMounted = true;
    async function fetchUserPosts() {
      if (!user?.id) return;
      try {
        setPostsLoading(true);
        const data = await api.get(`/posts/list?authorId=${user.id}`);
        if (isMounted && data.posts) {
          setPosts(data.posts);
        }
      } catch (err) {
        console.error("Error fetching user posts:", err);
      } finally {
        if (isMounted) setPostsLoading(false);
      }
    }
    
    if (user) {
      fetchUserPosts();
    }
    
    return () => { isMounted = false; };
  }, [user]);

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append('file', file);
      
      const { url } = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      await api.put('/auth/profile', { avatar_url: url });
      
      // Reload strictly triggers useAuth refresh accurately matching the new bounds natively.
      window.location.reload();
      
    } catch (err) {
      console.error('Failed to update avatar:', err);
      alert('Failed to upload profile picture: ' + err.message);
    } finally {
      setIsUploading(false);
    }
  };

  if (authLoading || (!user && !authLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fafaf8]">
        <div className="w-12 h-12 border-4 border-gray-200 border-t-[#0A4BB5] rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafaf8] pt-32 pb-24 px-6 md:px-10">
      <div className="max-w-5xl mx-auto">
        
        {/* User Info Section */}
        <div className="flex flex-col items-center mb-24 relative group">
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="relative w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden shadow-lg mb-6 border-4 border-white cursor-pointer group-hover:shadow-xl transition-all duration-300 transform group-hover:scale-[1.02]"
          >
            {user.avatar_url ? (
              <img 
                src={user.avatar_url} 
                alt={user.name || 'User'} 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] flex items-center justify-center text-white text-5xl md:text-6xl font-black font-sans">
                {(user.name || 'U').charAt(0).toUpperCase()}
              </div>
            )}
            
            <div className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity duration-300 ${isUploading ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
              {isUploading ? (
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <span className="text-white text-xs font-bold tracking-widest uppercase">Edit</span>
              )}
            </div>
          </div>
          
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleImageUpload} 
            accept="image/*" 
            className="hidden" 
          />

          <h1 style={{ fontFamily: FONT_SERIF }} className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight">
            {user.name || 'Anonymous'}
          </h1>
          {user.email && (
            <p className="text-gray-500 mt-2 font-medium tracking-wide">
              {user.email}
            </p>
          )}
        </div>

        {/* Posts Section */}
        <div className="w-full">
          <div className="flex items-end justify-between border-b-2 border-gray-100 pb-4 mb-10">
            <h2 style={{ fontFamily: FONT_SERIF }} className="text-3xl font-bold text-gray-900 tracking-tight">
              Posts
            </h2>
            <span className="text-[10px] font-extrabold text-gray-400 tracking-[0.2em] uppercase">
              Selected Works
            </span>
          </div>

          {postsLoading ? (
             <div className="flex flex-col gap-10 opacity-60 animate-pulse">
               {[1,2,3].map(i => (
                 <div key={i} className="flex gap-10">
                   <div className="flex-1 space-y-4 py-4">
                     <div className="h-4 bg-gray-200 w-1/4 rounded"></div>
                     <div className="h-8 bg-gray-200 w-3/4 rounded"></div>
                     <div className="h-24 bg-gray-200 w-full rounded"></div>
                   </div>
                   <div className="hidden md:block w-[280px] h-[280px] bg-gray-200 rounded-md"></div>
                 </div>
               ))}
             </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-xl border border-gray-100 shadow-sm">
              <h3 style={{ fontFamily: FONT_SERIF }} className="text-2xl font-bold text-gray-800 mb-2">No publications yet</h3>
              <p className="text-gray-500 mb-6">You haven't written any articles for The Archive.</p>
              <button onClick={() => router.push('/create-post')} className="px-6 py-2 bg-[#0A4BB5] text-white text-sm font-bold tracking-widest uppercase rounded-full hover:bg-blue-800 transition-colors shadow-md">
                Start Writing
              </button>
            </div>
          ) : (
            <div className="flex flex-col">
              {posts.map(post => (
                <PostCard
                  key={post.id}
                  post={post}
                  currentUser={user}
                  onDeleted={(id) => setPosts((prev) => prev.filter((p) => p.id !== id))}
                />
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
