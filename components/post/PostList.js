import PostCard from './PostCard';
import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { api } from '@/lib/api';

export default function PostList({ posts = [] }) {
  const { user } = useAuth();
  const [items, setItems] = useState(posts);
  const idsKey = items.map((p) => p?.id).filter(Boolean).join(',');

  useEffect(() => {
    setItems(posts);
  }, [posts]);

  useEffect(() => {
    let mounted = true;
    async function loadLikeSummaries() {
      if (!idsKey) return;

      const res = await api.get(`/likes/summary-batch?postIds=${idsKey}`);
      if (!mounted) return;
      if (res?.error) return;

      const counts = res.countsByPostId || {};
      const liked = res.likedByPostId || {};

      setItems((prev) =>
        prev.map((p) => ({
          ...p,
          likeCount: typeof counts[String(p.id)] === 'number' ? counts[String(p.id)] : 0,
          isLiked: Boolean(liked[String(p.id)]),
        }))
      );
    }

    loadLikeSummaries();
    return () => {
      mounted = false;
    };
  }, [idsKey]);

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
