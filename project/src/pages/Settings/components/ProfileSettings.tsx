import React, { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { useAuthStore } from '../../../store/authStore';
import { Camera } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface Profile {
  id: string;
  username?: string;
  full_name?: string;
  avatar_url?: string;
  bio?: string;
  university?: string;
  email?: string;
}

export default function ProfileSettings() {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    fullName: '',
    bio: '',
    university: '',
    email: ''
  });
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    async function getProfile() {
      if (!user) return;
      const { data } = await supabase
        .from('profiles')
        .select()
        .eq('id', user.id)
        .single();
      
      if (data) {
        setProfile(data);
        setFormData({
          username: data.username || '',
          fullName: data.full_name || '',
          bio: data.bio || '',
          university: data.university || '',
          email: user?.email || ''
        });
      }
    }
    
    getProfile();
  }, [user]);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      if (!user) return;
      const file = e.target.files?.[0];
      if (!file) return;

      setUploadingAvatar(true);

      // Upload new avatar
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}_${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false,
          contentType: file.type
        });

      if (uploadError) throw uploadError;

      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      // Update profile with new avatar URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', user.id);

      if (updateError) throw updateError;

      // Update local state
      setProfile((prev: Profile | null) => prev ? { ...prev, avatar_url: publicUrl } : { id: user.id, avatar_url: publicUrl });
      toast.success('Profile picture updated successfully');
    } catch (error) {
      console.error('Error updating avatar:', error);
      toast.error('Failed to update profile picture');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          username: formData.username,
          full_name: formData.fullName,
          bio: formData.bio,
          university: formData.university,
        })
        .eq('id', user.id);

      if (error) throw error;
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <h2 className="mb-6 text-xl font-semibold">Profile Settings</h2>
      
      <div className="mb-6">
        <div className="flex justify-center items-center">
          <div className="relative">
            <img
              src={profile?.avatar_url || 'https://via.placeholder.com/150'}
              alt={profile?.username || 'User avatar'}
              className="object-cover w-32 h-32 rounded-full"
            />
            <label className={`absolute bottom-0 right-0 p-2 bg-white rounded-full shadow-lg cursor-pointer ${uploadingAvatar ? 'opacity-50' : ''}`}>
              <Camera className="w-5 h-5 text-gray-600" />
              <input 
                type="file" 
                accept="image/*"
                onChange={handleAvatarChange}
                disabled={uploadingAvatar}
                className="hidden" 
              />
            </label>
          </div>
        </div>
        {uploadingAvatar && (
          <p className="mt-2 text-sm text-center text-gray-600">Updating profile picture...</p>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="username" className="block text-sm font-medium text-gray-700">
            Username
          </label>
          <input
            id="username"
            type="text"
            value={formData.username}
            onChange={handleChange}
            className="block px-3 py-2 mt-1 w-full rounded-md border border-gray-300 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
            Full Name
          </label>
          <input
            id="fullName"
            type="text"
            value={formData.fullName}
            onChange={handleChange}
            className="block px-3 py-2 mt-1 w-full rounded-md border border-gray-300 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label htmlFor="bio" className="block text-sm font-medium text-gray-700">
            Bio
          </label>
          <textarea
            id="bio"
            value={formData.bio}
            onChange={handleChange}
            rows={3}
            className="block px-3 py-2 mt-1 w-full rounded-md border border-gray-300 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label htmlFor="university" className="block text-sm font-medium text-gray-700">
            University
          </label>
          <input
            id="university"
            type="text"
            value={formData.university}
            onChange={handleChange}
            className="block px-3 py-2 mt-1 w-full rounded-md border border-gray-300 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            className="block px-3 py-2 mt-1 w-full rounded-md border border-gray-300 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 w-full text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
        >
          {loading ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
}