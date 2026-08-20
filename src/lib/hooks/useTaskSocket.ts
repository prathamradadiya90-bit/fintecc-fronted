'use client';

import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useSocket } from './useSocket';
import { tasksApi } from '@/lib/store/api/tasksApi';
import type { Task } from '@/lib/types/task.types';

interface UseTaskSocketOptions {
  onTaskCreated?: (task: Task) => void;
  onTaskUpdated?: (task: Task) => void;
  onTaskBulkUpdated?: (tasks: Task[]) => void;
  onTaskDeleted?: (payload: { id: string }) => void;
}

/**
 * Custom hook to listen to real-time task events via WebSockets.
 * When task events are received from the firm room, it invalidates the RTK Query
 * tasks cache so all subscribers automatically get updated data.
 */
export function useTaskSocket(options?: UseTaskSocketOptions) {
  const { socket, isConnected } = useSocket();
  const dispatch = useDispatch();

  useEffect(() => {
    if (!socket) return;

    const handleTaskCreated = (newTask: Task) => {
      dispatch(tasksApi.util.invalidateTags([{ type: 'Task', id: 'LIST' }]));
      options?.onTaskCreated?.(newTask);
    };

    const handleTaskUpdated = (updatedTask: Task) => {
      dispatch(
        tasksApi.util.invalidateTags([
          { type: 'Task', id: updatedTask.id },
          { type: 'Task', id: 'LIST' },
        ])
      );
      options?.onTaskUpdated?.(updatedTask);
    };

    const handleTaskBulkUpdated = (arrayOfUpdatedTasks: Task[]) => {
      dispatch(tasksApi.util.invalidateTags([{ type: 'Task', id: 'LIST' }]));
      options?.onTaskBulkUpdated?.(arrayOfUpdatedTasks);
    };

    const handleTaskDeleted = (payload: { id: string }) => {
      dispatch(tasksApi.util.invalidateTags([{ type: 'Task', id: 'LIST' }]));
      options?.onTaskDeleted?.(payload);
    };

    socket.on('task_created', handleTaskCreated);
    socket.on('task_updated', handleTaskUpdated);
    socket.on('task_bulk_updated', handleTaskBulkUpdated);
    socket.on('task_deleted', handleTaskDeleted);

    return () => {
      socket.off('task_created', handleTaskCreated);
      socket.off('task_updated', handleTaskUpdated);
      socket.off('task_bulk_updated', handleTaskBulkUpdated);
      socket.off('task_deleted', handleTaskDeleted);
    };
  }, [socket, dispatch, options]);

  return { socket, isConnected };
}
