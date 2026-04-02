'use client';

import { useEffect, useState } from 'react';
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
        <div className="flex flex-col items-center mb-24">
          <div className="w-32 h-32 md:w-40 md:h-40 rounded-xl overflow-hidden shadow-lg mb-6 border-4 border-white transform transition-transform hover:scale-105 duration-300">
            <img 
              src="https://i.pravatar.cc/300?u=a04258114e29026702d" 
              alt={user.name || 'User'} 
              className="w-full h-full object-cover"
            />
          </div>
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
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
