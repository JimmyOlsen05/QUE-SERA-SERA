import { useNavigate } from 'react-router-dom';
import CreateForumPost from '../../components/Forum/CreateForumPost';

export default function CreateTopic() {
  const navigate = useNavigate();

  const handlePostCreated = async () => {
    navigate('/dashboard/forum');
  };

  return (
    <div className="space-y-6">
      <div className="flex gap-4 items-center">
        <button
          onClick={() => navigate('/dashboard/forum')}
          className="text-gray-600 hover:text-gray-900"
        >
          ← Back to Forum
        </button>
        <h2 className="text-2xl font-bold">Create New Topic</h2>
      </div>
      
      <CreateForumPost onPostCreated={handlePostCreated} />
    </div>
  );
} 