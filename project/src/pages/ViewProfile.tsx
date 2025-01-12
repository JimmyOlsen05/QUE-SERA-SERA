import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { User, Book, Calendar, GraduationCap } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store/authStore';
import { notifyInterviewScheduled } from '../utils/notifications';

interface ProfileData {
  id: string;
  username: string;
  full_name: string;
  avatar_url: string;
  bio: string;
  university: string;
  department: string;
  graduation_year: string;
  skills: string[];
  email: string;
}

interface InterviewFormData {
  date: string;
  time: string;
  location: string;
  notes: string;
}

export default function ViewProfile() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [showInterviewModal, setShowInterviewModal] = useState(false);
  const [interviewDetails, setInterviewDetails] = useState<InterviewFormData>({
    date: '',
    time: '',
    location: '',
    notes: ''
  });

  useEffect(() => {
    fetchProfile();
  }, [userId]);

  const fetchProfile = async () => {
    if (!userId) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        throw error;
      }

      if (data) {
        setProfile(data);
      }
    } catch (error) {
      toast.error('Error loading profile data!');
      navigate('/dashboard/academic');
    } finally {
      setLoading(false);
    }
  };

  const handleScheduleInterview = async () => {
    if (!user || !profile) return;

    try {
      const projectId = localStorage.getItem('current_project_id');
      if (!projectId) throw new Error('Project ID not found');

      const { data: projectData, error: projectError } = await supabase
        .from('academic_projects')
        .select('title')
        .eq('id', projectId)
        .single();

      if (projectError) throw projectError;

      const { error: interviewError } = await supabase
        .from('interviews')
        .insert([
          {
            project_id: projectId,
            interviewer_id: user.id,
            interviewee_id: profile.id,
            scheduled_date: new Date(`${interviewDetails.date}T${interviewDetails.time}`).toISOString(),
            location: interviewDetails.location,
            notes: interviewDetails.notes,
            status: 'scheduled'
          }
        ]);

      if (interviewError) throw interviewError;

      // Send notification
      await notifyInterviewScheduled(
        profile.id,
        projectData.title,
        new Date(`${interviewDetails.date}T${interviewDetails.time}`),
        interviewDetails.location,
        interviewDetails.notes
      );

      toast.success('Interview scheduled successfully');
      setShowInterviewModal(false);
    } catch (error) {
      console.error('Error scheduling interview:', error);
      toast.error('Failed to schedule interview');
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
        <p className="text-gray-600">This user's profile could not be found.</p>
      </div>
    );
  }

  return (
    <div className="container px-4 py-8 mx-auto">
      <div className="overflow-hidden mx-auto max-w-4xl bg-white rounded-lg shadow-md">
        {/* Header with avatar and name */}
        <div className="p-8 text-white bg-gradient-to-r from-blue-500 to-purple-600">
          <div className="flex justify-between items-center">
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
            <button
              onClick={() => setShowInterviewModal(true)}
              className="px-4 py-2 text-sm font-medium text-blue-600 bg-white rounded-md hover:bg-blue-50"
            >
              Schedule Interview
            </button>
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
                    <p className="font-medium">{profile.university}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Book className="text-blue-500" />
                  <div>
                    <p className="text-sm text-gray-500">Department</p>
                    <p className="font-medium">{profile.department}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Calendar className="text-blue-500" />
                  <div>
                    <p className="text-sm text-gray-500">Graduation Year</p>
                    <p className="font-medium">{profile.graduation_year}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Skills */}
            <div className="space-y-4">
              <h3 className="mb-3 text-xl font-semibold">Skills</h3>
              <div className="flex flex-wrap gap-2">
                {profile.skills?.map((skill, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 text-sm font-medium text-blue-600 bg-blue-100 rounded-full"
                  >
                    {skill}
                  </span>
                ))}
                {(!profile.skills || profile.skills.length === 0) && (
                  <p className="text-gray-500">No skills listed</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Interview Modal */}
      {showInterviewModal && (
        <div className="flex fixed inset-0 z-50 justify-center items-center bg-black bg-opacity-50">
          <div className="p-6 w-full max-w-md bg-white rounded-lg">
            <h2 className="mb-4 text-xl font-semibold">Schedule Interview</h2>
            <div className="space-y-4">
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">Date</label>
                <input
                  type="date"
                  value={interviewDetails.date}
                  onChange={(e) => setInterviewDetails({ ...interviewDetails, date: e.target.value })}
                  className="block px-3 py-2 w-full rounded-md border border-gray-300"
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">Time</label>
                <input
                  type="time"
                  value={interviewDetails.time}
                  onChange={(e) => setInterviewDetails({ ...interviewDetails, time: e.target.value })}
                  className="block px-3 py-2 w-full rounded-md border border-gray-300"
                />
              </div>
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">Location</label>
                <input
                  type="text"
                  value={interviewDetails.location}
                  onChange={(e) => setInterviewDetails({ ...interviewDetails, location: e.target.value })}
                  placeholder="e.g., Zoom, Google Meet, or physical location"
                  className="block px-3 py-2 w-full rounded-md border border-gray-300"
                />
              </div>
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">Notes</label>
                <textarea
                  value={interviewDetails.notes}
                  onChange={(e) => setInterviewDetails({ ...interviewDetails, notes: e.target.value })}
                  placeholder="Any additional information for the candidate..."
                  className="block px-3 py-2 w-full h-24 rounded-md border border-gray-300 resize-none"
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowInterviewModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleScheduleInterview}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                >
                  Schedule Interview
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
