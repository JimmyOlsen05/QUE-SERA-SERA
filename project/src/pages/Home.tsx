import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import CreateForumPost from '../components/Forum/CreateForumPost';
import ForumPost from '../components/Forum/ForumPost';
import type { Forum, Profile } from '../types/database.types';
import { useNavigate } from 'react-router-dom';
import testEmail from '../utils/testEmail';

export default function Home() {
  const [forums, setForums] = useState<(Forum & { profiles: Profile })[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchForums = async () => {
    try {
      const { data, error } = await supabase
        .from('forum_posts')
        .select(`
          *,
          profiles (
            id,
            username,
            avatar_url
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setForums(data || []);
    } catch (error) {
      console.error('Error fetching forums:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePostClick = (userId: string) => {
    navigate(`/dashboard/forum/user/${userId}`);
  };

  const handleTestEmail = async () => {
    try {
      await testEmail();
      alert('Email sent successfully!');
    } catch (error) {
      alert('Failed to send email: ' + (error as Error).message);
    }
  };

  useEffect(() => {
    fetchForums();
  }, []);

  return (
    <div className="px-4 py-8 mx-auto max-w-4xl">
      <CreateForumPost onPostCreated={fetchForums} />
      <button 
        onClick={handleTestEmail}
        className="mb-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
      >
        Test Email
      </button>

      {loading ? (
        <div className="py-8 text-center">
          <div className="mx-auto w-12 h-12 rounded-full border-b-2 border-blue-600 animate-spin"></div>
        </div>
      ) : forums.length > 0 ? (
        <div className="space-y-6">
          {forums.map((forum) => (
            <div key={forum.id} onClick={() => handlePostClick(forum.user_id)} className="cursor-pointer">
              <ForumPost
                post={{
                  ...forum,
                  share_count: 0,
                  author: {
                    id: forum.profiles.id,
                    username: forum.profiles.username,
                    avatar_url: forum.profiles.avatar_url || ''
                  }
                }}
                onDelete={fetchForums}
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="py-8 text-center text-gray-500">
          No forums found.
        </div>
      )}
    </div>
  );
}