import type { User, TeamMember, Project, Task } from './types';

export const mockUsers: User[] = [
  { id: 'u1', name: 'Alice Johnson', email: 'alice@example.com', avatarUrl: 'https://placehold.co/100x100/408080/FFFFFF', initials: 'AJ' },
  { id: 'u2', name: 'Bob Williams', email: 'bob@example.com', avatarUrl: 'https://placehold.co/100x100/40B080/FFFFFF', initials: 'BW' },
  { id: 'u3', name: 'Charlie Brown', email: 'charlie@example.com', avatarUrl: 'https://placehold.co/100x100/F0B93E/FFFFFF', initials: 'CB' },
  { id: 'u4', name: 'Diana Miller', email: 'diana@example.com', avatarUrl: 'https://placehold.co/100x100/E94F37/FFFFFF', initials: 'DM' },
  { id: 'u5', name: 'Ethan Garcia', email: 'ethan@example.com', avatarUrl: 'https://placehold.co/100x100/2F3D4F/FFFFFF', initials: 'EG' },
];

export const mockTeamMembers: TeamMember[] = mockUsers.map((user, index) => ({
  ...user,
  role: index === 0 ? 'Admin' : 'Member',
  expertise: ['Frontend', 'Backend', 'UI/UX', 'DevOps', 'QA'][index % 5],
  currentWorkload: [60, 80, 40, 90, 20][index % 5],
}));

const generateTasks = (count: number): Task[] => {
  const tasks: Task[] = [];
  const statuses: Task['status'][] = ['backlog', 'in-progress', 'review', 'done'];
  const priorities: Task['priority'][] = ['low', 'medium', 'high', 'urgent'];
  const tags: Task['tags'] = [
    { id: 't1', label: 'Bug', color: 'red' },
    { id: 't2', label: 'Feature', color: 'blue' },
    { id: 't3', label: 'UI', color: 'purple' },
    { id: 't4', label: 'Refactor', color: 'orange' },
  ];

  for (let i = 1; i <= count; i++) {
    const status = statuses[i % statuses.length];
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + (i * 3 - 10)); // Some past, some future

    tasks.push({
      id: `task-${i}`,
      title: `Task number ${i}`,
      description: `This is a detailed description for task number ${i}. It involves several steps and requires careful attention to detail.`,
      status,
      priority: priorities[i % priorities.length],
      assignee: mockTeamMembers[i % mockTeamMembers.length],
      collaborators: [mockTeamMembers[(i + 1) % mockTeamMembers.length], mockTeamMembers[(i + 2) % mockTeamMembers.length]],
      tags: [tags[i % tags.length]],
      dueDate: status !== 'done' ? dueDate : undefined,
    });
  }
  return tasks;
};

const allTasks = generateTasks(25);

export const mockProjects: Project[] = [
  {
    id: 'proj-1',
    name: 'QuantumLeap CRM',
    description: 'A next-generation CRM platform using AI to predict customer needs.',
    imageUrl: 'https://placehold.co/600x400/408080/FFFFFF',
    progress: 75,
    team: mockTeamMembers.slice(0, 4),
    tasks: allTasks.slice(0, 10),
  },
  {
    id: 'proj-2',
    name: 'StellarWallet Mobile App',
    description: 'A secure and user-friendly crypto wallet for mobile devices.',
    imageUrl: 'https://placehold.co/600x400/40B080/FFFFFF',
    progress: 40,
    team: mockTeamMembers.slice(1, 5),
    tasks: allTasks.slice(10, 20),
  },
  {
    id: 'proj-3',
    name: 'NovaDB Cloud Migration',
    description: 'Migrating legacy database systems to a modern cloud infrastructure.',
    imageUrl: 'https://placehold.co/600x400/222222/FFFFFF',
    progress: 90,
    team: mockTeamMembers.slice(2, 4),
    tasks: allTasks.slice(20, 25),
  },
  {
    id: 'proj-4',
    name: 'Project Phoenix',
    description: 'Internal tool for project management and team collaboration.',
    imageUrl: 'https://placehold.co/600x400/E94F37/FFFFFF',
    progress: 15,
    team: mockTeamMembers.slice(0, 3),
    tasks: [],
  },
];

export const getProjectById = (id: string | undefined): Project | undefined => {
  return mockProjects.find(p => p.id === id);
};

export const getTaskById = (projectId: string | undefined, taskId: string | undefined): Task | undefined => {
  const project = getProjectById(projectId);
  return project?.tasks.find(t => t.id === taskId);
}
