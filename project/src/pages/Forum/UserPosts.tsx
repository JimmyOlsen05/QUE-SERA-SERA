import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import ForumPost from '../../components/Forum/ForumPost';
import { Loader } from 'lucide-react';

interface Post {
  id: string;
  title: string;
  content: string;
  category: string;
  created_at: string;
  user_id: string;
  attachment_url?: string;
  likes: string[];
  profiles: {
    id: string;
    username: string;
    avatar_url: string;
    full_name: string;
    university: string;
    bio: string;
  };
}

export default function UserPosts() {
  const { userId } = useParams();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState('');

  useEffect(() => {
    fetchUserPosts();
  }, [userId]);

  const fetchUserPosts = async () => {
    console.log('Fetching posts for user:', userId);
    try {
      // First, get the username
      const { data: userData, error: userError } = await supabase
        .from('profiles')
        .select('username')
        .eq('id', userId)
        .single();

      if (userError) {
        console.error('Error fetching user profile:', userError);
        throw userError;
      }
      
      if (userData) {
        console.log('Found username:', userData.username);
        setUsername(userData.username);
      }

      // Then fetch all posts by this user
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
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching posts:', error);
        throw error;
      }

      console.log('Found posts:', data?.length || 0);

      // Transform the data to match the Post interface
      const transformedPosts = data.map((post: any) => ({
        ...post,
        profiles: {
          ...post.profiles,
          full_name: post.profiles.full_name || '',
          university: post.profiles.university || '',
          bio: post.profiles.bio || ''
        },
        likes: post.likes.map((like: any) => like.user_id)
      }));

      setPosts(transformedPosts);
    } catch (error) {
      console.error('Error in fetchUserPosts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (postId: string) => {
    try {
      // Start a transaction to ensure all operations complete or none do
      const { error } = await supabase.rpc('delete_forum_post', {
        target_post_id: postId
      });

      if (error) throw error;

      // Remove the deleted post from the state
      setPosts(posts.filter(post => post.id !== postId));
    } catch (error) {
      console.error('Error deleting post:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader className="w-8 h-8 text-indigo-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="px-4 py-8 mx-auto max-w-4xl">
      <h1 className="mb-6 text-2xl font-bold">
        {username ? `${username}'s Posts` : 'User Posts'}
      </h1>
      
      {posts.length === 0 ? (
        <div className="py-8 text-center">
          <p className="text-gray-500">No posts found</p>
        </div>
      ) : (
        <div className="space-y-6">
          {posts.map((post) => (
            <ForumPost
              key={post.id}
              post={{
                ...post,
                share_count: 0,
                author: {
                  id: post.profiles.id,
                  username: post.profiles.username,
                  avatar_url: post.profiles.avatar_url || ''
                }
              }}
              onDelete={() => handleDelete(post.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}