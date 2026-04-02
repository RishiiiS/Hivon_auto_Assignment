'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { api } from '@/lib/api';

function stripHtmlToText(html = '') {
  return String(html)
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

export default function PostCard({ post, isFeatured }) {
  const fallbackImage = 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?q=80&w=2940&auto=format&fit=crop';
  const imgUrl = post.image_url || fallbackImage;
  const summaryText = post.summary ? stripHtmlToText(post.summary) : '';
  
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
      <div className="w-full flex flex-col mb-10 group cursor-pointer border border-[#E9E9E9] rounded-[20px] overflow-hidden shadow-[0_4px_24px_-8px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_32px_-8px_rgba(0,0,0,0.1)] transition-all bg-white relative">
        <Link href={`/posts/${post.id}`} className="absolute inset-0 z-10 block"></Link>
        <div className="w-full h-[300px] md:h-[450px] overflow-hidden bg-gray-100 relative">
           {/* eslint-disable-next-line @next/next/no-img-element */}
           <img src={imgUrl} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-in-out" alt={post.title} />
        </div>
        <div className="p-8 md:p-10 flex flex-col items-start bg-white z-20 pointer-events-none">
           <span className="text-[11px] font-bold text-[#0A4BB5] tracking-widest uppercase mb-4">EDITORIAL FOCUS</span>
           
             <h2 className="text-4xl md:text-[50px] font-serif font-extrabold text-gray-900 tracking-tight leading-[1.05] mb-6 group-hover:text-[#0A4BB5] transition-colors">{post.title}</h2>
           
           {summaryText && (
             <p className="text-[17px] md:text-[19px] text-gray-800 mb-10 leading-[1.75] font-serif italic max-w-3xl">
               {summaryText}
             </p>
           )}
           <div className="flex items-center gap-4 mt-auto">
             {post.users?.avatar_url ? (
               <img src={post.users.avatar_url} className="w-6 h-6 rounded-full object-cover shadow-sm border border-gray-100" alt="Author"/>
             ) : (
               <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] flex items-center justify-center text-white text-[10px] font-bold shadow-sm border border-gray-100">
                 {(post.users?.name || 'U').charAt(0).toUpperCase()}
               </div>
             )}
             <span className="text-[15px] font-semibold text-gray-900 flex items-center gap-2">
                {post.users?.name || 'User'} 
                <span className="text-gray-300 font-normal text-[10px] mx-1">●</span> 
                <span className="text-gray-500 font-medium text-[13px]">12 min read</span>
             </span>
           </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full p-5 flex flex-row gap-6 items-start border border-[#E9E9E9] rounded-[20px] shadow-[0_4px_24px_-8px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_32px_-8px_rgba(0,0,0,0.1)] transition-all bg-white group relative mb-10">
      <Link href={`/posts/${post.id}`} className="absolute inset-0 z-10 block"></Link>
      
      <div className="flex-1 min-w-0 flex flex-col justify-between z-20 pointer-events-none">
        <div>
          <div className="text-[11px] font-bold text-gray-500 uppercase tracking-[0.06em] mb-3 flex items-center gap-2">
            <span className="text-gray-800">Technology</span> 
            <span className="text-gray-300 font-normal font-sans">/</span> 
            <span>{dateStr}</span>
          </div>
          
            <h3 className="text-[28px] md:text-[32px] font-serif font-extrabold text-gray-900 leading-[1.15] mb-4 group-hover:text-[#0A4BB5] transition-colors tracking-tight">
              {post.title}
            </h3>
          
          {summaryText && (
             <div className="bg-[#FAF9F7] rounded-xl p-4 md:p-5 mb-5 relative border border-gray-100">
               <span className="text-[11px] font-extrabold text-[#0A4BB5] tracking-widest uppercase mr-4 block mb-2">AI SUMMARY</span>
               <span className="text-[16px] md:text-[17px] font-serif italic text-gray-800 leading-[1.75] text-left break-words block line-clamp-3">{summaryText}</span>
            </div>
          )}
        </div>
        
        <div className="flex items-center justify-between mt-auto pt-3 md:pt-4">
          <span className="text-[16px] font-semibold text-gray-900">{post.users?.name || 'User'}</span>
          <button 
             onClick={handleLike}
             className={`flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-red-50 hover:scale-105 transition-all pointer-events-auto z-30 relative font-semibold tracking-wide text-[15px] ${isLiked ? 'text-red-500 bg-red-50' : 'text-gray-500'}`}
          >
             <svg className={`w-5 h-5 transition-transform ${isLiked ? 'scale-110' : ''}`} viewBox="0 0 24 24" fill={isLiked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/></svg>
             {likeCount}
          </button>
        </div>
      </div>
      
      <div className="w-[260px] h-[180px] bg-gray-100 rounded-md overflow-hidden flex-shrink-0 shadow-sm z-20 pointer-events-none relative">
         {/* eslint-disable-next-line @next/next/no-img-element */}
         <img src={imgUrl} className="w-[260px] h-[180px] object-cover rounded-md flex-shrink-0 group-hover:scale-[1.03] transition-transform duration-700 ease-out origin-center" alt={post.title} />
      </div>
    </div>
  );
}
