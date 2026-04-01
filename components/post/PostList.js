import PostCard from './PostCard';

export default function PostList({ posts = [] }) {
  if (posts.length === 0) {
    return <div className="text-center py-10 text-gray-500">No posts found.</div>;
  }

  return (
    <div className="flex flex-col gap-6">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
}
