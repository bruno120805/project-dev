export interface Login {
  email: string;
  password: string;
}

export type SignUp = Login & {
  name: string;
};

export interface Note {
  id: number;
  subject: string;
  title: string;
  Content: string;
  files_url: string[];
  user_id: number;
  professor_id: number;
  created_at: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
  role?: Role;
  created_at?: string;
  is_active?: boolean;
  role_id?: number;
}

export type UserAuth = Pick<User, "id" | "username" | "email">;

export interface Role {
  description: string;
  id: number;
  level: number;
  name: string;
}

export interface Professor {
  id: number;
  name: string;
  subject: string;
  total_reviews: number;
  school_id: number;
  text?: string;
}

export interface Review {
  id: number;
  text: string;
  subject: string;
  difficulty: number;
  created_at: string;
  professorName: string;
  rating: number;
  would_take_again: boolean;
}

export type ReviewForm = Omit<Review, "id" | "created_at" | "professorName">;

export interface School {
  id: number;
  name: string;
  total_reviews: number;
  professors: Professor[];
  address: string;
  total_professors: number;
}

export type RandomSchool = Pick<School, "id" | "name">;
