import PostCard from './PostCard';
import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';

export default function PostList({ posts = [] }) {
  const { user } = useAuth();
  const [items, setItems] = useState(posts);

  useEffect(() => {
    setItems(posts);
  }, [posts]);

  if (items.length === 0) {
    return <div className="text-center py-20 text-gray-500 font-medium">No posts found.</div>;
  }

  return (
    <div className="flex flex-col gap-10">
      {items.map((post, index) => (
        <PostCard
          key={post.id}
          post={post}
          isFeatured={index === 0}
          currentUser={user}
          onDeleted={(id) => setItems((prev) => prev.filter((p) => p.id !== id))}
        />
      ))}
    </div>
  );
}
