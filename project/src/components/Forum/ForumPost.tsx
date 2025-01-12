import { useState, useEffect, useRef } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { useAuthStore } from '../../store/authStore';
import { supabase } from '../../lib/supabase';
import { MoreVertical, Heart, MessageCircle, Share2, Trash2, FileText, ExternalLink, Image } from 'lucide-react';
import type { Profile } from '../../types/database.types';
import Comments from './Comments';

export interface ForumPostInterface {
  id: string;
  title: string;
  content: string;
  category: string;
  user_id: string;
  created_at: string;
  profiles: Profile;
  attachment_url?: string;
  share_count: number;
  author: {
    id: string;
    username: string;
    avatar_url?: string;
  };
}

interface ForumPostProps {
  post: ForumPostInterface;
  onDelete?: () => void;
  onClick?: () => void;
  showActions?: boolean;
}

interface FileTypeInfo {
  type: string;
  icon: React.ElementType;
  color: string;
  label: string;
}

const MAX_DISPLAY_LENGTH = 300; // Adjust this number to change truncation length

const truncateText = (text: string, maxLength: number) => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
};

const AttachmentPreview = ({ url }: { url: string }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [fileInfo, setFileInfo] = useState<FileTypeInfo>({
    type: 'other',
    icon: FileText,
    color: 'text-gray-500',
    label: 'File'
  });
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    const loadAttachment = async () => {
      if (!url) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setErrorMessage('');
        
        // Get file type info from the URL
        const fileName = url.split('/').pop()?.split('?')[0] || '';
        const fileExtension = fileName.split('.').pop()?.toLowerCase() || '';
        const fileTypeInfo = getFileTypeInfo(fileExtension);
        setFileInfo(fileTypeInfo);
      } catch (error) {
        console.error('Error loading attachment:', error);
        setErrorMessage(error instanceof Error ? error.message : 'Failed to load attachment');
      } finally {
        setIsLoading(false);
      }
    };

    loadAttachment();
  }, [url]);

  if (isLoading) {
    return <div className="w-full h-48 bg-gray-100 rounded-lg animate-pulse"></div>;
  }

  if (errorMessage) {
    return <div className="text-red-500">{errorMessage}</div>;
  }

  if (fileInfo.type === 'image') {
    return (
      <div className="relative">
        {imageError ? (
          <div className="flex justify-center items-center w-full h-48 bg-gray-100 rounded-lg">
            <span className="text-gray-500">Failed to load image</span>
          </div>
        ) : (
          <img
            src={url}
            alt="Attachment"
            onError={() => setImageError(true)}
            className="object-cover w-full h-auto rounded-lg"
          />
        )}
      </div>
    );
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={`flex items-center gap-2 p-4 border rounded-lg hover:bg-gray-50 ${fileInfo.color}`}
    >
      <fileInfo.icon size={24} />
      <span>{fileInfo.label}</span>
      <ExternalLink size={16} className="ml-auto" />
    </a>
  );
};

const getFileTypeInfo = (extension: string): FileTypeInfo => {
  switch (extension.toLowerCase()) {
    case 'pdf':
      return {
        type: 'pdf',
        icon: FileText,
        color: 'text-red-500',
        label: 'PDF Document'
      };
    case 'doc':
    case 'docx':
      return {
        type: 'word',
        icon: FileText,
        color: 'text-blue-600',
        label: 'Word Document'
      };
    case 'xls':
    case 'xlsx':
      return {
        type: 'excel',
        icon: FileText,
        color: 'text-green-600',
        label: 'Excel Spreadsheet'
      };
    case 'ppt':
    case 'pptx':
      return {
        type: 'powerpoint',
        icon: FileText,
        color: 'text-orange-500',
        label: 'PowerPoint Presentation'
      };
    case 'txt':
    case 'rtf':
      return {
        type: 'text',
        icon: FileText,
        color: 'text-gray-600',
        label: 'Text Document'
      };
    case 'zip':
    case 'rar':
    case '7z':
      return {
        type: 'archive',
        icon: FileText,
        color: 'text-purple-500',
        label: 'Archive File'
      };
    case 'jpg':
    case 'jpeg':
    case 'png':
    case 'gif':
    case 'webp':
      return {
        type: 'image',
        icon: Image,
        color: 'text-blue-500',
        label: 'Image'
      };
    default:
      return {
        type: 'other',
        icon: FileText,
        color: 'text-gray-500',
        label: 'File'
      };
  }
};

