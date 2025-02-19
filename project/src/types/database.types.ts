export interface Profile {
  id: string;
  username: string;
  full_name: string;
  avatar_url: string | null;
  university: string;
  field_of_study?: string | null;
  sub_field?: string | null;
  year_of_enroll?: number | null;
  year_of_completion?: number | null;
  interests?: string[];
  nationality?: string | null;
  bio?: string | null;
  created_at?: string;
}

export interface Forum {
  id: string;
  user_id: string;
  title: string;
  content: string;
  category: string;
  attachment_url?: string;
  created_at: string;
}

export interface Comment {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export interface Like {
  id: string;
  post_id: string;
  user_id: string;
  created_at: string;
}

export interface Friendship {
  id: string;
  user_id1: string;
  user_id2: string;
  created_at: string;
}

export interface FriendRequest {
  id: string;
  sender_id: string;
  receiver_id: string;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
}

export interface Group {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  created_by: string;
  created_at: string;
  members?: number;
}

export interface GroupMember {
  id: string;
  group_id: string;
  user_id: string;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  content: string;
  read: boolean;
  created_at: string;
}

export interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  image_url: string | null;
  read: boolean;
  created_at: string;
}

export interface Friend {
  id: string;
  user_id1: string;
  user_id2: string;
  created_at: string;
}

export interface ForumComment {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  attachment_url?: string | null;
  created_at: string;
}