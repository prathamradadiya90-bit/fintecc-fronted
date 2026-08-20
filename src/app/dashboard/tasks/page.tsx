'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '@/lib/store/store';
import {
  useGetTasksQuery,
  useCreateTaskMutation,
  useUpdateTaskMutation,
  useBulkUpdateTasksMutation,
  useDeleteTaskMutation,
  useImportMasterExcelMutation,
} from '@/lib/store/api/tasksApi';
import { useGetStaffQuery } from '@/lib/store/api/authApi';
import { useGetClientsQuery } from '@/lib/store/api/clientsApi';
import { useTaskSocket } from '@/lib/hooks/useTaskSocket';
import { useToast } from '@/components/ui/Toast';
import { useTaskFilters } from '@/features/tasks/hooks/useTaskFilters';
import { TaskGridToolbar } from '@/features/tasks/components/TaskGridToolbar';
import { TaskFiltersBar } from '@/features/tasks/components/TaskFiltersBar';
import { TaskGrid } from '@/features/tasks/components/TaskGrid';
import { CreateTaskModal } from '@/features/tasks/components/CreateTaskModal';
import { EditTaskDrawer } from '@/features/tasks/components/EditTaskDrawer';
import { ImportExcelModal } from '@/features/tasks/components/ImportExcelModal';
import type { Task, TaskStatus, TaskPriority, CreateTaskRequest } from '@/lib/types/task.types';

