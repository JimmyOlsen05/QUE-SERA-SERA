import { AcademicProject, ProjectDiscussion } from '../../types/academic.types';
import { User } from '@supabase/supabase-js';
import { NavigateFunction } from 'react-router-dom';
import { LoadingStates, ErrorStates } from '../../types/loading.types';

interface DatabaseJoinRequest {
  id: string;
  project_id: string;
  user_id: string;
  status: string;
  message: string;
  created_at: string;
  profiles: Array<{
    username: string;
    avatar_url: string | null;
    id: string;
    university?: string;
  }>;
}

interface ProjectDetailsContentProps {
  project: AcademicProject;
  user: User | null;
  activeTab: 'overview' | 'milestones' | 'discussions' | 'interviews';
  setActiveTab: (tab: 'overview' | 'milestones' | 'discussions' | 'interviews') => void;
  discussions: ProjectDiscussion[];
  joinRequests: DatabaseJoinRequest[];
  hasExistingRequest: boolean;
  showDeleteModal: boolean;
  setShowDeleteModal: (show: boolean) => void;
  showCloseModal: boolean;
  setShowCloseModal: (show: boolean) => void;
  showJoinModal: boolean;
  setShowJoinModal: (show: boolean) => void;
  joinMessage: string;
  setJoinMessage: (message: string) => void;
  handleJoinRequest: () => Promise<void>;
  handleRequestAction: (requestId: string, status: 'approved' | 'declined') => Promise<void>;
  handleCloseProject: () => Promise<void>;
  handleDeleteProject: () => Promise<void>;
  navigate: NavigateFunction;
  newMessage: string;
  setNewMessage: (message: string) => void;
  handleSendMessage: (e: React.FormEvent) => Promise<void>;
  loadingStates: LoadingStates;
  errorStates: ErrorStates;
  children?: React.ReactNode;
}

