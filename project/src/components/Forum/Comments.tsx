import { useState, useEffect, useRef } from 'react';
import { useAuthStore } from '../../store/authStore';
import { supabase } from '../../lib/supabase';
import { Smile, Paperclip, Send, FileText } from 'lucide-react';
import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';
import { formatDistanceToNow } from 'date-fns';

interface Comment {
  id: string;
  content: string;
  user_id: string;
  post_id: string;
  created_at: string;
  profiles: {
    username: string;
    avatar_url: string | null;
    full_name: string | null;
  }
  attachment_url: string | null
}

interface CommentsProps {
  postId: string;
}

// Type definitions for handlers
type UploadAttachmentFunction = (file: File) => Promise<string>;
type HandleSubmitFunction = (e: React.FormEvent) => Promise<void>;
type HandleAttachmentChangeFunction = (e: React.ChangeEvent<HTMLInputElement>) => void;
type OnEmojiSelectFunction = (emoji: { native: string }) => void;

// Add this helper function to determine attachment type
const getAttachmentType = (url: string) => {
  const extension = url.split('.').pop()?.toLowerCase();
  if (!extension) return 'other';
  
  if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension)) return 'image';
  if (['pdf', 'doc', 'docx', 'txt'].includes(extension)) return 'document';
  return 'other';
};

// Add this component for attachment preview
const CommentAttachment = ({ url }: { url: string }) => {
  const type = getAttachmentType(url);

  return (
    <div className="mt-2 max-w-xs">
      {type === 'image' ? (
        <img
          src={url}
          alt="Comment attachment"
          className="object-cover max-h-48 rounded-lg"
          onClick={() => window.open(url, '_blank')}
        />
      ) : (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex gap-2 items-center text-indigo-600 hover:text-indigo-800"
        >
          {type === 'document' ? <FileText className="w-5 h-5" /> : <Paperclip className="w-5 h-5" />}
          <span>View attachment</span>
        </a>
      )}
    </div>
  );
};

export default function Comments({ postId }: CommentsProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [attachment, setAttachment] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuthStore();
  const emojiPickerRef = useRef<HTMLDivElement>(null);

  const fetchComments = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('forum_comments')
        .select(`
          id,
          content,
          created_at,
          attachment_url,
          user_id,
          profiles!user_id (
            username,
            avatar_url
          )
        `)
        .eq('post_id', postId)
        .returns<Comment[]>();

      if (error) throw error;
      setComments(data || []);
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
    
    // Subscribe to new comments
    const commentsSubscription = supabase
      .channel(`post-comments-${postId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'forum_comments',
          filter: `post_id=eq.${postId}`
        },
        () => {
          fetchComments();
        }
      )
      .subscribe();

    return () => {
      commentsSubscription.unsubscribe();
    };
  }, [postId]);

  const handleAttachmentChange: HandleAttachmentChangeFunction = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        alert('File size must be less than 5MB');
        return;
      }
      setAttachment(file);
    }
  };

  const allowedMimeTypes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/svg+xml',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain',
    'text/csv',
    'application/zip',
    'application/x-rar-compressed'
  ];

  const uploadAttachment: UploadAttachmentFunction = async (file) => {
    let retries = 3;
    while (retries > 0) {
      try {
        if (!allowedMimeTypes.includes(file.type)) {
          throw new Error('File type not allowed.');
        }

        setIsUploading(true);
        const fileName = `${Date.now()}_${file.name}`;

        // Upload to the forum_attachments bucket
        const { error: uploadError } = await supabase.storage
          .from('forum_attachments')
          .upload(fileName, file, {
            cacheControl: '3600',
            upsert: false,
            contentType: file.type
          });

        if (uploadError) throw uploadError;

        // Get public URL
        const { data: urlData } = await supabase.storage
          .from('forum_attachments')
          .getPublicUrl(fileName);

        if (!urlData?.publicUrl) throw new Error('Failed to get public URL');

        return urlData.publicUrl;
      } catch (error) {
        retries--;
        if (retries === 0) throw error;
        await new Promise(resolve => setTimeout(resolve, 1000));
      } finally {
        setIsUploading(false);
      }
    }
    throw new Error('Upload failed');
  };

  const handleSubmit: HandleSubmitFunction = async (e) => {
    e.preventDefault();
    if (!user || !newComment.trim()) return;

    try {
      let attachmentUrl = null;
      
      // Only handle attachment if one exists
      if (attachment) {
        attachmentUrl = await uploadAttachment(attachment);
      }

      const { error } = await supabase
        .from('forum_comments')
        .insert({
          post_id: postId,
          user_id: user.id,
          content: newComment,
          ...(attachmentUrl ? { attachment_url: attachmentUrl } : {}) // Only include if there's an attachment
        });

      if (error) throw error;

      // Reset form
      setNewComment('');
      setAttachment(null);
      
      // Refresh comments
      fetchComments();
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target as Node)) {
        setShowEmojiPicker(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const onEmojiSelect: OnEmojiSelectFunction = (emoji) => {
    setNewComment(prev => prev + emoji.native);
    setShowEmojiPicker(false);
  };

  return (
    <div className="mt-4 space-y-4">
      {isLoading ? (
        <div className="py-4 text-center">
          <div className="mx-auto w-8 h-8 rounded-full border-b-2 border-gray-900 animate-spin"></div>
        </div>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <div key={comment.id} className="p-4 bg-white rounded-lg shadow">
              <div className="flex items-start space-x-3">
                <img
                  src={comment.profiles.avatar_url || '/default-avatar.png'}
                  alt={comment.profiles.username}
                  className="w-8 h-8 rounded-full"
                />
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">{comment.profiles.username}</span>
                    <span className="text-sm text-gray-500">
                      {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                    </span>
                  </div>
                  <p className="mt-1 text-gray-800">{comment.content}</p>
                  {comment.attachment_url && (
                    <CommentAttachment url={comment.attachment_url} />
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-4">
        <div className="flex items-end space-x-2">
          <div className="relative flex-1">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Write a comment..."
              className="p-2 w-full rounded-lg border resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={2}
            />
            <div ref={emojiPickerRef} className="absolute right-2 bottom-2">
              <button
                type="button"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="p-2 text-gray-500 hover:text-gray-700"
              >
                <Smile className="w-5 h-5" />
              </button>
              {showEmojiPicker && (
                <div className="absolute right-0 bottom-10 z-10">
                  <Picker data={data} onEmojiSelect={onEmojiSelect} />
                </div>
              )}
            </div>
          </div>
          <div className="flex space-x-2">
            <label className="p-2 text-gray-500 rounded-lg cursor-pointer hover:text-gray-700 hover:bg-gray-100">
              <Paperclip className="w-5 h-5" />
              <input
                type="file"
                onChange={handleAttachmentChange}
                className="hidden"
                accept="image/*,.pdf,.doc,.docx"
              />
            </label>
            <button
              type="submit"
              disabled={isUploading || !newComment.trim()}
              className="p-2 text-white bg-blue-500 rounded-lg hover:bg-blue-600 disabled:opacity-50"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
        {attachment && (
          <div className="flex items-center mt-2 space-x-2">
            <Paperclip className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-600">{attachment.name}</span>
            <button
              type="button"
              onClick={() => setAttachment(null)}
              className="text-sm text-red-500 hover:underline"
            >
              Remove
            </button>
          </div>
        )}
      </form>
    </div>
  );
}
