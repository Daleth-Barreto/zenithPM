
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

export interface Team {
  id: string;
  name: string;
  ownerId: string;
  projectId: string;
  members: TeamMember[];
  memberIds: string[];
  createdAt: any;
}

export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';
export type TaskStatus = 'backlog' | 'in-progress' | 'review' | 'done';
export type SubtaskStatus = 'pending' | 'completed';

export interface TaskTag {
  id: string;
  label: string;
  color: 'blue' | 'green' | 'orange' | 'purple' | 'red';
}

export interface Subtask {
  id: string;
  title: string;
  status: SubtaskStatus;
}

export interface Comment {
    id: string;
    text: string;
    authorId: string;
    authorName: string;
    authorAvatarUrl?: string;
    createdAt: any; // Firestore Timestamp
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  startDate?: Date;
  dueDate?: Date;
  assignee?: TeamMember | null;
  assigneeId?: string | null;
  collaborators?: TeamMember[];
  tags?: TaskTag[];
  subtasks?: Subtask[];
  comments?: Comment[];
  order: number;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  ownerId: string;
  imageUrl: string;
  color: string;
  progress: number;
  team: TeamMember[];
  teamIds: string[]; // User IDs
  tasks: Task[];
  associatedTeamIds?: string[];
}

export interface Invitation {
  id: string;
  type: 'project' | 'team';
  targetId: string;
  targetName: string;
  projectId?: string; // Only for team invitations
  recipientEmail: string;
  status: 'pending' | 'accepted' | 'declined';
  inviterName: string;
  inviterId: string;
  createdAt: any;
}

export interface Notification {
    id: string;
    userId: string; // The user who should receive the notification
    message: string;
    link: string; // A link to the relevant page (e.g., task details)
    read: boolean;
    createdAt: any; // Firestore Timestamp
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
