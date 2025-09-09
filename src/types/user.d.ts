// user.d.ts
export interface User {
  id?: string;
  full_name: string;
  user_email: string;
  user_class: string;
  user_password?: string;
  role?: string;
  avatar_url?: string;
}