import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import ForumPost from '../../components/Forum/ForumPost';
import type { ForumPostInterface } from '../../components/Forum/ForumPost';

export default function ViewPost() {
  const { postId } = useParams();
  const [post, setPost] = useState<ForumPostInterface | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const { data, error } = await supabase
          .from('forum_posts')
          .select(`
            *,
            profiles (
              id,
              username,
              avatar_url,
              full_name,
              university,
              bio
            ),
            likes:forum_likes (
              user_id
            )
          `)
          .eq('id', postId)
          .single();

        if (error) throw error;

        if (data) {
          setPost({
            ...data,
            share_count: data.share_count || 0,
            author: {
              id: data.profiles.id,
              username: data.profiles.username,
              avatar_url: data.profiles.avatar_url || ''
            }
          });
        }
      } catch (error) {
        console.error('Error fetching post:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [postId]);

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="w-8 h-8 rounded-full border-b-2 border-indigo-600 animate-spin" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="py-8 text-center">
        <h2 className="text-2xl font-bold text-gray-700">Post not found</h2>
        <p className="mt-2 text-gray-500">The post you're looking for doesn't exist or has been deleted.</p>
      </div>
    );
  }

  return (
    <div className="py-8 mx-auto max-w-4xl">
      <ForumPost post={post} />
    </div>
  );
}
