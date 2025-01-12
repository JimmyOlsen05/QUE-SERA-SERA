import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import { User, Mail, Book, Calendar, Globe, GraduationCap } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Profile() {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    fetchProfile();
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        throw error;
      }

      if (data) {
        setProfile(data);
      }
    } catch (error) {
      toast.error('Error loading profile data!');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="w-12 h-12 rounded-full border-t-2 border-b-2 border-blue-500 animate-spin"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen">
        <h2 className="mb-4 text-2xl font-semibold">Profile not found</h2>
        <p className="text-gray-600">Please complete your profile setup in the settings.</p>
      </div>
    );
  }

  return (
    <div className="container px-4 py-8 mx-auto">
      <div className="overflow-hidden mx-auto max-w-4xl bg-white rounded-lg shadow-md">
        {/* Header with avatar and name */}
        <div className="p-8 text-white bg-gradient-to-r from-blue-500 to-purple-600">
          <div className="flex items-center space-x-6">
            <div className="relative">
              {profile.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={profile.full_name}
                  className="w-24 h-24 rounded-full border-4 border-white"
                />
              ) : (
                <div className="flex justify-center items-center w-24 h-24 bg-gray-200 rounded-full border-4 border-white">
                  <User size={40} className="text-gray-400" />
                </div>
              )}
            </div>
            <div>
              <h1 className="text-3xl font-bold">{profile.full_name}</h1>
              <p className="text-lg opacity-90">@{profile.username}</p>
            </div>
          </div>
        </div>

        {/* Profile Information */}
        <div className="p-8">
          {/* Bio Section */}
          <div className="mb-8">
            <h2 className="mb-4 text-2xl font-semibold">About</h2>
            <p className="text-gray-700">{profile.bio || 'No bio provided'}</p>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Academic Information */}
            <div className="space-y-4">
              <h3 className="mb-3 text-xl font-semibold">Academic Information</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <GraduationCap className="text-blue-500" />
                  <div>
                    <p className="text-sm text-gray-500">University</p>
                    <p className="text-gray-800">{profile.university}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Book className="text-blue-500" />
                  <div>
                    <p className="text-sm text-gray-500">Field of Study</p>
                    <p className="text-gray-800">{profile.field_of_study}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Calendar className="text-blue-500" />
                  <div>
                    <p className="text-sm text-gray-500">Study Period</p>
                    <p className="text-gray-800">{profile.year_of_enroll} - {profile.year_of_completion}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="space-y-4">
              <h3 className="mb-3 text-xl font-semibold">Contact Information</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Mail className="text-blue-500" />
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="text-gray-800">{user?.email}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Globe className="text-blue-500" />
                  <div>
                    <p className="text-sm text-gray-500">Nationality</p>
                    <p className="text-gray-800">{profile.nationality}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
