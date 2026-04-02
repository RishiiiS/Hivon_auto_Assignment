'use client';

import { useState } from 'react';

function timeAgo(dateStr) {
  if (!dateStr) return '';
  const now = new Date();
  const then = new Date(dateStr);
  const diffMs = now - then;
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
}

export default function Comment({ comment, ThumbUpIcon, onReply, onDelete, currentUserId, depth = 0 }) {
  const [isReplying, setIsReplying] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [localLikes, setLocalLikes] = useState(comment.likes || 0);
  const [liked, setLiked] = useState(false);

  const handleLike = () => {
    setLiked(!liked);
    setLocalLikes(prev => liked ? prev - 1 : prev + 1);
  };

  const handleReplySubmit = () => {
    if (!replyText.trim()) return;
    if (onReply) onReply(comment.id, replyText.trim());
    setReplyText('');
    setIsReplying(false);
  };

  return (
    <div className={depth > 0 ? 'ml-10 md:ml-14 pl-4 border-l border-gray-100' : ''}>
      <div className="flex gap-3">
        {/* Avatar */}
        <div
          className="flex-shrink-0 rounded-full flex items-center justify-center text-white font-semibold text-xs"
          style={{
            width: depth > 0 ? 32 : 40,
            height: depth > 0 ? 32 : 40,
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
          }}
        >
          {(comment.user_name || 'A').charAt(0).toUpperCase()}
        </div>

        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="font-semibold text-gray-900 text-sm">{comment.user_name || 'Anonymous'}</span>
            <span className="text-xs text-gray-400">{timeAgo(comment.created_at)}</span>
            {currentUserId === comment.user_id && onDelete && (
              <button
                onClick={() => onDelete(comment.id)}
                className="ml-auto text-xs text-red-400 hover:text-red-600 transition-colors"
              >
                Delete
              </button>
            )}
          </div>

          {/* Body */}
          <p className="text-sm text-gray-700 leading-relaxed mb-2">{comment.comment_text}</p>

          {/* Actions */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsReplying(!isReplying)}
              className="text-xs text-gray-400 font-medium hover:text-gray-700 transition-colors"
            >
              Reply
            </button>
            <button
              onClick={handleLike}
              className={`flex items-center gap-1 text-xs font-medium transition-colors ${liked ? 'text-blue-600' : 'text-gray-400 hover:text-gray-700'}`}
            >
              {ThumbUpIcon && <ThumbUpIcon />}
              <span>{localLikes}</span>
            </button>
          </div>

          {/* Reply input */}
          {isReplying && (
            <div className="mt-3 flex flex-col gap-2">
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Write a reply…"
                rows={2}
                className="w-full text-sm bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-400 resize-none"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleReplySubmit}
                  className="px-4 py-1.5 rounded-full text-xs font-semibold bg-blue-700 text-white hover:bg-blue-800 transition-colors"
                >
                  Reply
                </button>
                <button
                  onClick={() => { setIsReplying(false); setReplyText(''); }}
                  className="px-4 py-1.5 rounded-full text-xs font-semibold text-gray-500 hover:text-gray-800 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Nested replies */}
          {comment.replies && comment.replies.length > 0 && (
            <div className="mt-5 flex flex-col gap-5">
              {comment.replies.map(reply => (
                <Comment
                  key={reply.id}
                  comment={reply}
                  ThumbUpIcon={ThumbUpIcon}
                  onReply={onReply}
                  onDelete={onDelete}
                  currentUserId={currentUserId}
                  depth={depth + 1}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
