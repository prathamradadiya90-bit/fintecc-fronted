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
  pollingIntervalMs?: number;
}

/**
 * Custom hook to listen to real-time task events via WebSockets,
 * with an automatic, resilient HTTP polling fallback for serverless environments (e.g. Vercel).
 */
export function useTaskSocket(options?: UseTaskSocketOptions) {
  const { socket, isConnected, isSupported, isPollingFallback } = useSocket();
  const dispatch = useDispatch();

  // 1. WebSocket Event Listener (active when WebSockets are connected)
  useEffect(() => {
    if (!socket || !isConnected) return;

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
  }, [socket, isConnected, dispatch, options]);

  // 2. Intelligent HTTP Polling Fallback (when WebSockets are not connected or unsupported)
  useEffect(() => {
    if (isConnected) return;

    const intervalMs = options?.pollingIntervalMs || 25000;
    const interval = setInterval(() => {
      if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
        dispatch(tasksApi.util.invalidateTags([{ type: 'Task', id: 'LIST' }]));
      }
    }, intervalMs);

    const handleFocus = () => {
      dispatch(tasksApi.util.invalidateTags([{ type: 'Task', id: 'LIST' }]));
    };

    window.addEventListener('focus', handleFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
    };
  }, [isConnected, dispatch, options?.pollingIntervalMs]);

  return {
    socket,
    isConnected,
    isSupported,
    isPollingFallback,
    isSyncActive: isConnected || isPollingFallback,
  };
}
