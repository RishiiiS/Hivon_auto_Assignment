import Card from '@/components/ui/Card';
import Link from 'next/link';

export default function PostCard({ post }) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <div className="p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-2">
          {post.title}
        </h2>
        {post.summary && (
          <p className="text-gray-600 mb-4 line-clamp-3">
            {post.summary}
          </p>
        )}
        <div className="flex items-center justify-between text-sm text-gray-500">
          <span>By Author {post.author_id.substring(0,6)}</span>
          <Link href={`/posts/${post.id}`} className="text-blue-600 hover:text-blue-800 font-medium">
            Read more &rarr;
          </Link>
        </div>
      </div>
    </Card>
  );
}
