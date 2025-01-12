import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import { User } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Settings() {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [avatar, setAvatar] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    username: '',
    full_name: '',
    email: '',
    university: '',
    field_of_study: '',
    sub_field: '',
    year_of_enroll: '',
    year_of_completion: '',
    nationality: '',
    bio: '',
    avatar_url: ''
  });

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;

      try {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error) throw error;

        if (profile) {
          setFormData({
            username: profile.username || '',
            full_name: profile.full_name || '',
            email: user.email || '',
            university: profile.university || '',
            field_of_study: profile.field_of_study || '',
            sub_field: profile.sub_field || '',
            year_of_enroll: profile.year_of_enroll?.toString() || '',
            year_of_completion: profile.year_of_completion?.toString() || '',
            nationality: profile.nationality || '',
            bio: profile.bio || '',
            avatar_url: profile.avatar_url || ''
          });
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        toast.error('Failed to load profile');
      }
    };

    fetchProfile();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      // Handle avatar upload if a new one is selected
      let newAvatarUrl = formData.avatar_url;
      if (avatar) {
        const fileName = `${user.id}-${Date.now()}-${avatar.name}`;
        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(fileName, avatar);

        if (uploadError) throw uploadError;

        newAvatarUrl = `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/avatars/${fileName}`;
      }

      // Update profile
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          username: formData.username,
          full_name: formData.full_name,
          university: formData.university,
          field_of_study: formData.field_of_study,
          sub_field: formData.sub_field,
          year_of_enroll: parseInt(formData.year_of_enroll),
          year_of_completion: parseInt(formData.year_of_completion),
          nationality: formData.nationality,
          bio: formData.bio,
          avatar_url: newAvatarUrl
        })
        .eq('id', user.id);

      if (updateError) throw updateError;

      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAvatar(e.target.files[0]);
    }
  };

  return (
    <div className="px-4 py-6 mx-auto max-w-4xl sm:px-6 lg:px-8">
      <h1 className="mb-8 text-3xl font-bold text-gray-900">Settings</h1>
      
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Avatar Section */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Profile Picture</label>
          <div className="flex items-center mt-2 space-x-4">
            <div className="flex overflow-hidden justify-center items-center w-16 h-16 bg-gray-200 rounded-full">
              {formData.avatar_url ? (
                <img src={formData.avatar_url} alt="Profile" className="object-cover w-full h-full" />
              ) : (
                <User className="w-8 h-8 text-gray-400" />
              )}
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
            />
          </div>
        </div>

        {/* Basic Info Section */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700">Username</label>
            <input
              type="text"
              id="username"
              value={formData.username}
              onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
              className="block mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>

          <div>
            <label htmlFor="full_name" className="block text-sm font-medium text-gray-700">Full Name</label>
            <input
              type="text"
              id="full_name"
              value={formData.full_name}
              onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
              className="block mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              id="email"
              value={formData.email}
              disabled
              className="block mt-1 w-full bg-gray-50 rounded-md border-gray-300 shadow-sm sm:text-sm"
            />
          </div>

          <div>
            <label htmlFor="nationality" className="block text-sm font-medium text-gray-700">Nationality</label>
            <input
              type="text"
              id="nationality"
              value={formData.nationality}
              onChange={(e) => setFormData(prev => ({ ...prev, nationality: e.target.value }))}
              className="block mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
        </div>

        {/* Academic Info Section */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <label htmlFor="university" className="block text-sm font-medium text-gray-700">University</label>
            <input
              type="text"
              id="university"
              value={formData.university}
              onChange={(e) => setFormData(prev => ({ ...prev, university: e.target.value }))}
              className="block mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>

          <div>
            <label htmlFor="field_of_study" className="block text-sm font-medium text-gray-700">Field of Study</label>
            <input
              type="text"
              id="field_of_study"
              value={formData.field_of_study}
              onChange={(e) => setFormData(prev => ({ ...prev, field_of_study: e.target.value }))}
              className="block mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>

          <div>
            <label htmlFor="sub_field" className="block text-sm font-medium text-gray-700">Specialization</label>
            <input
              type="text"
              id="sub_field"
              value={formData.sub_field}
              onChange={(e) => setFormData(prev => ({ ...prev, sub_field: e.target.value }))}
              className="block mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="year_of_enroll" className="block text-sm font-medium text-gray-700">Year of Enrollment</label>
              <input
                type="number"
                id="year_of_enroll"
                value={formData.year_of_enroll}
                onChange={(e) => setFormData(prev => ({ ...prev, year_of_enroll: e.target.value }))}
                className="block mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>

            <div>
              <label htmlFor="year_of_completion" className="block text-sm font-medium text-gray-700">Year of Completion</label>
              <input
                type="number"
                id="year_of_completion"
                value={formData.year_of_completion}
                onChange={(e) => setFormData(prev => ({ ...prev, year_of_completion: e.target.value }))}
                className="block mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
          </div>
        </div>

        {/* Bio Section */}
        <div>
          <label htmlFor="bio" className="block text-sm font-medium text-gray-700">Bio</label>
          <textarea
            id="bio"
            rows={4}
            value={formData.bio}
            onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
            className="block mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>

        {/* Submit Button */}
        <div>
          <button
            type="submit"
            disabled={loading}
            className="flex justify-center px-4 py-2 w-full text-sm font-medium text-white bg-indigo-600 rounded-md border border-transparent shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
