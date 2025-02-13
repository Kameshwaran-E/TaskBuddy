import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit"
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDocs,  
  writeBatch, 
  serverTimestamp,
  query,
  where,
  getDoc,
} from "firebase/firestore"
import { db } from "../../firebase/firebaseConfig"
import type { Task, TaskHistory, TaskHistoryChange } from "../../types"
import { auth } from "../../firebase/firebaseConfig"
import { RootState } from "../../store"

interface TaskFilters {
  title?: string
  category?: string
  tags?: string[]
  dateRange?: {
    start: string | null
    end: string | null
  }
  sortOrder: "asc" | "desc"
}

interface TasksState {
  tasks: Task[]
  filteredTasks: Task[]
  view: "board" | "list"
  selectedTasks: string[]
  taskHistory: TaskHistory[]
  sortOrder: "asc" | "desc"
  filters: TaskFilters
  status: "idle" | "loading" | "succeeded" | "failed"
  error: string | null
  batchStatus: "idle" | "processing"
}

const initialState: TasksState = {
  tasks: [],
  filteredTasks: [],
  view: "board",
  selectedTasks: [],
  taskHistory: [],
  sortOrder: "asc",
  filters: {
    title: "",
    category: undefined,
    dateRange: { start: null, end: null },
    sortOrder: "asc",
  },
  status: "idle",
  error: null,
  batchStatus: "idle",
}

const createHistoryEntry = (
  taskId: string,
  action: TaskHistory["action"],
  changes: TaskHistoryChange[]
): TaskHistory => ({
  id: crypto.randomUUID(),
  taskId,
  action,
  changes,
  timestamp: new Date().toISOString(),
})

// Add this function to log task history
const logTaskHistory = async (
  taskId: string, 
  action: 'created' | 'updated' | 'deleted',
  changes: Array<{ field: string; oldValue?: any; newValue?: any }>
) => {
  if (!auth.currentUser) return;

  try {
    await addDoc(collection(db, 'taskHistory'), {
      taskId,
      userId: auth.currentUser.uid,
      action,
      changes,
      timestamp: new Date(),
    });
  } catch (error) {
    console.error('Error logging task history:', error);
  }
};

const formatValue = (value: any) => {
  if (value === undefined || value === null) return 'none';
  if (Array.isArray(value) && value[0]?.fileName) {
    return value.map(file => file.fileName).join(', ');
  }
  return value.toString();
};

// CREATE
export const createTask = createAsyncThunk(
  "tasks/createTask",
  async (task: Omit<Task, "id" | "createdAt" | "updatedAt">) => {
    if (!auth.currentUser?.uid) {
      throw new Error("User must be authenticated")
    }

    const newTask = {
      ...task,
      userId: auth.currentUser.uid,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      completedAt: null
    }
    
    try {
      const docRef = await addDoc(collection(db, "tasks"), newTask)
      const taskWithId = {
        ...task,
        id: docRef.id,
        userId: auth.currentUser.uid,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        completedAt: null
      } as Task
      
      await logTaskHistory(taskWithId.id, 'created', [{
        field: 'all',
        newValue: taskWithId
      }]);
      
      return taskWithId
    } catch (error) {
      console.error("Error creating task:", error)
      throw error
    }
  }
)

// READ
export const fetchTasks = createAsyncThunk(
  "tasks/fetchTasks", 
  async (_, { rejectWithValue }) => {
    try {
      // Wait for auth to be initialized
      await new Promise(resolve => {
        const unsubscribe = auth.onAuthStateChanged((user) => {
          unsubscribe();
          resolve(user);
        });
      });

      if (!auth.currentUser?.uid) {
        throw new Error("User must be authenticated");
      }

      const q = query(
        collection(db, "tasks"),
        where("userId", "==", auth.currentUser.uid)
      );
      
      const querySnapshot = await getDocs(q);
      const tasks = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        updatedAt: doc.data().updatedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        completedAt: doc.data().completedAt?.toDate?.()?.toISOString(),
      })) as Task[];
      
      return tasks;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
)

// UPDATE
export const updateTask = createAsyncThunk(
  "tasks/updateTask",
  async (updatedTask: Task) => {
    if (!auth.currentUser) throw new Error('No authenticated user');
    
    try {
      const { id, ...updates } = updatedTask;
      const docRef = doc(db, "tasks", id);
      
      const oldTaskSnap = await getDoc(docRef);
      const oldTaskData = oldTaskSnap.data() as Task;

      await updateDoc(docRef, {
        ...updates,
        updatedAt: serverTimestamp(),
        completedAt: updates.status === 'completed' ? serverTimestamp() : null
      });

      // Log the changes
      const changes = Object.entries(updates)
        .filter(([key, value]) => oldTaskData && oldTaskData[key as keyof Task] !== value)
        .map(([key, value]) => ({
          field: key,
          oldValue: formatValue(oldTaskData[key as keyof Task]),
          newValue: formatValue(value)
        }));

      await logTaskHistory(id, 'updated', changes);
      
      return updatedTask;
    } catch (error) {
      console.error("Error updating task:", error);
      throw error;
    }
  }
)

