import { useState } from 'react';
import Button from '@/components/ui/Button';

export default function Comment({ comment, onReply, onDelete, currentUserId }) {
  const [isReplying, setIsReplying] = useState(false);
  
  return (
    <div className="p-4 border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors">
      <div className="flex justify-between items-start mb-2">
        <span className="font-semibold text-gray-800">{comment.user_name || 'Anonymous'}</span>
        <span className="text-xs text-gray-400">
          {new Date(comment.created_at).toLocaleDateString()}
        </span>
      </div>
      <p className="text-gray-700 mb-3">{comment.comment_text}</p>
      
      <div className="flex gap-3 text-sm">
        <button 
          onClick={() => setIsReplying(!isReplying)} 
          className="text-blue-600 hover:text-blue-800 font-medium"
        >
          Reply
        </button>
        {currentUserId === comment.user_id && (
          <button 
            onClick={() => onDelete(comment.id)} 
            className="text-red-500 hover:text-red-700 font-medium"
          >
            Delete
          </button>
        )}
      </div>

      {isReplying && (
        <div className="mt-4 pl-4 border-l-2 border-blue-100">
          <textarea 
            className="w-full p-2 border border-gray-300 rounded mb-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            rows="2"
            placeholder="Write a reply..."
          ></textarea>
          <div className="flex gap-2">
            <Button size="sm">Submit Reply</Button>
            <Button size="sm" variant="secondary" onClick={() => setIsReplying(false)}>Cancel</Button>
          </div>
        </div>
      )}
    </div>
  );
}
