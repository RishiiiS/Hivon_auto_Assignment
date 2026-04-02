'use client';

import { useState } from 'react';

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

function Comment({ comment, depth = 0 }) {
  const [replying, setReplying]     = useState(false);
  const [replyText, setReplyText]   = useState('');
  const [likes, setLikes]           = useState(comment.likes || 0);
  const [liked, setLiked]           = useState(false);

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
            {comment.user_name || 'Anonymous'}
          </span>
          <span style={{ fontSize:'0.78rem', color:'#9ca3af', fontFamily:FONT_SANS }}>
            {timeAgo(comment.created_at)}
          </span>
        </div>

        {/* Text */}
        <p style={{ fontSize:'0.9rem', color:'#374151', lineHeight:1.65, marginBottom:8, marginTop:0, fontFamily:FONT_SANS }}>
          {comment.comment_text}
        </p>

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
              <Comment key={r.id} comment={r} depth={depth + 1} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function CommentSection({ postId, comments = [] }) {
  const [newComment, setNewComment] = useState('');
  const [local, setLocal]           = useState(comments);

  const publish = () => {
    if (!newComment.trim()) return;
    setLocal(prev => [{
      id: `d-${Date.now()}`,
      user_name: 'You',
      comment_text: newComment.trim(),
      created_at: new Date().toISOString(),
      likes: 0,
    }, ...prev]);
    setNewComment('');
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
      {local.length === 0 ? (
        <p style={{ fontSize:'0.875rem', color:'#9ca3af', fontFamily:FONT_SANS }}>No comments yet. Be the first!</p>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:28 }}>
          {local.map(c => <Comment key={c.id} comment={c} />)}
        </div>
      )}
    </div>
  );
}
