import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { AcademicProject, ProjectDiscussion } from '../../types/academic.types';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';
import { notifyRequestAccepted, notifyProjectApproved } from '../../utils/notifications';
import { LoadingStates, ErrorStates } from '../../types/loading.types';
import ProjectDetailsContent from './ProjectDetailsContent';

interface JoinRequestData {
  id: string;
  project_id: string;
  user_id: string;
  status: string;
  message: string;
  created_at: string;
  profiles: Array<{
    id: string;
    username: string;
    avatar_url: string | null;
    university?: string;
  }>;
}

type TabType = 'overview' | 'milestones' | 'discussions' | 'interviews';

export default function ProjectDetails() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [project, setProject] = useState<AcademicProject | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [discussions, setDiscussions] = useState<ProjectDiscussion[]>([]);
  const [joinRequests, setJoinRequests] = useState<JoinRequestData[]>([]);
  const [hasExistingRequest, setHasExistingRequest] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [joinMessage, setJoinMessage] = useState('');
  const [newMessage, setNewMessage] = useState('');

  const [loadingStates, setLoadingStates] = useState<LoadingStates>({
    isLoadingProject: true,
    isLoadingDiscussions: false,
    isLoadingJoinRequests: false,
    isLoadingCollaborators: false,
    isProcessingJoinRequest: false,
    isProcessingDelete: false,
    isProcessingClose: false,
    isSendingMessage: false,
    isSchedulingInterview: false
  });
  const [errorStates, setErrorStates] = useState<ErrorStates>({
    projectError: null,
    discussionsError: null,
    joinRequestsError: null,
    collaboratorsError: null,
    messageError: null,
    interviewError: null
  });

  useEffect(() => {
    if (projectId) {
      fetchProjectDetails();
      subscribeToDiscussions();
      fetchJoinRequests();
    }
  }, [projectId]);

  useEffect(() => {
    const checkExistingRequest = async () => {
      if (!user || !project) return;
      
      const { data: existingRequests, error: checkError } = await supabase
        .from('project_join_requests')
        .select('*')
        .eq('project_id', project.id)
        .eq('user_id', user.id);

      if (checkError) {
        console.error('Error checking existing request:', checkError);
        return;
      }

      setHasExistingRequest(existingRequests && existingRequests.length > 0);
    };

    checkExistingRequest();
  }, [user, project]);

  const fetchProjectDetails = async () => {
    setLoadingStates(prev => ({ ...prev, isLoadingProject: true }));
    try {
      if (!projectId) {
        console.error('Project ID is undefined');
        return;
      }

      const { data: projectData, error: projectError } = await supabase
        .from('academic_projects')
        .select(`
          *,
          creator:creator_id(username, avatar_url)
        `)
        .eq('id', projectId)
        .single();

      if (projectError) throw projectError;

      const collaboratorsData = await fetchCollaborators();
      const { data: skillsData, error: skillsError } = await supabase
        .from('project_skills')
        .select('skill:skills(*)')
        .eq('project_id', projectId);

      if (skillsError) throw skillsError;

      const { data: milestonesData, error: milestonesError } = await supabase
        .from('project_milestones')
        .select('*')
        .eq('project_id', projectId);

      if (milestonesError) throw milestonesError;

      setProject({
        ...projectData,
        skills: skillsData?.map(s => s.skill) || [],
        collaborators: collaboratorsData,
        milestones: milestonesData || []
      });
      setErrorStates(prev => ({ ...prev, projectError: null }));
    } catch (error) {
      console.error('Error fetching project details:', error);
      setErrorStates(prev => ({ ...prev, projectError: 'Failed to load project details' }));
      navigate('/dashboard/academic');
    } finally {
      setLoadingStates(prev => ({ ...prev, isLoadingProject: false }));
    }
  };

  const fetchCollaborators = async () => {
    setLoadingStates(prev => ({ ...prev, isLoadingCollaborators: true }));
    try {
      if (!projectId) {
        console.error('Project ID is undefined');
        return [];
      }

      const { data, error } = await supabase
        .from('project_collaborators')
        .select('user_id, profiles(username, avatar_url, id)')
        .eq('project_id', projectId);

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Error fetching collaborators:', error);
      setErrorStates(prev => ({ ...prev, collaboratorsError: 'Failed to load collaborators' }));
      return [];
    } finally {
      setLoadingStates(prev => ({ ...prev, isLoadingCollaborators: false }));
    }
  };

  const subscribeToDiscussions = () => {
    const discussionsSubscription = supabase
      .channel(`project_${projectId}_discussions`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'project_discussions',
          filter: `project_id=eq.${projectId}`
        },
        async (payload) => {
          const { data: discussionWithProfile } = await supabase
            .from('project_discussions')
            .select(`
              *,
              profiles:user_id(username, avatar_url)
            `)
            .eq('id', payload.new.id)
            .single();

          setDiscussions(prev => [...prev, discussionWithProfile]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(discussionsSubscription);
    };
  };

  const fetchJoinRequests = async () => {
    setLoadingStates(prev => ({ ...prev, isLoadingJoinRequests: true }));
    try {
      const { data, error } = await supabase
        .from('project_join_requests')
        .select(`
          *,
          profiles:user_id (
            id,
            username,
            avatar_url,
            university
          )
        `)
        .eq('project_id', projectId);

      if (error) throw error;

      setJoinRequests(data || []);
      setErrorStates(prev => ({ ...prev, joinRequestsError: null }));
    } catch (error) {
      console.error('Error fetching join requests:', error);
      setErrorStates(prev => ({ ...prev, joinRequestsError: 'Failed to load join requests' }));
    } finally {
      setLoadingStates(prev => ({ ...prev, isLoadingJoinRequests: false }));
    }
  };

  const handleJoinRequest = async () => {
    if (!project || !user) return;
    
    setLoadingStates(prev => ({ ...prev, isProcessingJoinRequest: true }));
    try {
      // First check if user already has a pending request
      const { data: existingRequest } = await supabase
        .from('project_join_requests')
        .select('*')
        .eq('project_id', project.id)
        .eq('user_id', user.id)
        .eq('status', 'pending')
        .single();

      if (existingRequest) {
        toast.error('You already have a pending request for this project');
        return;
      }

      // Create the join request
      const { data: newRequest, error: requestError } = await supabase
        .from('project_join_requests')
        .insert({
          project_id: project.id,
          user_id: user.id,
          message: joinMessage,
          status: 'pending',
          created_at: new Date().toISOString()
        })
        .select('*, profiles:user_id(*)')
        .single();

      if (requestError) throw requestError;

      // Create notification for project creator
      const { error: notificationError } = await supabase
        .from('notifications')
        .insert({
          user_id: project.creator_id,
          type: 'join_request',
          content: `${user.user_metadata.username} has requested to join your project "${project.title}"`,
          project_reference_id: project.id,
          request_reference_id: newRequest.id,
          created_at: new Date().toISOString(),
          read: false,
          metadata: {
            requester_username: user.user_metadata.username,
            requester_avatar: user.user_metadata.avatar_url,
            project_title: project.title,
            request_message: joinMessage
          }
        });

      if (notificationError) {
        console.error('Error creating notification:', notificationError);
        // Don't throw here as the request was already created
      }

      setJoinMessage('');
      setHasExistingRequest(true);
      await fetchJoinRequests();
      
      toast.success('Join request sent successfully');
    } catch (error: any) {
      console.error('Error sending join request:', error);
      toast.error(error.message || 'Failed to send join request');
    } finally {
      setLoadingStates(prev => ({ ...prev, isProcessingJoinRequest: false }));
      setShowJoinModal(false);
    }
  };

  const handleRequestAction = async (requestId: string, status: 'approved' | 'declined') => {
    if (!project) return;

    setLoadingStates(prev => ({ ...prev, isProcessingJoinRequest: true }));
    try {
      // Get the request details first to get the user_id
      const { data: request, error: requestError } = await supabase
        .from('project_join_requests')
        .select('*')
        .eq('id', requestId)
        .single();

      if (requestError) throw requestError;

      // Update the request status
      const { error } = await supabase
        .from('project_join_requests')
        .update({ status })
        .eq('id', requestId)
        .select()
        .single();

      if (error) throw error;

      if (status === 'approved') {
        // Add user as collaborator
        const { error: collaboratorError } = await supabase
          .from('project_collaborators')
          .insert({
            project_id: project.id,
            user_id: request.user_id,
            role: 'member',
            status: 'active',
            joined_at: new Date().toISOString()
          });

        if (collaboratorError) throw collaboratorError;

        // Create notification for the user
        const { error: notificationError } = await supabase
          .from('notifications')
          .insert({
            user_id: request.user_id,
            type: 'request_accepted',
            title: 'Project Request Accepted',
            content: `Your request to join project "${project.title}" has been accepted!`,
            read: false,
            created_at: new Date().toISOString()
          });

        if (notificationError) throw notificationError;

        toast.success('Request approved successfully');
        await notifyRequestAccepted(request.user_id, project.title);
      } else {
        // Create notification for declined request
        const { error: notificationError } = await supabase
          .from('notifications')
          .insert({
            user_id: request.user_id,
            type: 'request_declined',
            title: 'Project Request Declined',
            content: `Your request to join project "${project.title}" has been declined.`,
            read: false,
            created_at: new Date().toISOString()
          });

        if (notificationError) throw notificationError;

        toast.success('Request declined successfully');
      }

      // Refresh the join requests list
      fetchJoinRequests();
    } catch (error) {
      console.error('Error handling request action:', error);
      toast.error('Failed to process request');
    } finally {
      setLoadingStates(prev => ({ ...prev, isProcessingJoinRequest: false }));
    }
  };

  const handleDeleteProject = async () => {
    setLoadingStates(prev => ({ ...prev, isProcessingDelete: true }));
    try {
      if (!project || !user) return;

      // First delete all related records
      const deleteRelatedRecords = async () => {
        try {
          // First check and delete join requests
          const { data: joinRequests, error: fetchError } = await supabase
            .from('project_join_requests')
            .select('*')
            .eq('project_id', project.id);
          
          if (fetchError) {
            console.error('Error fetching join requests:', fetchError);
            throw fetchError;
          }

          console.log(`Found ${joinRequests?.length || 0} join requests to delete`);
          
          if (joinRequests && joinRequests.length > 0) {
            const { error: requestsError } = await supabase
              .from('project_join_requests')
              .delete()
              .eq('project_id', project.id);
            
            if (requestsError) {
              console.error('Error deleting join requests:', requestsError);
              throw requestsError;
            }
            console.log('Successfully deleted join requests');
          }

          // Delete discussions
          const { error: discussionsError } = await supabase
            .from('project_discussions')
            .delete()
            .eq('project_id', project.id);
          
          if (discussionsError) {
            console.error('Error deleting discussions:', discussionsError);
            throw discussionsError;
          }
          console.log('Successfully deleted discussions');

          // Delete project members
          const { error: membersError } = await supabase
            .from('project_collaborators')
            .delete()
            .eq('project_id', project.id);
          
          if (membersError) {
            console.error('Error deleting members:', membersError);
            throw membersError;
          }
          console.log('Successfully deleted members');

          // Delete project milestones
          const { error: milestonesError } = await supabase
            .from('project_milestones')
            .delete()
            .eq('project_id', projectId);
          
          if (milestonesError) {
            console.error('Error deleting milestones:', milestonesError);
            throw milestonesError;
          }
          console.log('Successfully deleted milestones');
          
        } catch (error) {
          console.error('Error in deleteRelatedRecords:', error);
          throw error;
        }
      };

      // Delete related records first
      await deleteRelatedRecords();
      console.log('All related records deleted successfully');

      // Then delete the project
      const { error } = await supabase
        .from('academic_projects')
        .delete()
        .eq('id', project.id);

      if (error) {
        console.error('Error deleting project:', error);
        throw error;
      }

      toast.success('Project deleted successfully');
      navigate('/dashboard/academic');
    } catch (error: any) {
      console.error('Error deleting project:', error);
      toast.error(error.message || 'Failed to delete project');
    } finally {
      setLoadingStates(prev => ({ ...prev, isProcessingDelete: false }));
      setShowDeleteModal(false);
    }
  };

  const handleCloseProject = async () => {
    setLoadingStates(prev => ({ ...prev, isProcessingClose: true }));
    try {
      if (!project || !user) return;

      if (user.id !== project.creator_id && !user.user_metadata.is_admin) {
        toast.error('Only the project creator can complete this project');
        return;
      }

      if (project.status === 'completed' || project.status === 'cancelled') {
        toast.error('Project is already completed or cancelled');
        return;
      }

      // First handle any pending join requests
      const { error: requestsError } = await supabase
        .from('project_join_requests')
        .update({ status: 'cancelled' })
        .eq('project_id', project.id)
        .eq('status', 'pending');

      if (requestsError) {
        console.error('Error updating pending requests:', requestsError);
        throw requestsError;
      }

      // Update project members status if needed
      const { error: membersError } = await supabase
        .from('project_collaborators')
        .update({ status: 'completed' })
        .eq('project_id', project.id)
        .in('status', ['active', 'pending']);

      if (membersError) {
        console.error('Error updating project members:', membersError);
        throw membersError;
      }

      // Finally update the project status
      const { error } = await supabase
        .from('academic_projects')
        .update({ 
          status: 'completed',
          updated_at: new Date().toISOString()
        })
        .eq('id', project.id);

      if (error) throw error;

      setProject(prev => prev ? { 
        ...prev, 
        status: 'completed',
        updated_at: new Date().toISOString()
      } : null);
      
      toast.success('Project completed successfully. All members have been notified.');
      await notifyProjectApproved(project.id, project.title);
    } catch (error) {
      console.error('Error closing project:', error);
      toast.error('Failed to complete project. Please try again later.');
    } finally {
      setLoadingStates(prev => ({ ...prev, isProcessingClose: false }));
      setShowCloseModal(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingStates(prev => ({ ...prev, isSendingMessage: true }));
    try {
      if (!user || !project || !newMessage.trim()) return;

      const { error } = await supabase
        .from('project_discussions')
        .insert({
          project_id: project.id,
          user_id: user.id,
          content: newMessage
        });

      if (error) throw error;
      setNewMessage('');
      toast.success('Message sent successfully');
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    } finally {
      setLoadingStates(prev => ({ ...prev, isSendingMessage: false }));
    }
  };

  if (loadingStates.isLoadingProject) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="w-8 h-8 rounded-full border-b-2 border-indigo-600 animate-spin" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="py-12 text-center">
        <p className="text-gray-500">Project not found</p>
        <button
          onClick={() => navigate('/academic/projects')}
          className="mt-4 text-indigo-600 hover:text-indigo-500"
        >
          Back to Projects
        </button>
      </div>
    );
  }

  // Add error handling for project
  if (errorStates.projectError) {
    return (
      <div className="py-12 text-center text-red-600">
        <p>{errorStates.projectError}</p>
        <button onClick={() => navigate('/dashboard/academic')} className="mt-4 text-indigo-600">
          Back to Projects
        </button>
      </div>
    );
  }

  return (
    <ProjectDetailsContent
      project={project}
      user={user}
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      discussions={discussions}
      joinRequests={joinRequests}
      hasExistingRequest={hasExistingRequest}
      showDeleteModal={showDeleteModal}
      setShowDeleteModal={setShowDeleteModal}
      showCloseModal={showCloseModal}
      setShowCloseModal={setShowCloseModal}
      showJoinModal={showJoinModal}
      setShowJoinModal={setShowJoinModal}
      joinMessage={joinMessage}
      setJoinMessage={setJoinMessage}
      handleJoinRequest={handleJoinRequest}
      handleRequestAction={handleRequestAction}
      handleCloseProject={handleCloseProject}
      handleDeleteProject={handleDeleteProject}
      navigate={navigate}
      newMessage={newMessage}
      setNewMessage={setNewMessage}
      handleSendMessage={handleSendMessage}
      loadingStates={loadingStates}
      errorStates={errorStates}
    >
      {/* Add any child components here */}
    </ProjectDetailsContent>
  );
}