export default function ProjectDetailsContent({
  project,
  user,
  activeTab,
  setActiveTab,
  discussions,
  joinRequests,
  hasExistingRequest,
  showDeleteModal,
  setShowDeleteModal,
  showCloseModal,
  setShowCloseModal,
  showJoinModal,
  setShowJoinModal,
  joinMessage,
  setJoinMessage,
  handleJoinRequest,
  handleRequestAction,
  handleCloseProject,
  handleDeleteProject,
  navigate,
  newMessage,
  setNewMessage,
  handleSendMessage,
  loadingStates,
  errorStates,
  children,
}: ProjectDetailsContentProps) {
  const isCollaborator = project.collaborators?.some(
    c => c.user_id === user?.id && c.status === 'accepted'
  );

  const hasPendingRequest = project.collaborators?.some(
    c => c.user_id === user?.id && c.status === 'pending'
  );

  const isProjectCreator = user && user.id === project.creator_id;

  const tabs = [
    { name: 'Overview', value: 'overview' as const },
    { name: 'Milestones', value: 'milestones' as const },
    { name: 'Discussions', value: 'discussions' as const }
  ];

  return (
    <div className="px-4 py-8 mx-auto max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{project.title}</h1>
            <p className="mt-2 text-sm text-gray-500">
              {project.university} • {project.department}
            </p>
          </div>
          <div className="flex gap-2">
            {user && (user.id === project.creator_id || user.user_metadata.is_admin) && (
              <div className="mt-6 space-y-3">
                {project.status === 'open' && (
                  <button
                    onClick={() => setShowCloseModal(true)}
                    disabled={loadingStates.isProcessingClose}
                    className={`w-full px-4 py-2 text-sm font-medium text-white ${
                      loadingStates.isProcessingClose
                        ? 'bg-yellow-400 cursor-not-allowed'
                        : 'bg-yellow-600 hover:bg-yellow-700'
                    } rounded-md`}
                  >
                    {loadingStates.isProcessingClose ? 'Closing Project...' : 'Close Project'}
                  </button>
                )}
                <button
                  onClick={() => setShowDeleteModal(true)}
                  disabled={loadingStates.isProcessingDelete}
                  className={`w-full px-4 py-2 text-sm font-medium text-white ${
                    loadingStates.isProcessingDelete
                      ? 'bg-red-400 cursor-not-allowed'
                      : 'bg-red-600 hover:bg-red-700'
                  } rounded-md`}
                >
                  {loadingStates.isProcessingDelete ? 'Deleting Project...' : 'Delete Project'}
                </button>
              </div>
            )}
            {user && project.creator_id !== user.id && !isCollaborator && !hasExistingRequest && !joinRequests.some(req => req.user_id === user.id && req.status === 'pending') && (
              <div className="mt-8">
                <div className="space-y-4">
                  <button
                    onClick={() => setShowJoinModal(true)}
                    disabled={loadingStates.isProcessingJoinRequest}
                    className={`w-full px-4 py-2 text-sm font-medium text-white ${
                      loadingStates.isProcessingJoinRequest
                        ? 'bg-indigo-400 cursor-not-allowed'
                        : 'bg-indigo-600 hover:bg-indigo-700'
                    } rounded-md`}
                  >
                    {loadingStates.isProcessingJoinRequest ? 'Sending Request...' : 'Request to Join'}
                  </button>
                </div>
              </div>
            )}
            {hasPendingRequest && (
              <span className="inline-flex items-center px-4 py-2 text-sm text-yellow-700 bg-yellow-100 rounded-md">
                Request Pending
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Join Requests Section */}
      {isProjectCreator && (
        <div className="p-6 bg-white rounded-lg shadow">
          <h2 className="mb-4 text-xl font-semibold">Join Requests</h2>
          {loadingStates.isLoadingJoinRequests ? (
            <div className="flex justify-center items-center py-4">
              <div className="w-8 h-8 rounded-full border-b-2 border-gray-900 animate-spin"></div>
            </div>
          ) : errorStates.joinRequestsError ? (
            <div className="py-4 text-center text-red-500">
              {errorStates.joinRequestsError}
            </div>
          ) : joinRequests.length === 0 ? (
            <div className="py-4 text-center text-gray-500">
              No pending join requests
            </div>
          ) : (
            <div className="space-y-4">
              {joinRequests.map((request) => (
                <div
                  key={request.id}
                  className="flex justify-between items-start p-4 rounded-lg border border-gray-200"
                >
                  <div className="flex items-start space-x-4">
                    <div className="overflow-hidden w-12 h-12 rounded-full">
                      <img
                        src={request.profiles[0]?.avatar_url || '/default-avatar.png'}
                        alt={request.profiles[0]?.username}
                        className="object-cover w-full h-full"
                      />
                    </div>
                    <div>
                      <h3 className="font-semibold">
                        {request.profiles[0]?.username}
                        {request.profiles[0]?.university && (
                          <span className="ml-2 text-sm text-gray-500">
                            ({request.profiles[0].university})
                          </span>
                        )}
                      </h3>
                      <p className="mt-1 text-sm text-gray-600">{request.message}</p>
                      <p className="mt-1 text-xs text-gray-400">
                        Requested {new Date(request.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  {request.status === 'pending' && (
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleRequestAction(request.id, 'approved')}
                        disabled={loadingStates.isProcessingJoinRequest}
                        className="px-4 py-2 text-white bg-green-500 rounded-md hover:bg-green-600 disabled:opacity-50"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => handleRequestAction(request.id, 'declined')}
                        disabled={loadingStates.isProcessingJoinRequest}
                        className="px-4 py-2 text-white bg-red-500 rounded-md hover:bg-red-600 disabled:opacity-50"
                      >
                        Decline
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Error Messages */}
      {Object.entries(errorStates).map(([key, error]) => 
        error && (
          <div key={key} className="p-4 mt-4 text-red-800 bg-red-50 rounded-md">
            {error}
          </div>
        )
      )}

      {/* Loading States */}
      {loadingStates.isLoadingProject && (
        <div className="flex justify-center items-center py-8">
          <div className="w-8 h-8 rounded-full border-b-2 border-indigo-600 animate-spin"></div>
        </div>
      )}

      {/* Tabs */}
      <div className="mb-8 border-b border-gray-200">
        <nav className="flex -mb-px space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
                ${activeTab === tab.value
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
              `}
            >
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Main content */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left column */}
        <div className="lg:col-span-2">
          {children}
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Project Info */}
          <div className="p-6 bg-white rounded-lg shadow-sm">
            <h2 className="mb-4 text-lg font-medium text-gray-900">Project Info</h2>
            <dl className="space-y-4">
              <div>
                <dt className="text-sm font-medium text-gray-500">Status</dt>
                <dd className="mt-1">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      project.status === 'open'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {project.status}
                  </span>
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Type</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {project.project_type.replace('_', ' ')}
                </dd>
              </div>
              {project.deadline && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">Deadline</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {new Date(project.deadline).toLocaleDateString()}
                  </dd>
                </div>
              )}
            </dl>
          </div>

          {/* Project Members */}
          <div className="mt-6">
            <h3 className="text-lg font-medium text-gray-900">Project Members</h3>
            
            {/* Active Members */}
            <div className="mt-4">
              <h4 className="text-sm font-medium text-gray-700">Active Members</h4>
              <div className="mt-2 space-y-3">
                {/* Project Creator */}
                <div className="flex items-center space-x-3">
                  {project.creator?.avatar_url ? (
                    <img src={project.creator.avatar_url} alt="" className="w-8 h-8 rounded-full" />
                  ) : (
                    <div className="flex justify-center items-center w-8 h-8 bg-gray-200 rounded-full">
                      <span className="text-sm font-medium text-gray-600">
                        {project.creator?.username?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {project.creator?.username} <span className="text-gray-500">(Creator)</span>
                    </p>
                  </div>
                </div>

                {/* Active Collaborators */}
                {project.collaborators
                  ?.filter(collab => collab.status === 'active')
                  .map(collaborator => (
                    <div 
                      key={collaborator.user_id}
                      className="flex items-center space-x-3 transition-opacity cursor-pointer hover:opacity-75"
                      onClick={() => navigate(`/profile/${collaborator.user_id}`)}
                    >
                      {collaborator.profile?.avatar_url ? (
                        <img src={collaborator.profile.avatar_url} alt="" className="w-8 h-8 rounded-full" />
                      ) : (
                        <div className="flex justify-center items-center w-8 h-8 bg-gray-200 rounded-full">
                          <span className="text-sm font-medium text-gray-600">
                            {collaborator.profile?.username?.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {collaborator.profile?.username}
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>

          {activeTab === 'discussions' && (
            <div className="space-y-4">
              {discussions.map((discussion) => (
                <div key={discussion.id} className="p-4 bg-white rounded-lg shadow">
                  <p>{discussion.content}</p>
                  <span className="text-sm text-gray-500">
                    {new Date(discussion.created_at).toLocaleDateString()}
                  </span>
                </div>
              ))}
              <form onSubmit={handleSendMessage}>
                <textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Write a message..."
                  className="p-2 w-full rounded-md border"
                />
                <button
                  type="submit"
                  disabled={loadingStates.isSendingMessage}
                  className="px-4 py-2 mt-2 text-white bg-indigo-600 rounded-md"
                >
                  {loadingStates.isSendingMessage ? 'Sending...' : 'Send'}
                </button>
              </form>
            </div>
          )}

          
        </div>
      </div>

      {/* Modals */}
      {showCloseModal && (
        <div className="overflow-y-auto fixed inset-0 z-50">
          <div className="flex justify-center items-center p-4 min-h-screen">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>
            <div className="relative p-6 w-full max-w-lg bg-white rounded-lg">
              <h3 className="text-lg font-medium text-gray-900">Close Project</h3>
              <p className="mt-2 text-sm text-gray-500">
                Are you sure you want to close this project? This action cannot be undone.
              </p>
              <div className="flex justify-end mt-5 space-x-3">
                <button
                  onClick={() => setShowCloseModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white rounded-md border border-gray-300 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCloseProject}
                  disabled={loadingStates.isProcessingClose}
                  className="px-4 py-2 text-sm font-medium text-white bg-yellow-600 rounded-md hover:bg-yellow-700 disabled:opacity-50"
                >
                  {loadingStates.isProcessingClose ? 'Closing...' : 'Close Project'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showDeleteModal && (
        <div className="overflow-y-auto fixed inset-0 z-50">
          <div className="flex justify-center items-center p-4 min-h-screen">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>
            <div className="relative p-6 w-full max-w-lg bg-white rounded-lg">
              <h3 className="text-lg font-medium text-gray-900">Delete Project</h3>
              <p className="mt-2 text-sm text-gray-500">
                Are you sure you want to delete this project? This action cannot be undone.
              </p>
              <div className="flex justify-end mt-5 space-x-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white rounded-md border border-gray-300 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteProject}
                  disabled={loadingStates.isProcessingDelete}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50"
                >
                  {loadingStates.isProcessingDelete ? 'Deleting...' : 'Delete Project'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showJoinModal && (
        <div className="overflow-y-auto fixed inset-0 z-50">
          <div className="flex justify-center items-center p-4 min-h-screen">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>
            <div className="relative p-6 w-full max-w-lg bg-white rounded-lg">
              <h3 className="text-lg font-medium text-gray-900">Join Project</h3>
              <div className="mt-4">
                <textarea
                  value={joinMessage}
                  onChange={(e) => setJoinMessage(e.target.value)}
                  placeholder="Why do you want to join this project?"
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  rows={4}
                />
              </div>
              <div className="flex justify-end mt-5 space-x-3">
                <button
                  onClick={() => setShowJoinModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white rounded-md border border-gray-300 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleJoinRequest}
                  disabled={loadingStates.isProcessingJoinRequest}
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:opacity-50"
                >
                  {loadingStates.isProcessingJoinRequest ? 'Sending...' : 'Send Request'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}