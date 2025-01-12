export interface ProjectInterview {
  id: string;
  project_id: string;
  interviewer_id: string; // project creator
  interviewee_id: string; // user who requested to join
  scheduled_time: string;
  duration_minutes: number;
  status: 'scheduled' | 'completed' | 'cancelled';
  meeting_link?: string;
  created_at: string;
  updated_at: string;
}

export interface InterviewWithProfiles extends ProjectInterview {
  interviewer: {
    username: string;
    avatar_url?: string;
    full_name: string;
  };
  interviewee: {
    username: string;
    avatar_url?: string;
    full_name: string;
  };
}
