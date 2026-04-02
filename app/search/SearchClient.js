'use client';

import { useSearchParams } from 'next/navigation';
import { useFetch } from '@/hooks/useFetch';
import PostList from '@/components/post/PostList';

export default function SearchClient() {
  const searchParams = useSearchParams();
  const query = searchParams.get('query') || '';

  const { data, loading, error } = useFetch(
    `/posts/search?query=${encodeURIComponent(query)}`
  );

  return (
    <div className="space-y-6 flex flex-col py-10 w-full max-w-[1100px]">
      <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight text-center">
        Search Results for &quot;{query}&quot;
      </h1>

      {loading && (
        <p className="text-gray-500 animate-pulse mt-10">
          Searching the archives...
        </p>
      )}
      {error && (
        <p className="text-red-500 bg-red-50 p-4 rounded-md w-full text-center border border-red-200 mt-6">
          {error}
        </p>
      )}

      {data?.posts && (
        <div className="w-full mt-6">
          <PostList posts={data.posts} />
        </div>
      )}
    </div>
  );
}

