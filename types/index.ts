export type Role = 'viewer' | 'author' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  created_at: string;
}

export interface Post {
  id: string;
  title: string;
  body: string;
  image_url: string | null;
  author_id: string;
  summary: string | null;
  slug: string;
  published: boolean;
  created_at: string;
  updated_at: string;
  author?: User;
}

export interface Comment {
  id: string;
  post_id: string;
  user_id: string;
  comment_text: string;
  created_at: string;
  user?: User;
}