// DELETE
export const deleteTask = createAsyncThunk(
  "tasks/deleteTask",
  async (taskId: string, { getState }) => {
    const state = getState() as RootState
    const taskToDelete = state.tasks.tasks.find(task => task.id === taskId)
    
    if (!taskToDelete || taskToDelete.userId !== auth.currentUser?.uid) {
      throw new Error("You don't have permission to delete this task")
    }

    const docRef = doc(db, "tasks", taskId)
    await deleteDoc(docRef)

    // Log the deletion
    await logTaskHistory(taskId, 'deleted', [{
      field: 'all',
      oldValue: taskToDelete
    }]);
    
    return taskId
  }
)

// BATCH OPERATIONS
export const batchUpdateTasks = createAsyncThunk(
  "tasks/batchUpdateTasks",
  async ({ ids, updates }: { ids: string[]; updates: Partial<Task> }, { getState }) => {
    const state = getState() as RootState
    const tasksToUpdate = state.tasks.tasks.filter(task => 
      ids.includes(task.id) && task.userId === auth.currentUser?.uid
    )

    if (tasksToUpdate.length !== ids.length) {
      throw new Error("You don't have permission to update some of these tasks")
    }

    const batch = writeBatch(db)
    const updatesWithTimestamp = {
      ...updates,
      userId: auth.currentUser?.uid,
      updatedAt: serverTimestamp(),
    }
    
    tasksToUpdate.forEach((task) => {
      const docRef = doc(db, "tasks", task.id)
      batch.update(docRef, updatesWithTimestamp)
    })
    
    await batch.commit()
    return { ids, updates }
  }
)

export const batchDeleteTasks = createAsyncThunk(
  "tasks/batchDeleteTasks",
  async (ids: string[], { getState }) => {
    const state = getState() as RootState
    const tasksToDelete = state.tasks.tasks.filter(task => 
      ids.includes(task.id) && task.userId === auth.currentUser?.uid
    )

    if (tasksToDelete.length !== ids.length) {
      throw new Error("You don't have permission to delete some of these tasks")
    }

    const batch = writeBatch(db)
    tasksToDelete.forEach((task) => {
      const docRef = doc(db, "tasks", task.id)
      batch.delete(docRef)
    })
    await batch.commit()
    return ids
  }
)

export const applyFilters = createAsyncThunk(
  "tasks/applyFilters",
  async (filters: TaskFilters, { getState }) => {
    const state = getState() as RootState
    const tasks = state.tasks.tasks

    return tasks.filter(task => {
      // Title search
      const matchesTitle = !filters.title || 
        task.title.toLowerCase().includes(filters.title.toLowerCase())

      // Category filter
      const matchesCategory = !filters.category || 
        task.category === filters.category

      // Tags filter
      const matchesTags = !filters.tags?.length || 
        filters.tags.every(tag => task.tags?.includes(tag))

      // Date range filter
      const matchesDateRange = !filters.dateRange?.start || !filters.dateRange?.end || 
        (new Date(task.dueDate) >= new Date(filters.dateRange.start) && 
         new Date(task.dueDate) <= new Date(filters.dateRange.end))

      return matchesTitle && matchesCategory && matchesTags && matchesDateRange
    })
  }
)

