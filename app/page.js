'use client';

import { useFetch } from '@/hooks/useFetch';
import PostList from '@/components/post/PostList';
import Link from 'next/link';

export default function Home() {
  const { data, loading, error } = useFetch('/posts/list');

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-5xl mx-auto pb-10 bg-[#FCFBFA]">
      
      {loading && <p className="text-gray-500 animate-pulse py-32 font-medium">Curating the archive...</p>}
      
      {error && <p className="text-red-500 bg-red-50 p-4 rounded-md w-full text-center border border-red-200 mt-10">{error}</p>}
      
      {data?.posts && (
        <div className="w-full mt-8">
          <PostList posts={data.posts} />
        </div>
      )}

    </div>
  );
}
