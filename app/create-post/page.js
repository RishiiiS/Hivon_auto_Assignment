'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { api } from '@/lib/api';

export default function CreatePostPage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/posts/create', { title, body, image_url: imageUrl });
      router.push('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-8">
      <Card className="p-8">
        <h1 className="text-3xl font-bold mb-6 text-gray-900">Create New Post</h1>
        {error && <div className="mb-6 text-red-600 text-sm p-4 bg-red-50 rounded-md border border-red-100">{error}</div>}
        
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <Input 
            label="Post Title" 
            placeholder="Give your post a catchy title" 
            value={title} 
            onChange={e => setTitle(e.target.value)} 
            required 
            className="text-lg"
          />
          
          <Input 
            label="Cover Image URL (Optional)" 
            type="url" 
            placeholder="https://example.com/image.jpg" 
            value={imageUrl} 
            onChange={e => setImageUrl(e.target.value)} 
          />
          
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700">Content Body</label>
            <textarea
              className="w-full p-4 min-h-[250px] border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="Write your story here... The AI will magically generate a 200-word summary from this text!"
              value={body}
              onChange={e => setBody(e.target.value)}
              required
            ></textarea>
          </div>

          <Button type="submit" disabled={loading} className="w-full py-3 text-lg mt-2">
            {loading ? 'Publishing & Generating AI Summary...' : 'Publish Post'}
          </Button>
        </form>
      </Card>
    </div>
  );
}
