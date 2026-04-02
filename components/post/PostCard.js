'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { api } from '@/lib/api';

export default function PostCard({ post, isFeatured }) {
  const fallbackImage = 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?q=80&w=2940&auto=format&fit=crop';
  const imgUrl = post.image_url || fallbackImage;
  
  // Format dates statically for UI if missing
  const dateStr = post.created_at ? new Date(post.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Oct 24, 2024';

  const [likeCount, setLikeCount] = useState(0);
  const [isLiked, setIsLiked] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function fetchLikes() {
      try {
        const { count, liked } = await api.get(`/likes/summary?postId=${post.id}`);
        if (isMounted) {
          setLikeCount(count || 0);
          setIsLiked(liked || false);
        }
      } catch (err) {
        console.error('Error fetching likes:', err);
      }
    }
    if (post.id) fetchLikes();
    return () => { isMounted = false; };
  }, [post.id]);

  const handleLike = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Optimistic Update
    const prevLiked = isLiked;
    const prevCount = likeCount;
    
    setIsLiked(!prevLiked);
    setLikeCount(prevLiked ? Math.max(0, prevCount - 1) : prevCount + 1);

    try {
      const response = await api.post('/likes/toggle', { postId: post.id });
      // Sync strictly to backend reflection
      if (response && response.message) {
        setIsLiked(response.liked);
      } else if (response && response.error) {
        throw new Error(response.error);
      }
    } catch (err) {
      console.error('Like toggle failed:', err);
      // Revert optimistic update
      setIsLiked(prevLiked);
      setLikeCount(prevCount);
    }
  };

  if (isFeatured) {
    return (
      <div className="flex flex-col mb-4 group cursor-pointer border border-gray-100 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all bg-white relative">
        <Link href={`/posts/${post.id}`} className="absolute inset-0 z-10 block"></Link>
        <div className="w-full h-[300px] md:h-[450px] overflow-hidden bg-gray-100 relative">
           {/* eslint-disable-next-line @next/next/no-img-element */}
           <img src={imgUrl} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-in-out" alt={post.title} />
        </div>
        <div className="p-6 md:p-8 flex flex-col items-start bg-white z-20 pointer-events-none">
           <span className="text-[10px] font-bold text-[#0A4BB5] tracking-widest uppercase mb-3">EDITORIAL FOCUS</span>
           
             <h2 className="text-4xl md:text-[50px] font-serif font-extrabold text-gray-900 tracking-tight leading-[1.05] mb-5 group-hover:text-[#0A4BB5] transition-colors">{post.title}</h2>
           
           {post.summary && (
             <p className="text-lg md:text-xl text-gray-600 mb-8 leading-relaxed max-w-3xl">
               {post.summary}
             </p>
           )}
           <div className="flex items-center gap-3">
             <img src="https://i.pravatar.cc/150?u=a04258114e29026702d" className="w-6 h-6 rounded-full object-cover shadow-sm border border-gray-100" alt="Author"/>
             <span className="text-xs font-extrabold text-gray-900 flex items-center gap-2">
                {post.users?.name || 'User'} 
                <span className="text-gray-300 font-normal text-[8px]">●</span> 
                <span className="text-gray-500 font-medium">12 min read</span>
             </span>
           </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row gap-6 md:gap-14 py-8 border-b border-[#F0F0F0] last:border-0 group relative">
      <Link href={`/posts/${post.id}`} className="absolute inset-0 z-10 block"></Link>
      
      <div className="flex-1 flex flex-col justify-between order-2 md:order-1 z-20 pointer-events-none pr-2">
        <div>
          <div className="text-[10.5px] font-bold text-gray-500 uppercase tracking-[0.06em] mb-3 flex items-center gap-2">
            <span className="text-gray-800">Technology</span> 
            <span className="text-gray-300 font-normal font-sans">/</span> 
            <span>{dateStr}</span>
          </div>
          
            <h3 className="text-[28px] md:text-[32px] font-serif font-extrabold text-gray-900 leading-[1.15] mb-5 group-hover:text-[#0A4BB5] transition-colors tracking-tight">
              {post.title}
            </h3>
          
          {post.summary && (
             <div className="bg-[#FAF9F7] rounded-md p-5 pb-6 mb-7 relative">
               <span className="text-[11px] font-extrabold text-[#0A4BB5] tracking-widest uppercase mr-4">AI SUMMARY</span>
               <span className="text-[15px] font-serif italic text-gray-700 leading-[1.6] text-left break-words">{post.summary}</span>
            </div>
          )}
        </div>
        
        <div className="flex items-center justify-between text-[13px] font-bold text-gray-800 mt-2">
          <span>{post.users?.name || 'User'}</span>
          <button 
             onClick={handleLike}
             className={`flex items-center gap-1.5 transition-colors pointer-events-auto z-30 relative hover:text-red-500 font-semibold tracking-wide ${isLiked ? 'text-red-500' : 'text-gray-600'}`}
          >
             <svg className={`w-4 h-4 transition-transform ${isLiked ? 'scale-110' : ''}`} viewBox="0 0 24 24" fill={isLiked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/></svg>
             {likeCount}
          </button>
        </div>
      </div>
      
      <div className="w-full md:w-[280px] lg:w-[290px] h-[260px] md:h-[280px] bg-gray-100 rounded-md overflow-hidden order-1 md:order-2 flex-shrink-0 cursor-pointer shadow-sm z-20 pointer-events-none relative">
         {/* eslint-disable-next-line @next/next/no-img-element */}
         <img src={imgUrl} className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700 ease-out origin-center" alt={post.title} />
      </div>
    </div>
  );
}
