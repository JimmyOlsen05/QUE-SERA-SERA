import { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, FileText, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/authStore';
import InterviewSection from '../Academic/components/InterviewSection';

interface Interview {
  id: string;
  project_id: string;
  interviewer_id: string;
  interviewee_id: string;
  scheduled_date: string;
  location: string;
  notes: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  project: {
    title: string;
  };
  interviewer: {
    username: string;
    avatar_url: string;
  };
  interviewee: {
    username: string;
    avatar_url: string;
  };
}

interface Project {
  id: string;
  title: string;
  collaborators: any[];
}

export default function Interviews() {
  const { user } = useAuthStore();
  // @ts-ignore - Variable is used in filtered interviews
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [projects, setProjects] = useState<Array<Project>>([]);

  useEffect(() => {
    fetchInterviews();
    fetchUserProjects();
  }, [user]);

  const fetchInterviews = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('interviews')
        .select(`
          *,
          project:academic_projects(title),
          interviewer:profiles!interviewer_id(username, avatar_url),
          interviewee:profiles!interviewee_id(username, avatar_url)
        `)
        .or(`interviewer_id.eq.${user.id},interviewee_id.eq.${user.id}`)
        .order('scheduled_date', { ascending: true });

      if (error) throw error;
      setInterviews(data || []);
    } catch (error) {
      console.error('Error fetching interviews:', error);
      toast.error('Failed to load interviews');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserProjects = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('academic_projects')
        .select(`
          id,
          title,
          project_collaborators!project_collaborators_project_id_fkey(
            user_id,
            profiles(
              username,
              avatar_url
            )
          )
        `)
        .eq('creator_id', user.id)
        .eq('status', 'open');

      if (error) throw error;
      const transformedProjects = (data || []).map(project => ({
        id: project.id,
        title: project.title,
        collaborators: project.project_collaborators.map(collab => ({
          userId: collab.user_id,
          ...collab.profiles[0]
        }))
      }));
      setProjects(transformedProjects);
    } catch (error) {
      console.error('Error fetching projects:', error);
      toast.error('Failed to load projects');
    }
  };

  const updateInterviewStatus = async (interviewId: string, newStatus: 'completed' | 'cancelled') => {
    try {
      const { error } = await supabase
        .from('interviews')
        .update({ status: newStatus })
        .eq('id', interviewId);

      if (error) throw error;

      toast.success(`Interview ${newStatus}`);
      fetchInterviews();
    } catch (error) {
      console.error('Error updating interview:', error);
      toast.error('Failed to update interview status');
    }
  };

  const handleScheduleInterview = async (formData: {
    projectId: string;
    userId: string;
    date: string;
    time: string;
    duration: number;
  }) => {
    if (!user) return;

    try {
      const scheduledDateTime = new Date(`${formData.date}T${formData.time}`);
      
      const { error: interviewError } = await supabase
        .from('project_interviews')
        .insert({
          project_id: formData.projectId,
          interviewer_id: user.id,
          interviewee_id: formData.userId,
          scheduled_time: scheduledDateTime.toISOString(),
          duration_minutes: formData.duration,
          status: 'scheduled',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

      if (interviewError) throw interviewError;

      const { error: notificationError } = await supabase
        .from('notifications')
        .insert({
          user_id: formData.userId,
          type: 'interview_scheduled',
          title: 'Interview Scheduled',
          content: `You have been scheduled for an interview on ${formData.date} at ${formData.time}`,
          read: false,
          created_at: new Date().toISOString(),
        });

      if (notificationError) throw notificationError;

      toast.success('Interview scheduled successfully');
      setShowScheduleModal(false);
      fetchInterviews();
    } catch (error) {
      console.error('Error scheduling interview:', error);
      toast.error('Failed to schedule interview');
    }
  };

  const filteredInterviews = interviews.filter(interview => {
    const isUpcoming = new Date(interview.scheduled_date) > new Date() && interview.status === 'scheduled';
    return activeTab === 'upcoming' ? isUpcoming : !isUpcoming;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="w-12 h-12 rounded-full border-t-2 border-b-2 border-blue-500 animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="container px-4 py-8 mx-auto max-w-6xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Interviews</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage your upcoming and past interviews
        </p>
      </div>

      {/* Tabs */}
      <div className="flex p-1 mb-6 space-x-1 bg-gray-100 rounded-lg w-fit">
        <button
          onClick={() => setActiveTab('upcoming')}
          className={`px-4 py-2 text-sm font-medium rounded-md ${
            activeTab === 'upcoming'
              ? 'bg-white text-gray-900 shadow'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Upcoming
        </button>
        <button
          onClick={() => setActiveTab('past')}
          className={`px-4 py-2 text-sm font-medium rounded-md ${
            activeTab === 'past'
              ? 'bg-white text-gray-900 shadow'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Past
        </button>
      </div>

      {/* Interviews List */}
      <div className="space-y-4">
        {filteredInterviews.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-lg">
            <p className="text-gray-500">
              {activeTab === 'upcoming'
                ? 'No upcoming interviews scheduled'
                : 'No past interviews'}
            </p>
          </div>
        ) : (
          filteredInterviews.map((interview) => (
            <div
              key={interview.id}
              className="p-6 bg-white rounded-lg shadow-sm"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">
                    Interview for {interview.project.title}
                  </h3>
                  <div className="mt-2 space-y-2">
                    <div className="flex items-center text-sm text-gray-500">
                      <Calendar className="mr-2 w-4 h-4" />
                      {new Date(interview.scheduled_date).toLocaleDateString()}
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <Clock className="mr-2 w-4 h-4" />
                      {new Date(interview.scheduled_date).toLocaleTimeString()}
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <MapPin className="mr-2 w-4 h-4" />
                      {interview.location}
                    </div>
                    {interview.notes && (
                      <div className="flex items-start text-sm text-gray-500">
                        <FileText className="mr-2 w-4 h-4 mt-0.5" />
                        {interview.notes}
                      </div>
                    )}
                  </div>
                </div>

                <div className="text-right">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      interview.status === 'scheduled'
                        ? 'bg-blue-100 text-blue-800'
                        : interview.status === 'completed'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {interview.status.charAt(0).toUpperCase() + interview.status.slice(1)}
                  </span>
                  {interview.status === 'scheduled' && (
                    <div className="flex mt-2 space-x-2">
                      <button
                        onClick={() => updateInterviewStatus(interview.id, 'completed')}
                        className="inline-flex items-center p-1 text-green-600 rounded hover:bg-green-50"
                        title="Mark as completed"
                      >
                        <CheckCircle className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => updateInterviewStatus(interview.id, 'cancelled')}
                        className="inline-flex items-center p-1 text-red-600 rounded hover:bg-red-50"
                        title="Cancel interview"
                      >
                        <XCircle className="w-5 h-5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-between items-center pt-4 mt-4 border-t">
                <div className="flex items-center space-x-4">
                  <div>
                    <p className="text-xs text-gray-500">Interviewer</p>
                    <div className="flex items-center mt-1">
                      {interview.interviewer.avatar_url ? (
                        <img
                          src={interview.interviewer.avatar_url}
                          alt=""
                          className="w-6 h-6 rounded-full"
                        />
                      ) : (
                        <div className="flex justify-center items-center w-6 h-6 bg-gray-200 rounded-full">
                          <span className="text-xs font-medium text-gray-500">
                            {interview.interviewer.username.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                      <span className="ml-2 text-sm font-medium text-gray-900">
                        {interview.interviewer.username}
                      </span>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Interviewee</p>
                    <div className="flex items-center mt-1">
                      {interview.interviewee.avatar_url ? (
                        <img
                          src={interview.interviewee.avatar_url}
                          alt=""
                          className="w-6 h-6 rounded-full"
                        />
                      ) : (
                        <div className="flex justify-center items-center w-6 h-6 bg-gray-200 rounded-full">
                          <span className="text-xs font-medium text-gray-500">
                            {interview.interviewee.username.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                      <span className="ml-2 text-sm font-medium text-gray-900">
                        {interview.interviewee.username}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Schedule Interview Modal */}
      {showScheduleModal && (
        <div className="overflow-y-auto fixed inset-0 z-50">
          <div className="flex justify-center items-center p-4 min-h-screen">
            <div className="fixed inset-0 bg-black opacity-30"></div>
            <div className="relative p-8 w-full max-w-md bg-white rounded-lg">
              <h3 className="mb-4 text-lg font-semibold">Schedule Interview</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Project</label>
                  <select
                    className="block mt-1 w-full rounded-md border-gray-300 shadow-sm"
                    value={selectedProject || ''}
                    onChange={(e) => setSelectedProject(e.target.value)}
                  >
                    <option value="">Select a project</option>
                    {projects.map((project) => (
                      <option key={project.id} value={project.id}>{project.title}</option>
                    ))}
                  </select>
                </div>

                {selectedProject && (
                  <InterviewSection
                    projectId={selectedProject}
                    acceptedUsers={
                      projects.find(p => p.id === selectedProject)?.collaborators || []
                    }
                    onSchedule={handleScheduleInterview}
                    onCancel={() => setShowScheduleModal(false)}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Interview Button */}
      <button
        onClick={() => setShowScheduleModal(true)}
        className="fixed right-8 bottom-8 p-4 text-white bg-blue-600 rounded-full shadow-lg hover:bg-blue-700"
      >
        <Calendar className="w-6 h-6" />
      </button>
    </div>
  );
}
