'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';

const FONT_SANS = "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";

function timeAgo(dateStr) {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins  = Math.floor(diff / 60000);
  if (mins < 1)  return 'just now';
  if (mins < 60) return `${mins} min${mins > 1 ? 's' : ''} ago`;
  const hrs  = Math.floor(mins / 60);
  if (hrs < 24)  return `${hrs} hour${hrs > 1 ? 's' : ''} ago`;
  const days = Math.floor(hrs / 24);
  return `${days} day${days > 1 ? 's' : ''} ago`;
}

const ThumbUpIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14z"/>
    <path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/>
  </svg>
);

const DotsVerticalIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/>
  </svg>
);

function Comment({ comment, depth = 0, currentUser, postAuthorId, onEdit, onDelete }) {
  const [replying, setReplying]     = useState(false);
  const [replyText, setReplyText]   = useState('');
  const [likes, setLikes]           = useState(comment.likes || 0);
  const [liked, setLiked]           = useState(false);

  const [isEditing, setIsEditing]   = useState(false);
  const [editContent, setEditContent] = useState(comment.comment_text);
  const [menuOpen, setMenuOpen]     = useState(false);

  const isAdmin = currentUser?.role?.toLowerCase() === 'admin';
  const canEdit = isAdmin || comment.user_id === currentUser?.id;
  const canDelete = isAdmin || comment.user_id === currentUser?.id || postAuthorId === currentUser?.id;

  const handleSaveEdit = async () => {
    if (!editContent.trim()) return;
    try {
      await onEdit(comment.id, editContent);
      setIsEditing(false);
    } catch (err) {
      alert('Failed to edit comment: ' + err.message);
      setEditContent(comment.comment_text);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this comment?')) return;
    try {
      await onDelete(comment.id);
    } catch (err) {
      alert('Failed to delete comment: ' + err.message);
    }
  };

  const indentColor = ['#e5e7eb', '#d1d5db', '#c7cdd4'];

  return (
    <div style={{
      display: 'flex',
      gap: 12,
      paddingLeft: depth > 0 ? 0 : 0,
    }}>
      {/* Thread line for nested */}
      {depth > 0 && (
        <div style={{ width:2, background: indentColor[depth] || '#e5e7eb', flexShrink:0, borderRadius:2, marginLeft:8 }} />
      )}

      {/* Avatar */}
      <div style={{
        width: depth > 0 ? 32 : 40,
        height: depth > 0 ? 32 : 40,
        borderRadius: '50%',
        background: depth > 0
          ? 'linear-gradient(135deg,#92400e,#b45309)'
          : 'linear-gradient(135deg,#6366f1,#8b5cf6)',
        color: '#fff',
        fontWeight: 700,
        fontSize: depth > 0 ? '0.75rem' : '0.875rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        fontFamily: FONT_SANS,
      }}>
        {(comment.user_name || 'A').charAt(0).toUpperCase()}
      </div>

      {/* Content */}
      <div style={{ flex:1, minWidth:0 }}>
        {/* Header */}
        <div style={{ display:'flex', alignItems:'center', flexWrap:'wrap', gap:8, marginBottom:4 }}>
          <span style={{ fontWeight:600, fontSize:'0.875rem', color:'#111', fontFamily:FONT_SANS }}>
            {comment.user_name || 'User'}
          </span>
          <span style={{ fontSize:'0.78rem', color:'#9ca3af', fontFamily:FONT_SANS }}>
            {timeAgo(comment.created_at)}
          </span>
        </div>

        {/* Text / Edit Mode */}
        {isEditing ? (
          <div style={{ marginBottom: 12 }}>
            <textarea
              value={editContent}
              onChange={e => setEditContent(e.target.value)}
              rows={2}
              style={{
                width:'100%', resize:'none', fontFamily:FONT_SANS, fontSize:'0.875rem',
                border:'1px solid #2563eb', borderRadius:6, padding:'8px 12px',
                outline:'none', background:'#fff', color:'#374151', lineHeight:1.6,
                boxSizing:'border-box',
              }}
            />
            <div style={{ display:'flex', gap:8, marginTop:6 }}>
              <button
                onClick={handleSaveEdit}
                style={{ padding:'4px 12px', borderRadius:20, background:'#1d4ed8', color:'#fff', fontSize:'0.75rem', fontWeight:600, border:'none', cursor:'pointer' }}
              >
                Save
              </button>
              <button
                onClick={() => { setIsEditing(false); setEditContent(comment.comment_text); }}
                style={{ padding:'4px 12px', borderRadius:20, background:'none', color:'#6b7280', fontSize:'0.75rem', fontWeight:600, border:'none', cursor:'pointer' }}
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <p style={{ fontSize:'0.9rem', color:'#374151', lineHeight:1.65, marginBottom:8, marginTop:0, fontFamily:FONT_SANS }}>
            {comment.comment_text}
          </p>
        )}

        {/* Actions */}
        <div style={{ display:'flex', alignItems:'center', gap:16 }}>
          <button
            onClick={() => setReplying(!replying)}
            style={{ background:'none', border:'none', cursor:'pointer', fontSize:'0.8rem', color:'#6b7280', fontFamily:FONT_SANS, padding:0 }}
          >
            Reply
          </button>
          <button
            onClick={() => { setLiked(!liked); setLikes(n => liked ? n - 1 : n + 1); }}
            style={{
              display:'flex', alignItems:'center', gap:4, background:'none', border:'none',
              cursor:'pointer', fontSize:'0.8rem', fontFamily:FONT_SANS, padding:0,
              color: liked ? '#2563eb' : '#6b7280',
            }}
          >
            <ThumbUpIcon />
            <span>{likes}</span>
          </button>

          {/* Role-based actions Dropdown */}
          {(canEdit || canDelete) && (
            <div style={{ position: 'relative' }}>
              <button 
                onClick={() => setMenuOpen(!menuOpen)} 
                style={{ background:'none', border:'none', cursor:'pointer', color:'#6b7280', padding:2, display:'flex', alignItems:'center' }}
              >
                <DotsVerticalIcon />
              </button>
              
              {menuOpen && (
                <div style={{
                  position: 'absolute', top: 24, right: 0,
                  background: '#fff', border: '1px solid #e5e7eb', borderRadius: 6,
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                  zIndex: 50, display: 'flex', flexDirection: 'column', minWidth: 110, overflow: 'hidden'
                }}>
                  {canEdit && (
                    <button 
                      onClick={() => { setIsEditing(true); setMenuOpen(false); }} 
                      style={{ padding: '10px 14px', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.85rem', color: '#111', fontFamily: FONT_SANS, fontWeight: 500, borderBottom: canDelete ? '1px solid #f3f4f6' : 'none' }}
                      onMouseEnter={(e) => e.target.style.background = '#f9fafb'}
                      onMouseLeave={(e) => e.target.style.background = 'none'}
                    >
                      Edit 
                    </button>
                  )}
                  {canDelete && (
                    <button 
                      onClick={() => { handleDelete(); setMenuOpen(false); }} 
                      style={{ padding: '10px 14px', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.85rem', color: '#dc2626', fontFamily: FONT_SANS, fontWeight: 500 }}
                      onMouseEnter={(e) => e.target.style.background = '#fef2f2'}
                      onMouseLeave={(e) => e.target.style.background = 'none'}
                    >
                      Delete
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Reply box */}
        {replying && (
          <div style={{ marginTop:12 }}>
            <textarea
              value={replyText}
              onChange={e => setReplyText(e.target.value)}
              placeholder="Write a reply…"
              rows={2}
              style={{
                width:'100%', resize:'none', fontFamily:FONT_SANS, fontSize:'0.875rem',
                border:'1px solid #e2e2dc', borderRadius:6, padding:'8px 12px',
                outline:'none', background:'#fafaf8', color:'#374151', lineHeight:1.6,
                boxSizing:'border-box',
              }}
            />
            <div style={{ display:'flex', gap:8, marginTop:6 }}>
              <button
                onClick={() => { setReplying(false); setReplyText(''); }}
                style={{
                  padding:'6px 16px', borderRadius:20, background:'#1d4ed8', color:'#fff',
                  fontSize:'0.78rem', fontWeight:600, border:'none', cursor:'pointer', fontFamily:FONT_SANS,
                }}
              >
                Reply
              </button>
              <button
                onClick={() => { setReplying(false); setReplyText(''); }}
                style={{
                  padding:'6px 16px', borderRadius:20, background:'none', color:'#6b7280',
                  fontSize:'0.78rem', fontWeight:600, border:'none', cursor:'pointer', fontFamily:FONT_SANS,
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Nested replies */}
        {comment.replies?.length > 0 && (
          <div style={{ marginTop:20, display:'flex', flexDirection:'column', gap:20 }}>
            {comment.replies.map(r => (
              <Comment 
                key={r.id} comment={r} depth={depth + 1} 
                currentUser={currentUser} postAuthorId={postAuthorId} 
                onEdit={onEdit} onDelete={onDelete} 
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function CommentSection({ postId, comments: initialComments = [], postAuthorId }) {
  const [newComment, setNewComment] = useState('');
  const [local, setLocal]           = useState(initialComments);
  const [loading, setLoading]       = useState(true);
  const { user }                    = useAuth();

  useEffect(() => {
    let isMounted = true;
    
    const fetchComments = async () => {
      setLoading(true);
      try {
        const { comments } = await api.get(`/comments/list?post_id=${postId}`);
          
        if (isMounted && comments) {
           setLocal(comments);
        }
      } catch (err) {
        console.error("Error fetching comments:", err);
        // Fallback to initial if fetch fails
        if (isMounted) setLocal(initialComments);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    
    if (postId) {
       fetchComments();
    }
    
    return () => { isMounted = false; };
  }, [postId, initialComments]);

  const publish = async () => {
    if (!newComment.trim()) return;
    
    const userId = user?.id || '00000000-0000-0000-0000-000000000000'; // Default safety fallback
    
    const tempId = `d-${Date.now()}`;
    const optimisticComment = {
      id: tempId,
      user_id: userId,
      user_name: user?.name || 'You',
      comment_text: newComment.trim(),
      created_at: new Date().toISOString(),
      post_id: postId,
      likes: 0,
    };
    
    setLocal(prev => [optimisticComment, ...prev]);
    const textToInsert = newComment.trim();
    setNewComment('');
    
    try {
      const response = await api.post('/comments/create', {
        post_id: postId,
        comment_text: textToInsert,
      });
        
      if (response && response.comment) {
        setLocal(prev => prev.map(c => c.id === tempId ? { ...c, id: response.comment.id } : c));
      } else if (response.error) {
        throw new Error(response.error);
      }
    } catch (err) {
      console.error(err);
      setLocal(prev => prev.filter(c => c.id !== tempId));
      alert('Failed to publish comment: ' + err.message);
    }
  };

  const handleEdit = async (commentId, newContent) => {
    // Optimistic Update
    const previousState = [...local];
    setLocal(prev => prev.map(c => c.id === commentId ? { ...c, comment_text: newContent } : c));

    const response = await api.put(`/comments/${commentId}`, { comment_text: newContent });
    if (response?.error) {
      setLocal(previousState);
      throw new Error(response.error);
    }
  };

  const handleDelete = async (commentId) => {
    // Optimistic update
    const previousState = [...local];
    setLocal(prev => prev.filter(c => c.id !== commentId));

    const response = await api.delete(`/comments/${commentId}`);
    if (response?.error) {
      setLocal(previousState);
      throw new Error(response.error);
    }
  };

  return (
    <div>
      {/* Input box */}
      <div style={{
        background: '#f9f9f7',
        border: '1px solid #e2e2dc',
        borderRadius: 8,
        padding: '16px 16px 12px',
        marginBottom: 32,
      }}>
        <div style={{ display:'flex', gap:12, alignItems:'flex-start' }}>
          <div style={{
            width:38, height:38, borderRadius:'50%', flexShrink:0,
            background:'linear-gradient(135deg,#4f46e5,#7c3aed)',
            color:'#fff', fontWeight:700, fontSize:'0.875rem',
            display:'flex', alignItems:'center', justifyContent:'center',
            fontFamily:FONT_SANS,
          }}>Y</div>
          <textarea
            value={newComment}
            onChange={e => setNewComment(e.target.value)}
            placeholder="What are your thoughts?"
            rows={3}
            style={{
              flex:1, resize:'none', background:'transparent', border:'none', outline:'none',
              fontSize:'0.9rem', color:'#374151', lineHeight:1.6, fontFamily:FONT_SANS,
            }}
          />
        </div>
        <div style={{ borderTop:'1px solid #e2e2dc', marginTop:10, paddingTop:10, display:'flex', justifyContent:'flex-end' }}>
          <button
            onClick={publish}
            disabled={!newComment.trim()}
            style={{
              padding:'8px 22px', borderRadius:6, fontWeight:600, fontSize:'0.875rem',
              fontFamily:FONT_SANS, border:'none', cursor: newComment.trim() ? 'pointer' : 'not-allowed',
              background: newComment.trim() ? '#1d4ed8' : '#bfdbfe',
              color:'#fff', transition:'background 0.15s',
            }}
          >
            Publish
          </button>
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="flex flex-col gap-6 w-full animate-pulse opacity-60">
           <div className="h-20 bg-gray-100 rounded-md w-full"></div>
           <div className="h-20 bg-gray-100 rounded-md w-full"></div>
        </div>
      ) : local.length === 0 ? (
        <p style={{ fontSize:'0.875rem', color:'#9ca3af', fontFamily:FONT_SANS }}>No comments yet. Be the first!</p>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:28 }}>
          {local.map(c => (
            <Comment 
              key={c.id} comment={c} 
              currentUser={user} postAuthorId={postAuthorId} 
              onEdit={handleEdit} onDelete={handleDelete} 
            />
          ))}
        </div>
      )}
    </div>
  );
}
