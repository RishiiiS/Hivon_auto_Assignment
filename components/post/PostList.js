import PostCard from './PostCard';

export default function PostList({ posts = [] }) {
  if (posts.length === 0) {
    return <div className="text-center py-20 text-gray-500 font-medium">No posts found.</div>;
  }

  return (
    <div className="flex flex-col gap-10">
      {posts.map((post, index) => (
        <PostCard key={post.id} post={post} isFeatured={index === 0} />
      ))}
    </div>
  );
}
