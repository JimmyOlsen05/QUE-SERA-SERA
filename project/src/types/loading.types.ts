export interface LoadingStates {
  isLoadingProject: boolean;
  isLoadingDiscussions: boolean;
  isLoadingJoinRequests: boolean;
  isLoadingCollaborators: boolean;
  isProcessingJoinRequest: boolean;
  isProcessingDelete: boolean;
  isProcessingClose: boolean;
  isSendingMessage: boolean;
  isSchedulingInterview: boolean;
}

export interface ErrorStates {
  projectError: string | null;
  discussionsError: string | null;
  joinRequestsError: string | null;
  collaboratorsError: string | null;
  messageError: string | null;
  interviewError: string | null;
}
