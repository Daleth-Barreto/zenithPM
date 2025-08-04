
'use client';

import { useEffect, useState } from 'react';
import {
  DragDropContext,
  Droppable,
  Draggable,
  type DropResult,
} from '@hello-pangea/dnd';
import { TicketCard } from './ticket-card';
import type { Task, Project, TaskStatus } from '@/lib/types';
import { TaskDetailsSheet } from './task-details-sheet';
import { getTasksForProject, createTask, updateTaskStatus, updateTaskOrder } from '@/lib/firebase-services';
import { Button } from '../ui/button';
import { Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface KanbanBoardProps {
  project: Project;
}

type ColumnData = {
  name: string;
  items: Task[];
};

const initialColumns: Record<TaskStatus, ColumnData> = {
  backlog: { name: 'Pendiente', items: [] },
  'in-progress': { name: 'En Progreso', items: [] },
  review: { name: 'En Revisión', items: [] },
  done: { name: 'Hecho', items: [] },
};

const columnOrder: TaskStatus[] = ['backlog', 'in-progress', 'review', 'done'];

export function KanbanBoard({ project }: KanbanBoardProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [columns, setColumns] = useState(initialColumns);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (project.id) {
      const unsubscribe = getTasksForProject(project.id, (fetchedTasks) => {
        setTasks(fetchedTasks);
      });
      return () => unsubscribe();
    }
  }, [project.id]);

  useEffect(() => {
    const newColumns = JSON.parse(JSON.stringify(initialColumns)); // Deep copy

    tasks.forEach((task) => {
      if (newColumns[task.status]) {
        newColumns[task.status].items.push(task);
      }
    });

    // Sort tasks within each column by order
    Object.keys(newColumns).forEach(key => {
        newColumns[key as TaskStatus].items.sort((a, b) => a.order - b.order);
    });

    setColumns(newColumns);

    // This is the key change: keep selectedTask in sync with the master task list
    if (selectedTask) {
      const updatedSelectedTask = tasks.find(t => t.id === selectedTask.id);
      if (updatedSelectedTask) {
        setSelectedTask(updatedSelectedTask);
      } else {
        // The task was deleted, so close the sheet
        setSelectedTask(null);
      }
    }

  }, [tasks, selectedTask?.id]);

  const handleAddTask = async (status: TaskStatus) => {
    const order = columns[status].items.length;
    const newTaskData = {
        title: `Nueva Tarea`,
        status,
        priority: 'medium' as const,
        description: '',
        subtasks: [],
    };
    const newTaskId = await createTask(project.id, { ...newTaskData, order });
    
    // Find the newly created task to open its details
    // We get the full list of tasks from the listener, so we need to find it there
    // A better approach might be to have createTask return the full object.
    // For now, let's create a temporary object to show.
    const newTaskObject: Task = {
        id: newTaskId,
        ...newTaskData,
        order,
    };
    setSelectedTask(newTaskObject);
    
    toast({
      title: 'Tarea Creada',
      description: `Se ha añadido una nueva tarea en la columna "${status}".`,
    });
  };

  const onDragEnd = (result: DropResult) => {
    const { source, destination } = result;
    if (!destination) return;

    const sourceColId = source.droppableId as TaskStatus;
    const destColId = destination.droppableId as TaskStatus;
    
    const startCol = columns[sourceColId];
    const endCol = columns[destColId];
    
    if (!startCol || !endCol) return;

    const sourceItems = [...startCol.items];
    const [movedItem] = sourceItems.splice(source.index, 1);
    
    if (sourceColId === destColId) {
        sourceItems.splice(destination.index, 0, movedItem);
        
        const newColumns = {
            ...columns,
            [sourceColId]: {
                ...startCol,
                items: sourceItems
            }
        };
        setColumns(newColumns);

        sourceItems.forEach((task, index) => {
            if (task.order !== index) {
              updateTaskOrder(project.id, task.id, index);
            }
        });
    } else { 
        const endItems = [...endCol.items];
        endItems.splice(destination.index, 0, movedItem);

        const newColumns = {
            ...columns,
            [sourceColId]: {
                ...startCol,
                items: sourceItems
            },
            [destColId]: {
                ...endCol,
                items: endItems
            }
        };
        setColumns(newColumns);

        updateTaskStatus(project.id, movedItem.id, destColId, destination.index);

        sourceItems.forEach((task, index) => {
            if (task.order !== index) {
              updateTaskOrder(project.id, task.id, index);
            }
        });
        
        endItems.forEach((task, index) => {
            if (task.order !== index && task.id !== movedItem.id) {
              updateTaskOrder(project.id, task.id, index);
            }
        });
    }
  };

  return (
    <div className="flex h-full">
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex space-x-4">
          {columnOrder.map((columnId) => {
            const column = columns[columnId];
            if (!column) return null;
            return (
              <div key={columnId} className="flex flex-col w-[80vw] sm:w-72 lg:w-80 flex-shrink-0">
                <div className="flex items-center justify-between p-3 rounded-t-lg mb-2">
                  <h3 className="font-semibold text-lg">{column.name}</h3>
                  <span className="text-sm font-medium text-muted-foreground bg-muted rounded-full px-2 py-0.5">
                    {column.items.length}
                  </span>
                </div>
                
                <Droppable key={columnId} droppableId={columnId}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`flex-1 p-2 rounded-b-lg transition-colors min-h-[150px]
                        ${snapshot.isDraggingOver ? 'bg-primary/10' : ''}`}
                    >
                      {column.items.map((task, index) => (
                        <TicketCard
                          key={task.id}
                          task={task}
                          index={index}
                          onClick={() => setSelectedTask(task)}
                        />
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
                 <Button variant="ghost" size="sm" className="mt-2" onClick={() => handleAddTask(columnId)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Añadir Tarea
                </Button>
              </div>
            )
          })}
        </div>
      </DragDropContext>
      <TaskDetailsSheet
        task={selectedTask}
        project={project}
        isOpen={!!selectedTask}
        onClose={() => setSelectedTask(null)}
        onUpdate={(updatedTask) => {
            // This is primarily for when we are editing the task details.
            // The real-time updates are handled by the useEffect above.
            setSelectedTask(updatedTask);
        }}
      />
    </div>
  );
}
