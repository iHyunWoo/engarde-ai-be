export class UserResponse {
  id: number;
  email: string;
  name: string;
  role: string;
  team?: {
    id: number;
    name: string;
    description?: string;
  };
}
