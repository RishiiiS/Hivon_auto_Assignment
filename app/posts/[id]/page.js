'use client';

import { useParams, useRouter } from 'next/navigation';
import { useFetch } from '@/hooks/useFetch';
import CommentSection from '@/components/comment/CommentSection';
import { useEffect, useMemo, useState } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';

// ---- SVG Icons ----
const ArrowLeftIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6" />
  </svg>
);
const ShareIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
  </svg>
);
const ThumbUpIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14z"/>
    <path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/>
  </svg>
);
const ChatIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
  </svg>
);
const BookmarkIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
  </svg>
);
const DotsIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/>
  </svg>
);
const HomeIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
  </svg>
);
const SearchIcon2 = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
);
const UserIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
  </svg>
);

// ---- Helpers ----
function formatDate(d) {
  if (!d) return '';
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}
function readTime(text = '') {
  return Math.max(1, Math.round(text.trim().split(/\s+/).length / 200));
}

// ---- Shared style tokens ----
const FONT_SERIF = "'Playfair Display', Georgia, 'Times New Roman', serif";
const FONT_SANS  = "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
const BG         = '#f5f5f0';
const COL_MAX    = 900;

export default function PostDetailPage() {
  const { id } = useParams();
  const router  = useRouter();
  const { data, loading, error } = useFetch(`/posts/${id}`);
  const { data: commentsData }   = useFetch(`/comments/list?post_id=${id}`);
  const { user: currentUser, loading: authLoading } = useAuth();

  const [likeCount, setLikeCount] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [isSummaryExpanded, setIsSummaryExpanded] = useState(false);
  const [purifier, setPurifier] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    import('dompurify')
      .then((mod) => {
        const createDOMPurify = mod.default;
        const instance = createDOMPurify?.sanitize ? createDOMPurify : createDOMPurify(window);
        if (!cancelled) setPurifier(instance);
      })
      .catch(() => {
        if (!cancelled) setPurifier(null);
      });
    return () => { cancelled = true; };
  }, []);

  const safeBodyHtml = useMemo(() => {
    const html = data?.post?.body || '';
    if (!html) return '';
    if (purifier?.sanitize) return purifier.sanitize(html);
    const text = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    return text ? `<p>${text}</p>` : '';
  }, [purifier, data?.post?.body]);

  useEffect(() => {
    if (!isMenuOpen) return;
    const handleDocMouseDown = (event) => {
      const target = event.target;
      if (!(target instanceof HTMLElement)) return;
      if (target.closest('[data-post-menu]')) return;
      setIsMenuOpen(false);
    };
    document.addEventListener('mousedown', handleDocMouseDown);
    return () => document.removeEventListener('mousedown', handleDocMouseDown);
  }, [isMenuOpen]);

  useEffect(() => {
    let isMounted = true;
    async function fetchLikes() {
      try {
        const { count, liked } = await api.get(`/likes/summary?postId=${id}`);
        if (isMounted) {
          setLikeCount(count || 0);
          setIsLiked(liked || false);
        }
      } catch (err) {
        console.error('Error fetching likes:', err);
      }
    }
    if (id) fetchLikes();
    return () => { isMounted = false; };
  }, [id]);

  const handleLike = async () => {
    const prevLiked = isLiked;
    const prevCount = likeCount;
    setIsLiked(!prevLiked);
    setLikeCount(prevLiked ? Math.max(0, prevCount - 1) : prevCount + 1);

    try {
      const response = await api.post('/likes/toggle', { postId: id });
      if (response && response.message) {
        setIsLiked(response.liked);
      } else if (response && response.error) {
        throw new Error(response.error);
      }
    } catch (err) {
      console.error('Like toggle failed:', err);
      setIsLiked(prevLiked);
      setLikeCount(prevCount);
    }
  };

  // Hide global navbar + reset main layout for this page
  useEffect(() => {
    const navbar = document.querySelector('nav');
    const main   = document.querySelector('main');
    const footer = document.querySelector('#global-footer');
    const body   = document.body;
    if (navbar) navbar.style.display  = 'none';
    if (main)   { main.style.maxWidth = 'none'; main.style.padding = '0'; }
    if (footer) footer.style.display  = 'none';
    body.style.paddingTop = '0';
    body.style.background = BG;
    return () => {
      if (navbar) navbar.style.display  = '';
      if (main)   { main.style.maxWidth = ''; main.style.padding = ''; }
      if (footer) footer.style.display  = '';
      body.style.paddingTop = '';
      body.style.background = '';
    };
  }, []);

  if (loading || authLoading) return (
    <div style={{ position:'fixed', inset:0, display:'flex', alignItems:'center', justifyContent:'center', background:BG, fontFamily:FONT_SANS }}>
      <span style={{ color:'#9ca3af', fontSize:'0.9rem' }}>Loading article…</span>
    </div>
  );
  if (error || !data?.post) return (
    <div style={{ position:'fixed', inset:0, display:'flex', alignItems:'center', justifyContent:'center', background:BG, fontFamily:FONT_SANS }}>
      <div style={{ textAlign:'center' }}>
        <p style={{ fontSize:'1.2rem', fontWeight:700, color:'#111', marginBottom:8 }}>Post not found</p>
        <button onClick={() => router.back()} style={{ color:'#2563eb', fontSize:'0.875rem', background:'none', border:'none', cursor:'pointer', textDecoration:'underline' }}>Go back</button>
      </div>
    </div>
  );

  const post     = data.post;
  const mins     = readTime(post.body);
  const comments = commentsData?.comments || [];
  const authorId = post.userId ?? post.author_id ?? post.user_id ?? post.users?.id;
  const isAuthor =
    authorId != null && currentUser?.id != null && String(authorId) === String(currentUser.id);
  const isAdmin = currentUser?.role === 'admin';
  const canModify = Boolean(currentUser && (isAuthor || isAdmin));

  const handleEdit = () => router.push(`/edit/${post.id}`);
  const handleDelete = async () => {
    if (!confirm('Delete this post?')) return;
    const res = await api.delete(`/posts/${post.id}`);
    if (res?.error) {
      alert(res.error);
      return;
    }
    router.push('/');
  };

  return (
    <div style={{ position:'fixed', inset:0, display:'flex', flexDirection:'column', background:BG, fontFamily:FONT_SANS, overflow:'hidden' }}>

      {/* ========= NAVBAR ========= */}
      <header style={{
        flexShrink: 0,
        background: BG,
        borderBottom: '1px solid #e2e2dc',
        height: 56,
        display: 'flex',
        alignItems: 'center',
        padding: '0 24px',
        gap: 12,
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}>
        {/* Back */}
        <button
          onClick={() => router.back()}
          style={{ background:'none', border:'none', cursor:'pointer', color:'#374151', display:'flex', alignItems:'center', padding:'4px 6px 4px 0', flexShrink:0 }}
          aria-label="Back"
        >
          <ArrowLeftIcon />
        </button>

        {/* Brand */}
        <span style={{ fontFamily:FONT_SERIF, fontWeight:700, fontSize:'1.125rem', color:'#111', letterSpacing:'-0.01em', marginRight:'auto' }}>
          The Archive
        </span>

        {/* Desktop nav links — hidden ≤640px via inline media trick */}
        <nav className="archive-desktop-nav" style={{ display:'flex', alignItems:'center', gap:24 }}>
          {['About','Membership','Write'].map(l => (
            <a key={l} href="#" style={{ fontSize:'0.875rem', color:'#6b7280', textDecoration:'none', fontWeight:500 }}>{l}</a>
          ))}
        </nav>

        {/* Share + avatar */}
        <div style={{ display:'flex', alignItems:'center', gap:12, marginLeft:16 }}>
          <button style={{ background:'none', border:'none', cursor:'pointer', color:'#6b7280', display:'flex' }}>
            <ShareIcon />
          </button>
          <div style={{
            width:34, height:34, borderRadius:'50%',
            background:'linear-gradient(135deg,#4f46e5,#7c3aed)',
            color:'#fff', fontWeight:700, fontSize:'0.85rem',
            display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0,
          }}>A</div>
        </div>
      </header>

      {/* ========= SCROLLABLE BODY ========= */}
      <div style={{ flex:1, overflowY:'auto', WebkitOverflowScrolling:'touch' }}>
        <div style={{ maxWidth:COL_MAX, margin:'0 auto', padding:'44px 24px 44px' }}>

          {/* Category */}
          <p style={{ fontSize:'0.69rem', fontWeight:700, letterSpacing:'0.14em', textTransform:'uppercase', color:'#2563eb', marginBottom:14, marginTop:0 }}>
            {post.category || 'Article'}
          </p>

          {/* Title */}
          <h1 style={{
            fontFamily: FONT_SERIF,
            fontSize: 'clamp(2rem, 5vw, 3rem)',
            fontWeight: 900,
            lineHeight: 1.07,
            letterSpacing: '-0.01em',
            color: '#0f0f0f',
            margin: '0 0 28px',
          }}>
            {post.title}
          </h1>

          {/* Author row */}
          <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:36 }}>
            {/* Avatar */}
            <div style={{
              width:44, height:44, borderRadius:'50%', flexShrink:0,
              background:'linear-gradient(135deg,#f59e0b,#ef4444)',
              color:'#fff', fontWeight:700, fontSize:'1.1rem',
              display:'flex', alignItems:'center', justifyContent:'center',
            }}>
              {(post.users?.name || 'User').charAt(0).toUpperCase()}
            </div>
            {/* Meta */}
            <div style={{ flex:1, minWidth:0 }}>
              <div className="flex items-center gap-8 flex-wrap mb-2">
                <span className="font-semibold text-[0.88rem] text-gray-900">
                  {post.users?.name || 'User'}
                </span>
                <span style={{ fontSize:'0.78rem', fontWeight:600, color:'#2563eb', cursor:'pointer' }}>Follow</span>
              </div>
              <p style={{ fontSize:'0.78rem', color:'#9ca3af', margin:0 }}>
                {mins} min read &nbsp;·&nbsp; {formatDate(post.created_at)}
              </p>
            </div>
            {/* Dots */}
            {canModify && (
              <div data-post-menu style={{ position: 'relative', marginLeft: 'auto', flexShrink: 0 }}>
                <button
                  onClick={() => setIsMenuOpen((v) => !v)}
                  style={{ background:'none', border:'none', cursor:'pointer', color:'#9ca3af', display:'flex', padding: 6, borderRadius: 9999 }}
                  aria-label="Post actions"
                >
                  <DotsIcon />
                </button>
                {isMenuOpen && (
                  <div style={{
                    position: 'absolute',
                    right: 0,
                    top: '100%',
                    marginTop: 8,
                    width: 140,
                    background: '#fff',
                    border: '1px solid #e5e7eb',
                    borderRadius: 10,
                    boxShadow: '0 12px 30px rgba(0,0,0,0.08)',
                    overflow: 'hidden',
                    zIndex: 50,
                  }}>
                    <button
                      onClick={() => { setIsMenuOpen(false); handleEdit(); }}
                      style={{ width: '100%', padding: '10px 12px', textAlign: 'left', fontSize: 13, fontWeight: 600, color: '#111', background: 'none', border: 'none', cursor: 'pointer' }}
                      onMouseDown={(e) => e.preventDefault()}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => { setIsMenuOpen(false); handleDelete(); }}
                      style={{ width: '100%', padding: '10px 12px', textAlign: 'left', fontSize: 13, fontWeight: 700, color: '#dc2626', background: 'none', border: 'none', cursor: 'pointer', borderTop: '1px solid #f3f4f6' }}
                      onMouseDown={(e) => e.preventDefault()}
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Featured Image */}
          {post.image_url && (
            <figure style={{ margin:'0 0 12px' }}>
              <img
                src={post.image_url}
                alt={post.title}
                style={{ width:'100%', height:'auto', maxHeight:480, objectFit:'cover', display:'block' }}
              />
              {post.image_caption && (
                <figcaption style={{ textAlign:'center', fontSize:'0.75rem', color:'#9ca3af', fontStyle:'italic', marginTop:8, lineHeight:1.5 }}>
                  {post.image_caption}
                </figcaption>
              )}
            </figure>
          )}

          {/* AI Summary */}
          {post.summary && (
            <div style={{
              borderLeft:'4px solid #2563eb', background:'#eff6ff', borderRadius:'0 6px 6px 0',
              padding:'14px 18px', margin:'28px 0',
            }}>
              <p style={{ fontSize:'0.78rem', fontWeight:700, color:'#1e40af', marginBottom:6, display:'flex', alignItems:'center', gap:6 }}>
                ✨ AI Summary
              </p>
              <p style={{ fontSize:'0.88rem', color:'#1e3a8a', fontStyle:'italic', lineHeight:1.65, margin:0 }}>
                {isSummaryExpanded ? post.summary : (post.summary.length > 200 ? post.summary.slice(0, 200) + '...' : post.summary)}
              </p>
              {post.summary.length > 200 && (
                <button
                  onClick={() => setIsSummaryExpanded(!isSummaryExpanded)}
                  style={{
                    marginTop: '8px',
                    background: 'none',
                    border: 'none',
                    color: '#2563eb',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    padding: 0,
                    textDecoration: 'underline'
                  }}
                >
                  {isSummaryExpanded ? 'Show less' : 'Show more'}
                </button>
              )}
            </div>
          )}

          {/* Body */}
          <article style={{
            fontSize: '1.0625rem',
            lineHeight: 1.85,
            color: '#1a1a1a',
            marginBottom: 40,
          }}>
            <style>{`
              .archive-body > p:first-of-type::first-letter {
                font-family: ${FONT_SERIF};
                font-size: 4.2rem;
                font-weight: 700;
                float: left;
                line-height: 0.72;
                margin-right: 0.06em;
                margin-top: 0.1em;
                color: #1e3a8a;
              }
              .archive-body p { margin-bottom: 1.4em; }
              @media (max-width: 640px) {
                .archive-desktop-nav { display: none !important; }
              }
            `}</style>
            <div
              className="archive-body prose max-w-none"
              dangerouslySetInnerHTML={{ __html: safeBodyHtml || '' }}
            />
          </article>

          {/* ---- Action bar ---- */}
          <div style={{
            display:'flex', alignItems:'center', justifyContent:'space-between',
            borderTop:'1px solid #e2e2dc', borderBottom:'1px solid #e2e2dc',
            padding:'14px 0', marginBottom:52,
          }}>
            <div style={{ display:'flex', alignItems:'center', gap:20 }}>
              <button 
                onClick={handleLike}
                style={{ display:'flex', alignItems:'center', gap:5, background:'none', border:'none', cursor:'pointer', color: isLiked ? '#ef4444' : '#6b7280', fontSize:'0.85rem', padding:0, transition: 'color 0.2s' }}
              >
                <div style={{ transform: isLiked ? 'scale(1.1)' : 'none', transition: 'transform 0.2s' }}>
                  <ThumbUpIcon fill={isLiked ? "currentColor" : "none"} />
                </div>
                <span style={{ fontWeight: isLiked ? 600 : 400 }}>{likeCount}</span>
              </button>
              
              <button style={{ display:'flex', alignItems:'center', gap:5, background:'none', border:'none', cursor:'pointer', color:'#6b7280', fontSize:'0.85rem', padding:0 }}>
                <ChatIcon /><span>{comments.length}</span>
              </button>
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:16 }}>
              {[<BookmarkIcon key="b"/>, <ShareIcon key="s"/>].map((icon, i) => (
                <button key={i} style={{ background:'none', border:'none', cursor:'pointer', color:'#6b7280', display:'flex', padding:0 }}>{icon}</button>
              ))}
            </div>
          </div>

          {/* ---- Comments ---- */}
          <section style={{ marginBottom:56 }}>
            <h2 style={{ fontFamily:FONT_SERIF, fontWeight:700, fontSize:'1.25rem', color:'#111', marginBottom:24, marginTop:0 }}>
              Comments
            </h2>
            <CommentSection postId={id} comments={comments} postAuthorId={post?.author_id} />
          </section>

          {/* ---- Footer ---- */}
          <footer style={{ borderTop:'1px solid #e2e2dc', paddingTop:32, display:'flex', flexWrap:'wrap', alignItems:'center', gap:'10px 24px' }}>
            <span style={{ fontFamily:FONT_SERIF, fontWeight:700, fontSize:'1rem', color:'#111', flex:'1 0 auto' }}>
              The Editorial Archive
            </span>
            <nav style={{ display:'flex', alignItems:'center', gap:16 }}>
              {['About','Membership','Write','Help'].map(l => (
                <a key={l} href="#" style={{ fontSize:'0.8rem', color:'#6b7280', textDecoration:'none' }}>{l}</a>
              ))}
            </nav>
            <span style={{ fontSize:'0.75rem', color:'#9ca3af', flex:'1 0 100%' }}>
              © 2024 The Editorial Archive. Designed for the Digital Curator.
            </span>
          </footer>
        </div>
      </div>

      {/* ========= MOBILE BOTTOM TAB BAR ========= */}
      <div className="archive-mobile-tabs" style={{
        display:'flex', justifyContent:'space-around', alignItems:'center',
        background:'#fff', borderTop:'1px solid #e5e7eb',
        padding:'8px 0', flexShrink:0,
      }}>
        <style>{`
          .archive-mobile-tabs {
            display: flex;
          }
          @media (min-width: 640px) {
            .archive-mobile-tabs { display: none !important; }
          }
        `}</style>
        {[
          { icon:<HomeIcon />, label:'HOME',      active:false, action:() => router.push('/') },
          { icon:<SearchIcon2 />, label:'SEARCH',    active:false, action:()=>{} },
          { icon:<BookmarkIcon />, label:'BOOKMARKS', active:false, action:()=>{} },
          { icon:<UserIcon />, label:'PROFILE',   active:true,  action:()=>{} },
        ].map(({ icon, label, active, action }) => (
          <button
            key={label}
            onClick={action}
            style={{
              display:'flex', flexDirection:'column', alignItems:'center', gap:3,
              background:'none', border:'none', cursor:'pointer',
              color: active ? '#2563eb' : '#9ca3af',
              fontSize:9, fontWeight:600, letterSpacing:'0.05em',
              padding:'4px 12px',
            }}
          >
            {icon}
            <span>{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
