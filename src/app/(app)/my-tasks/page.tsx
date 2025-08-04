
'use client';

import { UserTaskList } from '@/components/tasks/user-task-list';

export default function MyTasksPage() {
  return (
    <div className="p-4 md:p-8">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Mis Tareas</h1>
        <p className="text-muted-foreground">Una vista centralizada de todas las tareas que tienes asignadas.</p>
      </div>
      <UserTaskList />
    </div>
  );
}
