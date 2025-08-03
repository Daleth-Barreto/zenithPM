
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
  }, [tasks]);

  const handleAddTask = async (status: TaskStatus) => {
    const order = columns[status].items.length;
    const newTaskData = {
        title: `Nueva Tarea`,
        status,
        priority: 'medium' as const,
        description: '',
        subtasks: [],
    };
    await createTask(project.id, { ...newTaskData, order });
    // Real-time listener will update the state
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
    
    // Moving within the same column
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

        // Update order in Firebase
        sourceItems.forEach((task, index) => {
            if (task.order !== index) {
              updateTaskOrder(project.id, task.id, index);
            }
        });
    } else { // Moving to a different column
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

        // Update status and order for the moved task
        updateTaskStatus(project.id, movedItem.id, destColId, destination.index);

        // Update order for remaining items in source column
        sourceItems.forEach((task, index) => {
            if (task.order !== index) {
              updateTaskOrder(project.id, task.id, index);
            }
        });
        
        // Update order for items in destination column
        endItems.forEach((task, index) => {
            if (task.order !== index && task.id !== movedItem.id) {
              updateTaskOrder(project.id, task.id, index);
            }
        });
    }
  };

  return (
    <div className="flex-1 p-4 md:p-8 space-x-4 flex overflow-x-auto h-full bg-muted/40">
      <DragDropContext onDragEnd={onDragEnd}>
        {columnOrder.map((columnId) => {
          const column = columns[columnId];
          if (!column) return null;
          return (
            <div key={columnId} className="flex flex-col w-80 flex-shrink-0">
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
      </DragDropContext>
      <TaskDetailsSheet
        task={selectedTask}
        project={project}
        isOpen={!!selectedTask}
        onClose={() => setSelectedTask(null)}
        onUpdate={(updatedTask) => {
            // Optimistically update the selected task for instant feedback
            setSelectedTask(updatedTask);
            // The real-time listener will handle the main state update
        }}
      />
    </div>
  );
}
