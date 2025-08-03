
export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  initials: string;
}

export interface TeamMember extends User {
  role: 'Admin' | 'Miembro';
  expertise: string;
  currentWorkload: number; // A number from 0 to 100
}

export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';
export type TaskStatus = 'backlog' | 'in-progress' | 'review' | 'done';

export interface TaskTag {
  id: string;
  label: string;
  color: 'blue' | 'green' | 'orange' | 'purple' | 'red';
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: Date;
  assignee?: TeamMember;
  collaborators?: TeamMember[];
  tags?: TaskTag[];
}

export interface Project {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  progress: number;
  team: TeamMember[];
  tasks: Task[];
}

export interface SignInData {
  email: string;
  password?: string;
}

export interface SignUpData extends SignInData {
  fullName: string;
}

export type Plan = 'Freelancer' | 'Startup' | 'Enterprise';

export interface SignUpFormValues extends SignUpData {
    confirmPassword?: string;
    company?: string;
    role?: string;
    plan?: Plan;
}
