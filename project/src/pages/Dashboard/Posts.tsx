import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import ForumPost from '../../components/Forum/ForumPost';

export default function Posts() {
  const [posts, setPosts] = useState<any[]>([]);

  useEffect(() => {
    fetchPosts();
  }, []);

  async function fetchPosts() {
    try {
      const { data, error } = await supabase
        .from('forum_posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPosts(data || []);
    } catch (error) {
      console.error('Error fetching posts:', error);
    }
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Forum Posts</h2>
      <div className="space-y-4">
        {posts.map((post) => (
          <ForumPost 
            key={post.id} 
            post={post}
            onDelete={() => fetchPosts()} 
          />
        ))}
      </div>
    </div>
  );
}