const tasksSlice = createSlice({
  name: "tasks",
  initialState,
  reducers: {
    toggleView: (state) => {
      state.view = state.view === "board" ? "list" : "board"
    },
    toggleTaskSelection: (state, action: PayloadAction<string>) => {
      const index = state.selectedTasks.indexOf(action.payload)
      if (index === -1) {
        state.selectedTasks.push(action.payload)
      } else {
        state.selectedTasks.splice(index, 1)
      }
    },
    clearSelectedTasks: (state) => {
      state.selectedTasks = []
    },
    sortTasksByDueDate: (state, action: PayloadAction<"asc" | "desc">) => {
      state.sortOrder = action.payload
      const sorter = (a: Task, b: Task) => {
        const dateA = new Date(a.dueDate).getTime()
        const dateB = new Date(b.dueDate).getTime()
        return action.payload === "asc" ? dateA - dateB : dateB - dateA
      }
      state.tasks.sort(sorter)
      state.filteredTasks.sort(sorter)
    },
    setFilters: (state, action: PayloadAction<Partial<TaskFilters>>) => {
      state.filters = {
        ...state.filters,
        ...action.payload,
      }
    },
    selectAllTasks: (state) => {
      state.selectedTasks = state.tasks.map(task => task.id)
    },
    selectAllFilteredTasks: (state) => {
      state.selectedTasks = state.filteredTasks.map(task => task.id)
    },
    selectTasksByStatus: (state, action: PayloadAction<Task["status"]>) => {
      state.selectedTasks = state.tasks
        .filter(task => task.status === action.payload)
        .map(task => task.id)
    },
  },
  extraReducers: (builder) => {
    builder
      // CREATE
      .addCase(createTask.pending, (state) => {
        state.status = "loading"
      })
      .addCase(createTask.fulfilled, (state, action) => {
        state.status = "succeeded"
        state.tasks.unshift(action.payload)
        state.filteredTasks = [...state.tasks]
        state.taskHistory.push(
          createHistoryEntry(action.payload.id, "created", [
            { field: "all", newValue: action.payload }
          ])
        )
      })
      .addCase(createTask.rejected, (state, action) => {
        state.status = "failed"
        state.error = action.error.message || "Failed to create task"
      })

      // READ
      .addCase(fetchTasks.pending, (state) => {
        state.status = "loading"
        state.error = null
      })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.status = "succeeded"
        state.tasks = action.payload
        state.filteredTasks = action.payload
        state.error = null
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.status = "failed"
        state.error = action.error.message || "Failed to fetch tasks"
      })

      // UPDATE
      .addCase(updateTask.pending, (state) => {
        state.status = "loading"
      })
      .addCase(updateTask.fulfilled, (state, action) => {
        state.status = "succeeded"
        const index = state.tasks.findIndex((task) => task.id === action.payload.id)
        if (index !== -1) {
          const oldTask = state.tasks[index]
          const changes: TaskHistoryChange[] = Object.entries(action.payload)
            .filter(([key, value]) => oldTask[key as keyof Task] !== value)
            .map(([field, newValue]) => ({
              field: field as keyof Task,
              oldValue: formatValue(oldTask[field as keyof Task]),
              newValue: formatValue(newValue)
            }))

          if (changes.length > 0) {
            state.tasks[index] = { ...oldTask, ...action.payload }
            state.filteredTasks = [...state.tasks]
            state.taskHistory.push(createHistoryEntry(action.payload.id, "updated", changes))
          }
        }
      })
      .addCase(updateTask.rejected, (state, action) => {
        state.status = "failed"
        state.error = action.error.message || "Failed to update task"
      })

      // DELETE
      .addCase(deleteTask.pending, (state) => {
        state.status = "loading"
      })
      .addCase(deleteTask.fulfilled, (state, action) => {
        state.status = "succeeded"
        const task = state.tasks.find((t) => t.id === action.payload)
        if (task) {
          state.tasks = state.tasks.filter((t) => t.id !== action.payload)
          state.filteredTasks = state.filteredTasks.filter((t) => t.id !== action.payload)
          state.taskHistory.push(
            createHistoryEntry(action.payload, "deleted", [
              {
                field: "all", oldValue: task,
                newValue: undefined
              }
            ])
          )
        }
      })
      .addCase(deleteTask.rejected, (state, action) => {
        state.status = "failed"
        state.error = action.error.message || "Failed to delete task"
      })

      // BATCH OPERATIONS
      .addCase(batchUpdateTasks.pending, (state) => {
        state.batchStatus = "processing"
      })
      .addCase(batchUpdateTasks.fulfilled, (state, action) => {
        const { ids, updates } = action.payload
        state.tasks = state.tasks.map((task) => {
          if (ids.includes(task.id)) {
            const updatedTask = { ...task, ...updates, updatedAt: new Date().toISOString() }
            const changes: TaskHistoryChange[] = Object.entries(updates)
              .map(([field, newValue]) => ({
                field: field as keyof Task,
                oldValue: formatValue(task[field as keyof Task]),
                newValue: formatValue(newValue)
              }))
            state.taskHistory.push(createHistoryEntry(task.id, "updated", changes))
            return updatedTask
          }
          return task
        })
        state.filteredTasks = [...state.tasks]
        state.selectedTasks = []
        state.batchStatus = "idle"
      })
      .addCase(batchUpdateTasks.rejected, (state, action) => {
        state.batchStatus = "idle"
        state.error = action.error.message || "Failed to batch update tasks"
      })

      .addCase(batchDeleteTasks.pending, (state) => {
        state.batchStatus = "processing"
      })
      .addCase(batchDeleteTasks.fulfilled, (state, action) => {
        const tasksToDelete = state.tasks.filter((task) => action.payload.includes(task.id))
        tasksToDelete.forEach((task) => {
          state.taskHistory.push(
            createHistoryEntry(task.id, "deleted", [
              {
                field: "all", oldValue: task,
                newValue: undefined
              }
            ])
          )
        })
        state.tasks = state.tasks.filter((task) => !action.payload.includes(task.id))
        state.filteredTasks = state.filteredTasks.filter(
          (task) => !action.payload.includes(task.id)
        )
        state.selectedTasks = []
        state.batchStatus = "idle"
      })
      .addCase(batchDeleteTasks.rejected, (state, action) => {
        state.batchStatus = "idle"
        state.error = action.error.message || "Failed to batch delete tasks"
      })
  },
})

export const {
  toggleView,
  toggleTaskSelection,
  clearSelectedTasks,
  sortTasksByDueDate,
  setFilters,
  selectAllTasks,
  selectAllFilteredTasks,
  selectTasksByStatus,
} = tasksSlice.actions

export default tasksSlice.reducer