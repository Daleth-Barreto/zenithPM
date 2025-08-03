'use client';

import { useState } from 'react';
import {
  DragDropContext,
  Droppable,
  type DropResult,
} from 'react-beautiful-dnd';
import { TicketCard } from './ticket-card';
import type { Task, Project } from '@/lib/types';
import { TaskDetailsSheet } from './task-details-sheet';

interface KanbanBoardProps {
  project: Project;
}

type ColumnData = {
  name: string;
  items: Task[];
};

export function KanbanBoard({ project }: KanbanBoardProps) {
  const initialColumns: Record<Task['status'], ColumnData> = {
    backlog: { name: 'Backlog', items: [] },
    'in-progress': { name: 'In Progress', items: [] },
    review: { name: 'Review', items: [] },
    done: { name: 'Done', items: [] },
  };

  project.tasks.forEach((task) => {
    if (initialColumns[task.status]) {
      initialColumns[task.status].items.push(task);
    }
  });

  const [columns, setColumns] = useState(initialColumns);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const onDragEnd = (result: DropResult) => {
    const { source, destination } = result;
    if (!destination) return;

    const sourceColId = source.droppableId as Task['status'];
    const destColId = destination.droppableId as Task['status'];

    const sourceCol = columns[sourceColId];
    const destCol = columns[destColId];

    const sourceItems = [...sourceCol.items];
    const [removed] = sourceItems.splice(source.index, 1);

    if (sourceColId === destColId) {
      sourceItems.splice(destination.index, 0, removed);
      setColumns({
        ...columns,
        [sourceColId]: { ...sourceCol, items: sourceItems },
      });
    } else {
      const destItems = [...destCol.items];
      destItems.splice(destination.index, 0, removed);
      setColumns({
        ...columns,
        [sourceColId]: { ...sourceCol, items: sourceItems },
        [destColId]: { ...destCol, items: destItems },
      });
    }
  };

  return (
    <div className="flex-1 p-4 md:p-8 space-x-4 flex overflow-x-auto h-full">
      <DragDropContext onDragEnd={onDragEnd}>
        {Object.entries(columns).map(([columnId, column]) => (
          <Droppable key={columnId} droppableId={columnId}>
            {(provided, snapshot) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className={`flex flex-col w-72 lg:w-80 flex-shrink-0 bg-muted/50 rounded-lg transition-colors ${
                  snapshot.isDraggingOver ? 'bg-muted' : ''
                }`}
              >
                <div className="p-3 border-b">
                  <h3 className="font-semibold">{column.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {column.items.length} task{column.items.length !== 1 ? 's' : ''}
                  </p>
                </div>
                <div className="flex-1 p-2 overflow-y-auto">
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
              </div>
            )}
          </Droppable>
        ))}
      </DragDropContext>
      <TaskDetailsSheet
        task={selectedTask}
        project={project}
        isOpen={!!selectedTask}
        onClose={() => setSelectedTask(null)}
      />
    </div>
  );
}
