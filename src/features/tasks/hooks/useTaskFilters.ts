'use client';

import { useState, useCallback, useMemo } from 'react';
import type { GetTasksParams } from '@/lib/types/task.types';

export interface TaskFilterState {
  search: string;
  status: string;
  priority: string;
  complianceType: string;
  clientId: string;
  assigneeId: string;
  isOverdue: boolean;
  page: number;
  limit: number;
  viewMode: 'all' | 'my' | 'overdue' | 'review';
}

const initialFilters: TaskFilterState = {
  search: '',
  status: '',
  priority: '',
  complianceType: '',
  clientId: '',
  assigneeId: '',
  isOverdue: false,
  page: 1,
  limit: 50,
  viewMode: 'all',
};

export function useTaskFilters(defaultAssigneeId?: string) {
  const [filters, setFilters] = useState<TaskFilterState>(() => ({
    ...initialFilters,
    assigneeId: defaultAssigneeId || '',
    viewMode: defaultAssigneeId ? 'my' : 'all',
  }));

  const setFilter = useCallback(<K extends keyof TaskFilterState>(key: K, value: TaskFilterState[K]) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      page: key === 'page' ? (value as number) : 1, // Reset page when any filter changes
    }));
  }, []);

  const setViewMode = useCallback(
    (mode: TaskFilterState['viewMode'], currentUserId?: string) => {
      setFilters((prev) => {
        const next = { ...prev, viewMode: mode, page: 1 };
        if (mode === 'my') {
          next.assigneeId = currentUserId || '';
          next.isOverdue = false;
          next.status = '';
        } else if (mode === 'overdue') {
          next.isOverdue = true;
          next.assigneeId = '';
          next.status = '';
        } else if (mode === 'review') {
          next.status = 'REVIEW';
          next.isOverdue = false;
          next.assigneeId = '';
        } else {
          // 'all'
          next.assigneeId = '';
          next.isOverdue = false;
          next.status = '';
        }
        return next;
      });
    },
    []
  );

  const resetFilters = useCallback(() => {
    setFilters(initialFilters);
  }, []);

  const queryParams: GetTasksParams = useMemo(() => {
    const params: GetTasksParams = {
      page: filters.page,
      limit: filters.limit,
    };

    if (filters.search.trim()) params.search = filters.search.trim();
    if (filters.status) params.status = filters.status;
    if (filters.priority) params.priority = filters.priority;
    if (filters.clientId) params.clientId = filters.clientId;
    if (filters.assigneeId) params.assigneeId = filters.assigneeId;
    if (filters.complianceType) params.complianceType = filters.complianceType;
    if (filters.isOverdue) params.isOverdue = 'true';

    return params;
  }, [filters]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.search) count++;
    if (filters.status) count++;
    if (filters.priority) count++;
    if (filters.complianceType) count++;
    if (filters.clientId) count++;
    if (filters.assigneeId) count++;
    if (filters.isOverdue) count++;
    return count;
  }, [filters]);

  return {
    filters,
    queryParams,
    activeFilterCount,
    setFilter,
    setViewMode,
    resetFilters,
  };
}
