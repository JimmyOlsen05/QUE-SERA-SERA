import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Upload } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface CreateForumPostProps {
  onPostCreated: () => void;
}

// Add supported image formats constant
const SUPPORTED_IMAGE_FORMATS = [
  'image/webp',
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/svg+xml',
  'image/bmp',
  'image/tiff'
];

export default function CreateForumPost({ onPostCreated }: CreateForumPostProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check if file type is supported
      if (!SUPPORTED_IMAGE_FORMATS.includes(file.type)) {
        toast.error('Unsupported file type. Please upload an image (WebP, JPEG, PNG, GIF, SVG, BMP, or TIFF)');
        return;
      }

      // Check file size (e.g., 5MB limit)
      const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB in bytes
      if (file.size > MAX_FILE_SIZE) {
        toast.error('File size must be less than 5MB');
        return;
      }

      setFile(file);
    }
  };

  const uploadFile = async (): Promise<string | null> => {
    if (!file) return null;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const fileExt = file.name.split('.').pop();
      const fileName = `${crypto.randomUUID()}_${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('forum_attachments')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false,
          onUploadProgress: (progress: { loaded: number; total: number }) => {
            const percent = (progress.loaded / progress.total) * 100;
            setUploadProgress(Math.round(percent));
          },
        } as any);

      if (uploadError) throw uploadError;

      // Get the public URL for the uploaded file
      const { data } = await supabase.storage
        .from('forum_attachments')
        .getPublicUrl(fileName);

      if (!data?.publicUrl) {
        throw new Error('Failed to get public URL for uploaded file');
      }
      
      return data.publicUrl;
    } catch (error) {
      console.error('Error uploading file:', error);
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    setIsSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      let attachment_url = null;
      if (file) {
        attachment_url = await uploadFile();
      }

      const { error } = await supabase
        .from('forum_posts')
        .insert([
          {
            title,
            content,
            user_id: user.id,
            attachment_url,
          },
        ]);

      if (error) throw error;

      setTitle('');
      setContent('');
      setFile(null);
      setUploadProgress(0);
      onPostCreated();
    } catch (error) {
      console.error('Error creating forum post:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700">
          Title
        </label>
        <input
          type="text"
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="block mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          required
        />
      </div>

      <div>
        <label htmlFor="content" className="block text-sm font-medium text-gray-700">
          Content
        </label>
        <textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={4}
          className="block mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          required
        />
      </div>

      <div>
        <label htmlFor="attachment" className="block text-sm font-medium text-gray-700">
          Attachment
        </label>
        <div className="flex gap-4 items-center mt-1">
          <label className="flex gap-2 items-center px-3 py-2 text-sm text-gray-600 rounded-md border border-gray-300 cursor-pointer hover:bg-gray-50">
            <Upload className="w-4 h-4" />
            {file ? file.name : 'Choose file'}
            <input
              type="file"
              id="attachment"
              className="hidden"
              onChange={handleFileChange}
              accept={SUPPORTED_IMAGE_FORMATS.join(',')}
            />
          </label>
          {file && (
            <button
              type="button"
              onClick={() => setFile(null)}
              className="text-sm text-red-600 hover:text-red-700"
            >
              Remove
            </button>
          )}
        </div>
        {uploadProgress > 0 && uploadProgress < 100 && (
          <div className="mt-2">
            <div className="w-full h-2 bg-gray-200 rounded-full">
              <div
                className="h-2 bg-indigo-600 rounded-full transition-all"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md border border-transparent shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
      >
        {isSubmitting ? 'Creating...' : 'Create Post'}
      </button>
    </form>
  );
}
