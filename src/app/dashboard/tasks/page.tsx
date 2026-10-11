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
  useTriggerRecurringTasksMutation,
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
import { ResourceAllocationTab } from '@/features/tasks/components/ResourceAllocationTab';
import { TaskComplianceAnalytics } from '@/features/tasks/components/TaskComplianceAnalytics';
import { TaskKanbanView } from '@/features/tasks/components/TaskKanbanView';
import { TaskWeekView } from '@/features/tasks/components/TaskWeekView';
import { TaskAiFilterBar } from '@/features/tasks/components/TaskAiFilterBar';
import { SubmitReviewModal } from '@/features/tasks/components/SubmitReviewModal';
import { ReviewTaskModal } from '@/features/tasks/components/ReviewTaskModal';
import { LogTimeModal } from '@/features/tasks/components/LogTimeModal';
import { TaskCommentsDrawer } from '@/features/tasks/components/TaskCommentsDrawer';
import { VerifyGstPortalModal } from '@/features/tasks/components/VerifyGstPortalModal';
import {
  LayoutList,
  Kanban,
  CalendarDays,
  Repeat,
  BarChart3,
} from 'lucide-react';
import type { Task, TaskStatus, TaskPriority, CreateTaskRequest } from '@/lib/types/task.types';

type TaskLayoutView = 'list' | 'kanban' | 'week';

