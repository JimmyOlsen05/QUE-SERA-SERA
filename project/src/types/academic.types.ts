export type ProjectType = 'research_paper' | 'academic_project' | 'study_group';
export type ProjectStatus = 'draft' | 'open' | 'in_progress' | 'completed' | 'cancelled' | 'closed';

export interface Skill {
  id: string;
  name: string;
  category: string;
  created_at: string;
}

export interface AcademicProject {
  id: string;
  title: string;
  description: string;
  project_type: ProjectType;
  status: ProjectStatus;
  creator_id: string;
  creator?: {
    username: string;
    avatar_url?: string;
  };
  university?: string;
  department?: string;
  max_collaborators: number;
  deadline?: string;
  created_at: string;
  updated_at: string;
  paper_link?: string;
  paper_title?: string;
  paper_abstract?: string;
  is_verified: boolean;
  skills?: Skill[];
  collaborators?: ProjectCollaborator[];
  milestones?: ProjectMilestone[];
}

export interface ProjectCollaborator {
  project_id: string;
  user_id: string;
  role: string;
  status: string;
  joined_at: string;
  profile?: {
    username: string;
    avatar_url?: string;
    full_name: string;
    university?: string;
  };
}

export interface ProjectMilestone {
  id: string;
  project_id: string;
  title: string;
  description?: string;
  due_date?: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface ProjectDiscussion {
  id: string;
  project_id: string;
  user_id: string;
  content: string;
  created_at: string;
  updated_at: string;
  profile?: {
    username: string;
    avatar_url?: string;
  };
}
