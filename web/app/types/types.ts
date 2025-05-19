import { z } from "zod";

// Login
export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export type Login = z.infer<typeof LoginSchema>;

// SignUp
export const SignUpSchema = LoginSchema.extend({
  name: z.string().min(2),
});
export type SignUp = z.infer<typeof SignUpSchema>;

// Note
export const NoteSchema = z.object({
  id: z.number(),
  subject: z.string(),
  title: z.string(),
  Content: z.string(),
  files_url: z.array(z.string().url()),
  user_id: z.number(),
  professor_id: z.number(),
  created_at: z.string(), // o z.coerce.date() si deseas convertir string a Date
});
export type Note = z.infer<typeof NoteSchema>;

// Role
export const RoleSchema = z.object({
  id: z.number(),
  name: z.string(),
  level: z.number(),
  description: z.string(),
});
export type Role = z.infer<typeof RoleSchema>;

// User
export const UserSchema = z.object({
  id: z.number(),
  username: z.string(),
  email: z.string().email(),
  role: RoleSchema.optional(),
  created_at: z.string().optional(),
  is_active: z.boolean().optional(),
  role_id: z.number().optional(),
});
export type User = z.infer<typeof UserSchema>;

// UserAuth (Pick)
export const UserAuthSchema = UserSchema.pick({
  id: true,
  username: true,
  email: true,
});
export type UserAuth = z.infer<typeof UserAuthSchema>;

// Professor
export const ProfessorSchema = z.object({
  id: z.number(),
  name: z.string(),
  subject: z.string(),
  total_reviews: z.number(),
  school_id: z.number(),
  text: z.string().optional(),
});
export type Professor = z.infer<typeof ProfessorSchema>;

// Review
export const ReviewSchema = z.object({
  id: z.number(),
  text: z.string(),
  subject: z.string(),
  difficulty: z.number().min(1).max(5),
  created_at: z.string(),
  professorName: z.string(),
  rating: z.number().min(1).max(5),
  would_take_again: z.boolean(),
});
export type Review = z.infer<typeof ReviewSchema>;

// ReviewForm (Omit)
export const ReviewFormSchema = ReviewSchema.omit({
  id: true,
  created_at: true,
  professorName: true,
});
export type ReviewForm = z.infer<typeof ReviewFormSchema>;

// School
export const SchoolSchema = z.object({
  id: z.number(),
  name: z.string(),
  total_reviews: z.number(),
  professors: z.array(ProfessorSchema),
  address: z.string(),
  total_professors: z.number(),
});
export type School = z.infer<typeof SchoolSchema>;

// RandomSchool (Pick)
export const RandomSchoolSchema = SchoolSchema.pick({
  id: true,
  name: true,
});
export type RandomSchool = z.infer<typeof RandomSchoolSchema>;

export type ApiResponse<T> = {
  data: T;
};
