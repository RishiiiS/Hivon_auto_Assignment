'use client';

import Link from 'next/link';
import { useRef, useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { useRouter } from 'next/navigation';

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

function getRelatedUser(users) {
  if (!users) return null;
  return Array.isArray(users) ? users[0] || null : users;
}

export default function PostCard({ post, isFeatured, onDeleted, currentUser }) {
  const router = useRouter();
  const fallbackImage = 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?q=80&w=2940&auto=format&fit=crop';
  const imgUrl = post.image_url || fallbackImage;
  const summaryText = post.summary ? stripHtmlToText(post.summary) : '';
  const shouldShowMore = summaryText.length > 220;
  const [isSummaryExpanded, setIsSummaryExpanded] = useState(false);

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const relatedUser = getRelatedUser(post.users);
  const authorName = relatedUser?.name || post.user_name || post.author_name || 'User';
  const authorAvatarUrl = relatedUser?.avatar_url || post.author_avatar_url || null;

  const authorId = post.userId ?? post.author_id ?? post.user_id ?? relatedUser?.id ?? post.users?.id;
  const isAuthor =
    authorId != null && currentUser?.id != null && String(authorId) === String(currentUser.id);
  const isAdmin = currentUser?.role === 'admin';
  const canModify = Boolean(currentUser && (isAuthor || isAdmin));
  
  // Format dates statically for UI if missing
  const dateStr = post.created_at ? new Date(post.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Oct 24, 2024';

  const hasLocalLikeMutation = useRef(false);
  const [likeCount, setLikeCount] = useState(
    typeof post.likeCount === 'number' ? post.likeCount : 0
  );
  const [isLiked, setIsLiked] = useState(Boolean(post.isLiked));

  useEffect(() => {
    if (hasLocalLikeMutation.current) return;
    if (typeof post.likeCount === 'number') setLikeCount(post.likeCount);
    if (typeof post.isLiked === 'boolean') setIsLiked(post.isLiked);
  }, [post.likeCount, post.isLiked]);

  useEffect(() => {
    // If the feed already provided like data, skip per-card requests.
    if (typeof post.likeCount === 'number' || typeof post.isLiked === 'boolean') return;
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
    hasLocalLikeMutation.current = true;
    
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

  const toggleMenu = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsMenuOpen((prev) => !prev);
  };

  const handleEdit = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsMenuOpen(false);
    router.push(`/edit/${post.id}`);
  };

  const handleDelete = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsMenuOpen(false);

    if (!confirm('Delete this post?')) return;

    const res = await api.delete(`/posts/${post.id}`);
    if (res?.error) {
      alert(res.error);
      return;
    }

    onDeleted?.(post.id);
  };

  const handleShowMore = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsSummaryExpanded((v) => !v);
  };

  useEffect(() => {
    if (!isMenuOpen) return;

    const handleOutside = (event) => {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(event.target)) setIsMenuOpen(false);
    };

    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [isMenuOpen]);

  if (isFeatured) {
    return (
      <div className="w-full flex flex-col mb-10 group cursor-pointer border border-[#E9E9E9] rounded-[20px] overflow-hidden shadow-[0_4px_24px_-8px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_32px_-8px_rgba(0,0,0,0.1)] transition-all bg-white relative">
        <Link href={`/posts/${post.id}`} className="absolute inset-0 z-10 block"></Link>

        {canModify && (
          <div ref={menuRef} className="absolute top-4 right-4 z-30 pointer-events-auto">
            <button
              type="button"
              onClick={toggleMenu}
              className="p-2 rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-900 transition-colors"
              aria-label="Post actions"
            >
              <span className="text-xl leading-none">⋮</span>
            </button>
            {isMenuOpen && (
              <div className="absolute right-0 mt-2 w-32 bg-white border border-gray-100 rounded-md shadow-md z-20 overflow-hidden">
                <button
                  type="button"
                  onClick={handleEdit}
                  className="block w-full px-4 py-2 text-left text-sm hover:bg-gray-50"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  className="block w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-50"
                >
                  Delete
                </button>
              </div>
            )}
          </div>
        )}

        <div className="w-full h-[300px] md:h-[450px] overflow-hidden bg-gray-100 relative">
           {/* eslint-disable-next-line @next/next/no-img-element */}
           <img src={imgUrl} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-in-out" alt={post.title} />
        </div>
        <div className="p-8 md:p-10 flex flex-col items-start bg-white z-20 pointer-events-none">
           <span className="text-[11px] font-bold text-[#0A4BB5] tracking-widest uppercase mb-4">EDITORIAL FOCUS</span>
           
             <h2 className="text-4xl md:text-[50px] font-serif font-extrabold text-gray-900 tracking-tight leading-[1.05] mb-6 group-hover:text-[#0A4BB5] transition-colors">{post.title}</h2>
           
           {summaryText && (
             <p
               className="text-[17px] md:text-[19px] text-gray-800 mb-4 leading-[1.75] font-serif italic max-w-3xl"
               style={
                 isSummaryExpanded
                   ? undefined
                   : { overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 4, WebkitBoxOrient: 'vertical' }
               }
             >
               {summaryText}
             </p>
           )}
           {shouldShowMore && (
             <button
               type="button"
               onClick={handleShowMore}
               className="pointer-events-auto relative z-30 text-[11px] font-bold text-[#0A4BB5] tracking-widest uppercase hover:text-[#083b8f] mb-8"
             >
               {isSummaryExpanded ? 'Show less' : 'Show more'}
             </button>
           )}
	           <div className="flex items-center gap-4 mt-auto">
	             {authorAvatarUrl ? (
	               <img
	                 src={authorAvatarUrl}
	                 className="w-6 h-6 rounded-full object-cover shadow-sm border border-gray-100"
	                 alt={authorName}
	               />
             ) : (
               <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] flex items-center justify-center text-white text-[10px] font-bold shadow-sm border border-gray-100">
                 {(authorName || 'U').charAt(0).toUpperCase()}
               </div>
             )}
             <span className="text-[15px] font-semibold text-gray-900 flex items-center gap-2">
                {authorName}
                <span className="text-gray-300 font-normal text-[10px] mx-1">●</span> 
                <span className="text-gray-500 font-medium text-[13px]">12 min read</span>
             </span>
           </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full p-5 border border-[#E9E9E9] rounded-[20px] shadow-[0_4px_24px_-8px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_32px_-8px_rgba(0,0,0,0.1)] transition-all bg-white group relative mb-10">
      <Link href={`/posts/${post.id}`} className="absolute inset-0 z-10 block"></Link>

      {canModify && (
        <div ref={menuRef} className="absolute top-4 right-4 z-30 pointer-events-auto">
          <button
            type="button"
            onClick={toggleMenu}
            className="p-2 rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-900 transition-colors"
            aria-label="Post actions"
          >
            <span className="text-xl leading-none">⋮</span>
          </button>
          {isMenuOpen && (
            <div className="absolute right-0 mt-2 w-32 bg-white border border-gray-100 rounded-md shadow-md z-20 overflow-hidden">
              <button
                type="button"
                onClick={handleEdit}
                className="block w-full px-4 py-2 text-left text-sm hover:bg-gray-50"
              >
                Edit
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="block w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-50"
              >
                Delete
              </button>
            </div>
          )}
        </div>
      )}

      <div className="relative z-20 pointer-events-none">
        <div className="text-[11px] font-bold text-gray-500 uppercase tracking-[0.06em] mb-3 flex items-center gap-2">
          <span className="text-gray-800">Technology</span>
          <span className="text-gray-300 font-normal font-sans">/</span>
          <span>{dateStr}</span>
        </div>

        <h3 className="text-[28px] md:text-[32px] font-serif font-extrabold text-gray-900 leading-[1.15] mb-4 group-hover:text-[#0A4BB5] transition-colors tracking-tight">
          {post.title}
        </h3>

        <div className="flex flex-col md:flex-row items-start gap-6">
          {summaryText && (
            <div className="flex-1 min-w-0 bg-[#FAF9F7] rounded-xl p-4 md:p-5 relative border border-gray-100">
              <span className="text-[11px] font-extrabold text-[#0A4BB5] tracking-widest uppercase mr-4 block mb-2">
                AI SUMMARY
              </span>
              <span
                className="text-[16px] md:text-[17px] font-serif italic text-gray-800 leading-[1.75] text-left break-words block"
                style={
                  isSummaryExpanded
                    ? undefined
                    : { overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 4, WebkitBoxOrient: 'vertical' }
                }
              >
                {summaryText}
              </span>
              {shouldShowMore && (
                <button
                  type="button"
                  onClick={handleShowMore}
                  className="pointer-events-auto relative z-30 mt-3 text-[10px] font-bold text-[#0A4BB5] tracking-widest uppercase hover:text-[#083b8f]"
                >
                  {isSummaryExpanded ? 'Show less' : 'Show more'}
                </button>
              )}
            </div>
          )}

          <div className="w-full md:w-[260px] h-[200px] md:h-[180px] bg-gray-100 rounded-md overflow-hidden flex-shrink-0 shadow-sm pointer-events-none relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imgUrl}
              className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700 ease-out origin-center"
              alt={post.title}
            />
          </div>
        </div>

        <div className="flex items-center justify-between mt-5 pt-4">
          <span className="text-[18px] md:text-[19px] font-semibold text-gray-900">
            {authorName}
          </span>
          <button
            onClick={handleLike}
            className={`flex items-center gap-2.5 px-4 py-2 rounded-full hover:bg-red-50 hover:scale-105 transition-all pointer-events-auto z-30 relative font-semibold tracking-wide text-[16px] ${
              isLiked ? 'text-red-500 bg-red-50' : 'text-gray-500'
            }`}
          >
            <svg
              className={`w-6 h-6 transition-transform ${isLiked ? 'scale-110' : ''}`}
              viewBox="0 0 24 24"
              fill={isLiked ? 'currentColor' : 'none'}
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
            {likeCount}
          </button>
        </div>
      </div>
    </div>
  );
}
