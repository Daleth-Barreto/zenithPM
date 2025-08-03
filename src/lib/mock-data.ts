import type { User, TeamMember, Project, Task } from './types';

export const mockUsers: User[] = [
  { id: 'u1', name: 'Alicia Johnson', email: 'alicia@example.com', avatarUrl: 'https://placehold.co/100x100/408080/FFFFFF', initials: 'AJ' },
  { id: 'u2', name: 'Roberto Williams', email: 'roberto@example.com', avatarUrl: 'https://placehold.co/100x100/40B080/FFFFFF', initials: 'RW' },
  { id: 'u3', name: 'Carlos Brown', email: 'carlos@example.com', avatarUrl: 'https://placehold.co/100x100/F0B93E/FFFFFF', initials: 'CB' },
  { id: 'u4', name: 'Diana Miller', email: 'diana@example.com', avatarUrl: 'https://placehold.co/100x100/E94F37/FFFFFF', initials: 'DM' },
  { id: 'u5', name: 'Esteban Garcia', email: 'esteban@example.com', avatarUrl: 'https://placehold.co/100x100/2F3D4F/FFFFFF', initials: 'EG' },
];

export const mockTeamMembers: TeamMember[] = mockUsers.map((user, index) => ({
  ...user,
  role: index === 0 ? 'Admin' : 'Miembro',
  expertise: ['Frontend', 'Backend', 'UI/UX', 'DevOps', 'QA'][index % 5],
  currentWorkload: [60, 80, 40, 90, 20][index % 5],
}));

const generateTasks = (count: number): Task[] => {
  const tasks: Task[] = [];
  const statuses: Task['status'][] = ['backlog', 'in-progress', 'review', 'done'];
  const priorities: Task['priority'][] = ['low', 'medium', 'high', 'urgent'];
  const tags: Task['tags'] = [
    { id: 't1', label: 'Error', color: 'red' },
    { id: 't2', label: 'Funcionalidad', color: 'blue' },
    { id: 't3', label: 'UI', color: 'purple' },
    { id: 't4', label: 'Refactorizar', color: 'orange' },
  ];

  for (let i = 1; i <= count; i++) {
    const status = statuses[i % statuses.length];
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + (i * 3 - 10)); // Some past, some future

    tasks.push({
      id: `task-${i}`,
      title: `Tarea número ${i}`,
      description: `Esta es una descripción detallada para la tarea número ${i}. Implica varios pasos y requiere atención cuidadosa a los detalles.`,
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

export const mockProjects: Project[] = [];

export const getProjectById = (id: string | undefined): Project | undefined => {
  return mockProjects.find(p => p.id === id);
};

export const getTaskById = (projectId: string | undefined, taskId: string | undefined): Task | undefined => {
  const project = getProjectById(projectId);
  return project?.tasks.find(t => t.id === taskId);
}