const PostContent = ({ content }: { content: string }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const shouldTruncate = content.length > MAX_DISPLAY_LENGTH;

  return (
    <div className="mt-2">
      <p className="text-gray-800 whitespace-pre-wrap">
        {isExpanded ? content : truncateText(content, MAX_DISPLAY_LENGTH)}
      </p>
      {shouldTruncate && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="mt-2 text-sm font-medium text-blue-600 hover:text-blue-800"
        >
          {isExpanded ? 'Show less' : 'Show more'}
        </button>
      )}
    </div>
  );
};

const ForumPost = ({ post, onDelete, showActions = true }: ForumPostProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [likes, setLikes] = useState<string[]>([]);
  const [commentCount, setCommentCount] = useState(0);
  const { user } = useAuthStore();
  const menuRef = useRef<HTMLDivElement>(null);
  const [showComments, setShowComments] = useState(false);

  const fetchCommentCount = async () => {
    try {
      const { count, error } = await supabase
        .from('forum_comments')
        .select('*', { count: 'exact', head: true })
        .eq('post_id', post.id);

      if (error) {
        console.error('Error fetching comment count:', error);
        return;
      }

      setCommentCount(count || 0);
    } catch (error) {
      console.error('Error in fetchCommentCount:', error);
    }
  };

  useEffect(() => {
    const fetchLikes = async () => {
      const { data } = await supabase
        .from('likes')
        .select('user_id')
        .eq('post_id', post.id);
      setLikes(data?.map(like => like.user_id) || []);
    };

    fetchLikes();
    fetchCommentCount();

    // Set up real-time subscription for comments
    const commentsSubscription = supabase
      .channel(`forum-comments:${post.id}`)
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'forum_comments',
          filter: `post_id=eq.${post.id}`
        }, 
        () => {
          fetchCommentCount();
        }
      )
      .subscribe();

    // Set up real-time subscription for likes
    const likesSubscription = supabase
      .channel(`post-likes:${post.id}`)
      .on('postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'likes',
          filter: `post_id=eq.${post.id}`
        },
        () => {
          fetchLikes();
        }
      )
      .subscribe();

    return () => {
      commentsSubscription.unsubscribe();
      likesSubscription.unsubscribe();
    };
  }, [post.id]);

  const handleLike = async () => {
    if (!user) return;

    try {
      const isLiked = likes.includes(user.id);

      if (isLiked) {
        // Remove like
        const { error } = await supabase
          .from('likes')
          .delete()
          .eq('user_id', user.id)
          .eq('post_id', post.id);

        if (error) throw error;
        setLikes(prev => prev.filter(id => id !== user.id));
      } else {
        // Add like
        const { error: likeError } = await supabase
          .from('likes')
          .insert({
            user_id: user.id,
            post_id: post.id
          });

        if (likeError) {
          // Check if like already exists
          const { data: posts } = await supabase
            .from('likes')
            .select('*')
            .eq('user_id', user.id)
            .eq('post_id', post.id);

          if (posts && posts.length > 0) {
            console.error('Like already exists:', {
              userId: user.id,
              postId: post.id,
              postExists: posts[0]
            });
            throw likeError;
          }
        }

        // Create activity for the post author if it's not the same user
        if (user.id !== post.user_id) {
          const { error: activityError } = await supabase.rpc('create_activity', {
            p_user_id: post.user_id,
            p_activity_type: 'post_like',
            p_content: `${user.email?.split('@')[0] || 'Someone'} liked your post: "${post.title}"`,
            p_related_id: post.id
          });

          if (activityError) throw activityError;
        }

        setLikes(prev => [...prev, user.id]);
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const handleShare = async () => {
    try {
      await navigator.share({
        title: post.title,
        text: post.content,
        url: window.location.href,
      });

      // Update share count in the database
      const { error: shareError } = await supabase
        .from('forum_posts')
        .update({ share_count: (post.share_count || 0) + 1 })
        .eq('id', post.id);

      if (shareError) throw shareError;

      // Create activity for the post author
      const { error: activityError } = await supabase.rpc('create_activity', {
        p_user_id: post.user_id,
        p_activity_type: 'post_share',
        p_content: `Someone shared your post: "${post.title}"`,
        p_related_id: post.id
      });

      if (activityError) throw activityError;

      // Update local state
      post.share_count = (post.share_count || 0) + 1;
    } catch (error) {
      console.error('Error sharing post:', error);
    }
  };

  const handleDelete = async () => {
    if (!user || user.id !== post.user_id) return;
    
    try {
      const { error } = await supabase.rpc('delete_forum_post', {
        target_post_id: post.id
      });
      
      if (error) throw error;
      onDelete?.();
    } catch (error) {
      console.error('Error deleting post:', error);
    }
  };

  const displayName = user?.id === post.user_id 
    ? "Me" 
    : post.profiles?.username || "Unknown User";

  return (
    <div className="p-6 mb-4 bg-white rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center space-x-3">
          <img
            src={post.profiles?.avatar_url || 'https://via.placeholder.com/40'}
            alt={post.profiles?.username || 'User'}
            className="w-10 h-10 rounded-full"
          />
          <div>
            <h3 className="font-semibold text-gray-900">
              {displayName}
            </h3>
            <p className="text-sm text-gray-500">
              {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
            </p>
          </div>
        </div>

        {showActions && user?.id === post.user_id && (
          <div className="relative">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-full hover:bg-gray-100"
            >
              <MoreVertical className="w-5 h-5 text-gray-500" />
            </button>

            {isMenuOpen && (
              <div ref={menuRef} className="absolute right-0 z-10 mt-2 w-48 bg-white rounded-md shadow-lg">
                <button
                  onClick={handleDelete}
                  className="flex items-center px-4 py-2 w-full text-sm text-red-600 hover:bg-gray-50"
                >
                  <Trash2 className="mr-2 w-4 h-4" />
                  Delete Post
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <h2 className="mb-2 text-xl font-bold">{post.title}</h2>
      <div className="mb-3">
        <span className="inline-block px-2 py-1 text-sm text-blue-800 bg-blue-100 rounded">
          {post.category}
        </span>
      </div>
      
      <PostContent content={post.content} />
      
      {/* Attachment Preview */}
      {typeof post.attachment_url === 'string' && (
        <div className="mt-4">
          <AttachmentPreview url={post.attachment_url} />
        </div>
      )}

      <div className="flex items-center space-x-4 text-gray-500">
        <button
          onClick={handleLike}
          className={`flex items-center space-x-1 ${user?.id && likes.includes(user.id) ? 'text-red-500' : ''}`}
        >
          <Heart className={`w-5 h-5 ${user?.id && likes.includes(user.id) ? 'fill-current' : ''}`} />
          <span>{likes.length}</span>
        </button>

        <button
          onClick={() => setShowComments(!showComments)}
          className="flex items-center space-x-1"
        >
          <MessageCircle className="w-5 h-5" />
          <span>{commentCount}</span>
        </button>

        <button
          onClick={handleShare}
          className="flex items-center space-x-1"
        >
          <Share2 className="w-5 h-5" />
          <span>{post.share_count || 0}</span>
        </button>
      </div>

      {showComments && (
        <Comments postId={post.id} />
      )}
    </div>
  );
};

export default ForumPost;