export default function WorkBoardPage() {
  const user = useSelector((state: RootState) => state.auth.user);
  const { showToast } = useToast();

  const isStaffRole = user?.role === 'EMPLOYEE' || user?.role === 'ACCOUNTANT';
  const defaultAssigneeId = isStaffRole ? user?.id : undefined;

  // Filter state
  const {
    filters,
    queryParams,
    activeFilterCount,
    setFilter,
    setViewMode,
    resetFilters,
  } = useTaskFilters(defaultAssigneeId);

  // RTK Query hooks
  const {
    data: tasksResponse,
    isLoading: isLoadingTasks,
    isFetching: isFetchingTasks,
    refetch: refetchTasks,
  } = useGetTasksQuery(queryParams);

  const { data: staffResponse, isLoading: isLoadingStaff } = useGetStaffQuery();
  const { data: clientsResponse, isLoading: isLoadingClients } = useGetClientsQuery({
    limit: 1000,
  });

  const [createTask] = useCreateTaskMutation();
  const [updateTask] = useUpdateTaskMutation();
  const [bulkUpdateTasks] = useBulkUpdateTasksMutation();
  const [deleteTask] = useDeleteTaskMutation();
  const [importMasterExcel] = useImportMasterExcelMutation();

  // WebSockets live sync
  const { isConnected: isSocketConnected } = useTaskSocket({
    onTaskCreated: (newTask) => {
      showToast(`New task created: "${newTask.title}"`, 'info');
    },
    onTaskUpdated: (updatedTask) => {
      // Optional subtle notification if needed
    },
  });

  // Modal / Drawer states
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const tasks = useMemo(() => tasksResponse?.data || [], [tasksResponse]);
  const totalTasks = tasksResponse?.total || 0;
  const staffList = useMemo(() => staffResponse?.data || [], [staffResponse]);
  const clientsList = useMemo(() => clientsResponse?.data || [], [clientsResponse]);

  // Handle View Mode switch
  const handleViewModeChange = (mode: typeof filters.viewMode) => {
    setViewMode(mode, user?.id);
  };

  // Create Task Handler
  const handleCreateTask = async (data: any) => {
    const res = await createTask(data as CreateTaskRequest).unwrap();
    showToast('Task created successfully!', 'success');
  };

  // Update Task Status Inline
  const handleStatusChange = async (taskId: string, newStatus: TaskStatus) => {
    try {
      await updateTask({
        id: taskId,
        data: { status: newStatus },
      }).unwrap();
      showToast(`Status updated to ${newStatus}`, 'success');
    } catch (err: any) {
      showToast(err?.data?.message || 'Failed to update status', 'error');
    }
  };

  // Update Full Task from Drawer
  const handleUpdateTask = async (taskId: string, updates: Partial<Task>) => {
    try {
      await updateTask({
        id: taskId,
        data: updates as any,
      }).unwrap();
      showToast('Task updated successfully', 'success');
      // Update local editing task state if open
      if (editingTask && editingTask.id === taskId) {
        setEditingTask((prev) => (prev ? { ...prev, ...updates } : null));
      }
    } catch (err: any) {
      showToast(err?.data?.message || 'Failed to update task', 'error');
      throw err;
    }
  };

  // Delete Task
  const handleDeleteTask = async (taskId: string) => {
    try {
      await deleteTask(taskId).unwrap();
      showToast('Task deleted successfully', 'success');
    } catch (err: any) {
      showToast(err?.data?.message || 'Failed to delete task', 'error');
      throw err;
    }
  };

  // Bulk Update Status
  const handleBulkUpdateStatus = async (taskIds: string[], status: TaskStatus) => {
    try {
      await bulkUpdateTasks({
        taskIds,
        updates: { status },
      }).unwrap();
      showToast(`Updated status for ${taskIds.length} tasks`, 'success');
    } catch (err: any) {
      showToast(err?.data?.message || 'Failed to bulk update tasks', 'error');
    }
  };

  // Bulk Update Assignee
  const handleBulkUpdateAssignee = async (taskIds: string[], assigneeId: string) => {
    try {
      await bulkUpdateTasks({
        taskIds,
        updates: { assigneeId },
      }).unwrap();
      showToast(`Reassigned ${taskIds.length} tasks`, 'success');
    } catch (err: any) {
      showToast(err?.data?.message || 'Failed to reassign tasks', 'error');
    }
  };

  // Bulk Update Priority
  const handleBulkUpdatePriority = async (taskIds: string[], priority: TaskPriority) => {
    try {
      await bulkUpdateTasks({
        taskIds,
        updates: { priority },
      }).unwrap();
      showToast(`Updated priority for ${taskIds.length} tasks`, 'success');
    } catch (err: any) {
      showToast(err?.data?.message || 'Failed to update priority', 'error');
    }
  };

  // Bulk Delete
  const handleBulkDelete = async (taskIds: string[]) => {
    try {
      for (const id of taskIds) {
        await deleteTask(id).unwrap();
      }
      showToast(`Deleted ${taskIds.length} tasks`, 'success');
    } catch (err: any) {
      showToast(err?.data?.message || 'Failed to delete some tasks', 'error');
    }
  };

  // Import Master Excel Handler
  const handleImportExcel = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await importMasterExcel(formData).unwrap();
    showToast(res.message || 'Excel imported successfully!', 'success');
    return res;
  };

  // Export CSV Handler
  const handleExportCSV = useCallback(() => {
    if (tasks.length === 0) {
      showToast('No tasks to export', 'info');
      return;
    }

    const headers = [
      'Client Name',
      'Task Title',
      'Work Type',
      'Assignee',
      'Due Date',
      'Status',
      'Priority',
      'Description',
    ];

    const rows = tasks.map((t) => [
      `"${t.client?.name || ''}"`,
      `"${t.title || ''}"`,
      `"${t.complianceType || ''}"`,
      `"${t.assignee?.name || ''}"`,
      `"${t.dueDate ? new Date(t.dueDate).toLocaleDateString() : ''}"`,
      `"${t.status || ''}"`,
      `"${t.priority || ''}"`,
      `"${(t.description || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Fintecc_WorkBoard_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Work Board exported to CSV', 'success');
  }, [tasks, showToast]);

  return (
    <div className="space-y-4 pb-12">
      {/* Top Toolbar */}
      <TaskGridToolbar
        viewMode={filters.viewMode}
        userRole={user?.role}
        totalTasks={totalTasks}
        isSocketConnected={isSocketConnected}
        onViewModeChange={handleViewModeChange}
        onOpenCreateModal={() => setIsCreateOpen(true)}
        onOpenImportModal={() => setIsImportOpen(true)}
        onExportCSV={handleExportCSV}
        onRefresh={refetchTasks}
        isRefreshing={isFetchingTasks}
      />

      {/* Filter Bar */}
      <TaskFiltersBar
        filters={filters}
        staffList={staffList}
        clientsList={clientsList}
        activeFilterCount={activeFilterCount}
        onFilterChange={setFilter}
        onResetFilters={resetFilters}
      />

      {/* Master Task Grid */}
      <TaskGrid
        tasks={tasks}
        total={totalTasks}
        currentPage={filters.page}
        pageSize={filters.limit}
        isLoading={isLoadingTasks}
        userRole={user?.role}
        staffList={staffList}
        clientsList={clientsList}
        onPageChange={(page) => setFilter('page', page)}
        onStatusChange={handleStatusChange}
        onBulkUpdateStatus={handleBulkUpdateStatus}
        onBulkUpdateAssignee={handleBulkUpdateAssignee}
        onBulkUpdatePriority={handleBulkUpdatePriority}
        onBulkDelete={handleBulkDelete}
        onEditTask={(task) => setEditingTask(task)}
        onDeleteTask={handleDeleteTask}
        onOpenCreateModal={() => setIsCreateOpen(true)}
        onOpenImportModal={() => setIsImportOpen(true)}
      />

      {/* Create Task Modal */}
      <CreateTaskModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSubmit={handleCreateTask}
        staffList={staffList}
        clientsList={clientsList}
        isLoadingStaff={isLoadingStaff}
        isLoadingClients={isLoadingClients}
      />

      {/* Edit Task Slide-over Drawer */}
      <EditTaskDrawer
        isOpen={!!editingTask}
        task={editingTask}
        userRole={user?.role}
        currentUser={user}
        staffList={staffList}
        onClose={() => setEditingTask(null)}
        onUpdate={handleUpdateTask}
        onDelete={handleDeleteTask}
      />

      {/* Import Excel Modal */}
      <ImportExcelModal
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        onImport={handleImportExcel}
      />
    </div>
  );
}
