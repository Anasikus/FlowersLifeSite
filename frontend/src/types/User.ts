export interface User {
  id: number;
  username: string;
  role: 'admin' | 'employee' | 'user';
  is_blocked: boolean;
}
