import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Task, TaskHistory } from '../../types';

interface TaskFilters {
  title?: string;
  category?: string;
  dateRange?: { 
    start: string | null;
    end: string | null;
  };
  sortOrder: 'asc' | 'desc'; // Ensure this is always either 'asc' or 'desc'
}

interface TasksState {
  tasks: Task[];
  filteredTasks: Task[];
  view: 'board' | 'list';
  selectedTasks: string[];
  taskHistory: TaskHistory[];
  sortOrder: 'asc' | 'desc';
  filters: TaskFilters;
}

const initialState: TasksState = {
  tasks: [],
  filteredTasks: [],
  view: 'board',
  selectedTasks: [],
  taskHistory: [],
  sortOrder: 'asc', // Default sortOrder to 'asc'
  filters: {
    title: '',
    category: undefined,
    dateRange: { start: null, end: null },
    sortOrder: 'asc', // Default sortOrder to 'asc'
  },
};

const tasksSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    addTask: (state, action: PayloadAction<Task>) => {
      state.tasks.push(action.payload);
      state.taskHistory.push({
        id: crypto.randomUUID(),
        taskId: action.payload.id,
        action: 'created',
        changes: [{ field: 'all', newValue: action.payload }],
        timestamp: new Date().toISOString(),
      });
    },
    updateTask: (state, action: PayloadAction<Task>) => {
      const index = state.tasks.findIndex(task => task.id === action.payload.id);
      if (index !== -1) {
        const oldTask = state.tasks[index];
        const changes = Object.entries(action.payload)
          .filter(([key, value]) => oldTask[key as keyof Task] !== value)
          .map(([field, newValue]) => ({
            field,
            oldValue: oldTask[field as keyof Task],
            newValue,
          }));

        if (changes.length > 0) {
          state.tasks[index] = action.payload;
          state.taskHistory.push({
            id: crypto.randomUUID(),
            taskId: action.payload.id,
            action: 'updated',
            changes,
            timestamp: new Date().toISOString(),
          });
        }
      }
    },
    deleteTask: (state, action: PayloadAction<string>) => {
      const task = state.tasks.find(t => t.id === action.payload);
      if (task) {
        state.tasks = state.tasks.filter(t => t.id !== action.payload);
        state.taskHistory.push({
          id: crypto.randomUUID(),
          taskId: action.payload,
          action: 'deleted',
          changes: [{ field: 'all', oldValue: task }],
          timestamp: new Date().toISOString(),
        });
      }
    },
    toggleView: (state) => {
      state.view = state.view === 'board' ? 'list' : 'board';
    },
    toggleTaskSelection: (state, action: PayloadAction<string>) => {
      const index = state.selectedTasks.indexOf(action.payload);
      if (index === -1) {
        state.selectedTasks.push(action.payload);
      } else {
        state.selectedTasks.splice(index, 1);
      }
    },
    clearSelectedTasks: (state) => {
      state.selectedTasks = [];
    },
    batchUpdateTasks: (state, action: PayloadAction<{ ids: string[]; updates: Partial<Task> }>) => {
      const { ids, updates } = action.payload;
      state.tasks = state.tasks.map(task => {
        if (ids.includes(task.id)) {
          const updatedTask = { ...task, ...updates, updatedAt: new Date().toISOString() };
          state.taskHistory.push({
            id: crypto.randomUUID(),
            taskId: task.id,
            action: 'updated',
            changes: Object.entries(updates).map(([field, newValue]) => ({
              field,
              oldValue: task[field as keyof Task],
              newValue,
            })),
            timestamp: new Date().toISOString(),
          });
          return updatedTask;
        }
        return task;
      });
      state.selectedTasks = [];
    },
    batchDeleteTasks: (state, action: PayloadAction<string[]>) => {
      const tasksToDelete = state.tasks.filter(task => action.payload.includes(task.id));
      tasksToDelete.forEach(task => {
        state.taskHistory.push({
          id: crypto.randomUUID(),
          taskId: task.id,
          action: 'deleted',
          changes: [{ field: 'all', oldValue: task }],
          timestamp: new Date().toISOString(),
        });
      });
      state.tasks = state.tasks.filter(task => !action.payload.includes(task.id));
      state.selectedTasks = [];
    },
    sortTasksByDueDate: (state, action: PayloadAction<'asc' | 'desc'>) => {
      state.sortOrder = action.payload;
      state.tasks.sort((a, b) => {
        const dateA = new Date(a.dueDate).getTime();
        const dateB = new Date(b.dueDate).getTime();
        return action.payload === 'asc' ? dateA - dateB : dateB - dateA;
      });
    },
    setFilters: (state, action: PayloadAction<Partial<TaskFilters>>) => {
      state.filters = { 
        ...state.filters, 
        ...action.payload,
        sortOrder: action.payload.sortOrder ?? state.filters.sortOrder, // Prevent undefined for sortOrder
      };
    },
    applyFilters: (state) => {
      state.filteredTasks = state.tasks.filter(task => {
        const { title, category, dateRange } = state.filters;

        const matchesTitle = title ? task.title.toLowerCase().includes(title.toLowerCase()) : true;
        const matchesCategory = category ? task.category === category : true;
        const matchesDateRange =
          dateRange?.start && dateRange?.end
            ? new Date(task.dueDate) >= new Date(dateRange.start) && new Date(task.dueDate) <= new Date(dateRange.end)
            : true;

        return matchesTitle && matchesCategory && matchesDateRange;
      });
    },
  },
});

export const {
  addTask,
  updateTask,
  deleteTask,
  toggleView,
  toggleTaskSelection,
  clearSelectedTasks,
  batchUpdateTasks,
  batchDeleteTasks,
  sortTasksByDueDate,
  setFilters,
  applyFilters,
} = tasksSlice.actions;

export default tasksSlice.reducer;