export default function WorkBoardPage() {
  const user = useSelector((state: RootState) => state.auth.user);
  const { showToast } = useToast();

  const isStaffRole = user?.role === 'EMPLOYEE' || user?.role === 'ACCOUNTANT';
  const defaultAssigneeId = isStaffRole ? user?.id : undefined;

  const [workTab, setWorkTab] = useState<'board' | 'resources'>('board');
  const [layoutView, setLayoutView] = useState<TaskLayoutView>('list');
  const [showAnalytics, setShowAnalytics] = useState(true);

  // Filter state
  const {
    filters,
    queryParams,
    activeFilterCount,
    setFilter,
    setViewMode,
    resetFilters,
  } = useTaskFilters(defaultAssigneeId);

  // AI Filter state
  const [aiFilterTasks, setAiFilterTasks] = useState<Task[] | null>(null);
  const [aiPrompt, setAiPrompt] = useState<string | null>(null);

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
  const [triggerRecurring, { isLoading: isTriggeringRecurring }] = useTriggerRecurringTasksMutation();

  // WebSockets live sync
  const { isConnected: isSocketConnected } = useTaskSocket({
    onTaskCreated: (newTask) => {
      showToast(`New task created: "${newTask.title}"`, 'info');
    },
    onTaskUpdated: () => {},
  });

  // Modal / Drawer states
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // Phase 1 Action Modals
  const [reviewSubmitTask, setReviewSubmitTask] = useState<Task | null>(null);
  const [reviewActionTask, setReviewActionTask] = useState<Task | null>(null);
  const [logTimeTask, setLogTimeTask] = useState<Task | null>(null);
  const [commentsTask, setCommentsTask] = useState<Task | null>(null);
  const [gstPortalTask, setGstPortalTask] = useState<Task | null>(null);

  const baseTasks = useMemo(() => tasksResponse?.data || [], [tasksResponse]);
  const tasks = useMemo(() => {
    if (aiFilterTasks) return aiFilterTasks;
    return baseTasks;
  }, [aiFilterTasks, baseTasks]);

  const totalTasks = aiFilterTasks ? aiFilterTasks.length : tasksResponse?.total || 0;
  const staffList = useMemo(() => staffResponse?.data || [], [staffResponse]);
  const clientsList = useMemo(() => clientsResponse?.data || [], [clientsResponse]);

  // Handle View Mode switch
  const handleViewModeChange = (mode: typeof filters.viewMode) => {
    setAiFilterTasks(null);
    setAiPrompt(null);
    setViewMode(mode, user?.id);
  };

  // AI filter callback
  const handleAiFilter = (results: Task[] | null, prompt: string) => {
    setAiFilterTasks(results);
    setAiPrompt(prompt);
  };

  const handleClearAiFilter = () => {
    setAiFilterTasks(null);
    setAiPrompt(null);
  };

  // Process Recurring Tasks Trigger
  const handleTriggerRecurring = async () => {
    try {
      const res = await triggerRecurring().unwrap();
      showToast(
        res.data?.processedCount
          ? `Generated ${res.data.generatedTasks.length} recurring compliance tasks`
          : 'Recurring schedules are up to date. No pending tasks.',
        'info'
      );
    } catch (err: any) {
      showToast(err?.data?.message || 'Failed to process recurring tasks', 'error');
    }
  };

  // Create Task Handler
  const handleCreateTask = async (data: any) => {
    await createTask(data as CreateTaskRequest).unwrap();
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

  // Bulk Actions
  const handleBulkUpdateStatus = async (taskIds: string[], status: TaskStatus) => {
    try {
      await bulkUpdateTasks({ taskIds, updates: { status } }).unwrap();
      showToast(`Updated status for ${taskIds.length} tasks`, 'success');
    } catch (err: any) {
      showToast(err?.data?.message || 'Failed to bulk update tasks', 'error');
    }
  };

  const handleBulkUpdateAssignee = async (taskIds: string[], assigneeId: string) => {
    try {
      await bulkUpdateTasks({ taskIds, updates: { assigneeId } }).unwrap();
      showToast(`Reassigned ${taskIds.length} tasks`, 'success');
    } catch (err: any) {
      showToast(err?.data?.message || 'Failed to reassign tasks', 'error');
    }
  };

  const handleBulkUpdatePriority = async (taskIds: string[], priority: TaskPriority) => {
    try {
      await bulkUpdateTasks({ taskIds, updates: { priority } }).unwrap();
      showToast(`Updated priority for ${taskIds.length} tasks`, 'success');
    } catch (err: any) {
      showToast(err?.data?.message || 'Failed to update priority', 'error');
    }
  };

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
      {/* View Switcher Tabs & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 dark:border-slate-800 gap-3 pb-1">
        <div className="flex space-x-6">
          <button
            onClick={() => setWorkTab('board')}
            className={`pb-2.5 text-sm font-semibold transition border-b-2 ${
              workTab === 'board'
                ? 'border-[#4A6FA5] text-[#4A6FA5]'
                : 'border-transparent text-[#5A6E85] dark:text-slate-400 hover:text-[#1E2A38] dark:hover:text-slate-200'
            }`}
          >
            Compliance Work Board
          </button>
          <button
            onClick={() => setWorkTab('resources')}
            className={`pb-2.5 text-sm font-semibold transition border-b-2 ${
              workTab === 'resources'
                ? 'border-[#4A6FA5] text-[#4A6FA5]'
                : 'border-transparent text-[#5A6E85] dark:text-slate-400 hover:text-[#1E2A38] dark:hover:text-slate-200'
            }`}
          >
            Resource & Capacity Allocations
          </button>
        </div>

        {workTab === 'board' && (
          <div className="flex items-center gap-2 pb-1.5 self-end sm:self-auto">
            {/* Toggle Analytics */}
            <button
              onClick={() => setShowAnalytics(!showAnalytics)}
              className={`p-1.5 px-2.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                showAnalytics
                  ? 'bg-[#4A6FA5]/10 border-[#4A6FA5]/30 text-[#4A6FA5]'
                  : 'bg-[var(--color-bg-card)] border-[var(--color-border)] text-[#5A6E85]'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>SLA Analytics</span>
            </button>

            {/* Recurring schedule trigger */}
            <button
              onClick={handleTriggerRecurring}
              disabled={isTriggeringRecurring}
              className="p-1.5 px-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold text-[#5A6E85] flex items-center gap-1.5 transition-colors"
              title="Process and spawn recurring statutory tasks"
            >
              <Repeat className={`w-3.5 h-3.5 ${isTriggeringRecurring ? 'animate-spin' : ''}`} />
              <span>Sync Recurring</span>
            </button>

            {/* Layout switchers (List, Kanban, Week) */}
            <div className="flex items-center rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-0.5">
              <button
                onClick={() => setLayoutView('list')}
                className={`p-1.5 rounded-lg text-xs transition-colors ${
                  layoutView === 'list'
                    ? 'bg-[#4A6FA5] text-white'
                    : 'text-[#5A6E85] hover:text-[#1E2A38]'
                }`}
                title="Table / Grid View"
              >
                <LayoutList className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setLayoutView('kanban')}
                className={`p-1.5 rounded-lg text-xs transition-colors ${
                  layoutView === 'kanban'
                    ? 'bg-[#4A6FA5] text-white'
                    : 'text-[#5A6E85] hover:text-[#1E2A38]'
                }`}
                title="Kanban Board View"
              >
                <Kanban className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setLayoutView('week')}
                className={`p-1.5 rounded-lg text-xs transition-colors ${
                  layoutView === 'week'
                    ? 'bg-[#4A6FA5] text-white'
                    : 'text-[#5A6E85] hover:text-[#1E2A38]'
                }`}
                title="Week Planner View"
              >
                <CalendarDays className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {workTab === 'resources' ? (
        <ResourceAllocationTab />
      ) : (
        <>
          {/* Compliance & SLA Analytics Overview */}
          {showAnalytics && <TaskComplianceAnalytics />}

          {/* AI Natural Language Filter Bar */}
          <TaskAiFilterBar
            activePrompt={aiPrompt}
            onAiFilterResults={handleAiFilter}
            onClear={handleClearAiFilter}
          />

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

          {/* Filter Bar (Only in List or Kanban view) */}
          {layoutView !== 'week' && (
            <TaskFiltersBar
              filters={filters}
              staffList={staffList}
              clientsList={clientsList}
              activeFilterCount={activeFilterCount}
              onFilterChange={setFilter}
              onResetFilters={resetFilters}
            />
          )}

          {/* View Render based on layoutView */}
          {layoutView === 'list' ? (
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
          ) : layoutView === 'kanban' ? (
            <TaskKanbanView
              tasks={tasks}
              userRole={user?.role}
              isStaffRole={isStaffRole}
              onOpenEdit={(task) => setEditingTask(task)}
              onSubmitReview={(task) => setReviewSubmitTask(task)}
              onReviewTask={(task) => setReviewActionTask(task)}
              onLogTime={(task) => setLogTimeTask(task)}
              onOpenComments={(task) => setCommentsTask(task)}
              onVerifyGstPortal={(task) => setGstPortalTask(task)}
            />
          ) : (
            <TaskWeekView
              onOpenEdit={(task) => setEditingTask(task)}
              onSubmitReview={(task) => setReviewSubmitTask(task)}
              onReviewTask={(task) => setReviewActionTask(task)}
              onLogTime={(task) => setLogTimeTask(task)}
            />
          )}
        </>
      )}

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

      {/* Maker-Checker: Submit for Review Modal */}
      <SubmitReviewModal
        isOpen={!!reviewSubmitTask}
        task={reviewSubmitTask}
        staffList={staffList}
        onClose={() => setReviewSubmitTask(null)}
      />

      {/* Maker-Checker: Review Action Modal (Approve / Reject) */}
      <ReviewTaskModal
        isOpen={!!reviewActionTask}
        task={reviewActionTask}
        onClose={() => setReviewActionTask(null)}
      />

      {/* Time Tracking Modal */}
      <LogTimeModal
        isOpen={!!logTimeTask}
        task={logTimeTask}
        onClose={() => setLogTimeTask(null)}
      />

      {/* Threaded Discussion Comments Drawer */}
      <TaskCommentsDrawer
        isOpen={!!commentsTask}
        task={commentsTask}
        onClose={() => setCommentsTask(null)}
      />

      {/* GST Live Portal Verification Modal */}
      <VerifyGstPortalModal
        isOpen={!!gstPortalTask}
        task={gstPortalTask}
        onClose={() => setGstPortalTask(null)}
      />
    </div>
  );
}

