'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import Link from 'next/link';

export default function AdminPostsPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadPosts = async () => {
    try {
      const data = await api.get('/posts/list?limit=100'); // We'll just fetch recent 100 for now
      if (data.error) {
        setError(data.error);
      } else {
        setPosts(data.posts || []);
      }
    } catch (err) {
      setError(err.message || 'Failed to load posts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPosts();
  }, []);

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this post? This cannot be undone.')) return;
    
    const res = await api.delete(`/posts/${id}`);
    if (res.error) {
      alert(res.error);
      return;
    }
    
    setPosts(posts.filter((p) => p.id !== id));
  };

  return (
    <div className="max-w-5xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Manage Posts</h1>
      
      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-md mb-6 border border-red-100">
          {error}
        </div>
      )}

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-6 text-gray-500 text-sm">Loading posts...</div>
        ) : posts.length === 0 ? (
          <div className="p-6 text-gray-500 text-sm">No posts found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-50 text-gray-700 font-semibold border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4">Title</th>
                  <th className="px-6 py-4">Author</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {posts.map((post) => (
                  <tr key={post.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900 max-w-[300px] truncate">
                        {post.title}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {post.users?.name || post.author_id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {new Date(post.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right whitespace-nowrap space-x-3">
                      <Link 
                        href={`/posts/${post.id}`}
                        target="_blank"
                        className="text-[#0A4BB5] hover:underline font-medium"
                      >
                        View
                      </Link>
                      <button
                        onClick={() => handleDelete(post.id)}
                        className="text-red-600 hover:text-red-800 font-medium"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
