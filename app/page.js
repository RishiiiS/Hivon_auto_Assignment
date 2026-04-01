'use client';

import { useFetch } from '@/hooks/useFetch';
import PostList from '@/components/post/PostList';

export default function Home() {
  const { data, loading, error } = useFetch('/posts/list');

  return (
    <div className="space-y-6 flex flex-col items-center justify-center py-10 w-full max-w-4xl mx-auto">
      <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight text-center">
        Latest Posts
      </h1>
      
      {loading && <p className="text-gray-500 animate-pulse">Loading amazing content...</p>}
      {error && <p className="text-red-500 bg-red-50 p-4 rounded-md w-full text-center border border-red-200">{error}</p>}
      
      {data?.posts && (
        <div className="w-full">
          <PostList posts={data.posts} />
        </div>
      )}
    </div>
  );
}
