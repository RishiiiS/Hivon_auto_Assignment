'use client';

import { useParams } from 'next/navigation';
import { useFetch } from '@/hooks/useFetch';
import Card from '@/components/ui/Card';
import CommentList from '@/components/comment/CommentList';

export default function PostDetailPage() {
  const { id } = useParams();
  const { data, loading, error } = useFetch(`/posts/${id}`);
  const { data: commentsData } = useFetch(`/comments/list?post_id=${id}`);

  if (loading) return <div className="p-10 text-center animate-pulse text-gray-500">Loading post...</div>;
  if (error || !data?.post) return <div className="p-10 text-center text-red-500 bg-red-50">Post not found.</div>;

  const post = data.post;

  return (
    <div className="max-w-3xl mx-auto py-8">
      <Card className="p-8">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-6">{post.title}</h1>
        
        {post.image_url && (
          <img 
            src={post.image_url} 
            alt={post.title} 
            className="w-full h-auto rounded-lg mb-8 object-cover max-h-[400px]"
          />
        )}
        
        {post.summary && (
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-8 rounded-r-lg">
            <h3 className="font-semibold text-blue-800 mb-1 flex items-center gap-2">
              <span className="text-xl">✨</span> AI Summary
            </h3>
            <p className="text-blue-900 italic">{post.summary}</p>
          </div>
        )}

        <div className="prose prose-lg max-w-none text-gray-800 leading-relaxed mb-10 whitespace-pre-wrap">
          {post.body}
        </div>
        
        <div className="text-sm text-gray-500 border-t pt-6 mt-10 text-right">
          Published by Author {post.author_id.substring(0,8)}
        </div>
      </Card>

      <div className="mt-10">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Comments</h2>
        <CommentList comments={commentsData?.comments || []} />
      </div>
    </div>
  );
}
