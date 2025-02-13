import type React from "react"
import { useState, useEffect } from "react"
import { useSelector, useDispatch } from "react-redux"
import type { RootState } from "../../store"
import {
  toggleTaskSelection,
  batchUpdateTasks,
  batchDeleteTasks,
  sortTasksByDueDate,
  setFilters,
  deleteTask,
  fetchTasks,
  updateTask,
} from "../../store/slices/tasksSlice"
import { TaskForm } from "../createtask/TaskForm"
import type { Task } from "../../types"
import TaskHistory from "./TaskHistory"
import FilterSection from "../header/FilterSection"
import type { AnyAction } from "@reduxjs/toolkit"
import type { ThunkDispatch } from "@reduxjs/toolkit"
import ListShimmerUI from '../ui/ListShimmerUI'
import ListView from "./ListView"
import { DragDropContext, DropResult } from '@hello-pangea/dnd'


interface TaskListProps {
  hasSearched: boolean;
  setHasSearched: (value: boolean) => void;
}

const TaskList: React.FC<TaskListProps> = ({ setHasSearched }) => {
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [showHistory, setShowHistory] = useState(false)
  const [showBatchConfirm, setShowBatchConfirm] = useState(false)
  const [batchAction, setBatchAction] = useState<"complete" | "delete" | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const dispatch = useDispatch<ThunkDispatch<RootState, unknown, AnyAction>>()
  const tasks = useSelector((state: RootState) => state.tasks.tasks)
  const selectedTasks = useSelector((state: RootState) => state.tasks.selectedTasks)
  const sortOrder = useSelector((state: RootState) => state.tasks.sortOrder)
  const filters = useSelector((state: RootState) => state.tasks.filters)
  const status = useSelector((state: RootState) => state.tasks.status)
 

  useEffect(() => {
    const loadTasks = async () => {
      try {
        setIsLoading(true)
        await dispatch(fetchTasks()).unwrap()
      } catch (error) {
        console.error("Failed to fetch tasks:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadTasks()
  }, [dispatch])

  const handleAddTask = () => {
    setEditingTask(null)
    setIsFormOpen(true)
  }

  const handleEditTask = (task: Task) => {
    setEditingTask(task)
    setIsFormOpen(true)
  }

  const handleFormClose = () => {
    setIsFormOpen(false)
    setEditingTask(null)
  }

  const handleFormSubmitSuccess = () => {
    setIsFormOpen(false)
    setEditingTask(null)
  }

  const handleTaskSelect = (taskId: string) => {
    dispatch(toggleTaskSelection(taskId))
  }

  const handleBatchActionClick = (action: "complete" | "delete") => {
    setBatchAction(action)
    setShowBatchConfirm(true)
  }

  const handleBatchConfirm = () => {
    if (batchAction === "complete") {
      dispatch(
        batchUpdateTasks({
          ids: selectedTasks,
          updates: { status: "completed" },
        }) as unknown as AnyAction,
      )
    } else if (batchAction === "delete") {
      dispatch(batchDeleteTasks(selectedTasks) as unknown as AnyAction)
    }
    setShowBatchConfirm(false)
    setBatchAction(null)
  }

  const handleSort = () => {
    const newOrder = sortOrder === "asc" ? "desc" : "asc"
    dispatch(sortTasksByDueDate(newOrder))
  }

  const handleFilterChange = (newFilters: any) => {
    dispatch(setFilters(newFilters))
  }

  const handleDeleteTask = (taskId: string) => {
    dispatch(deleteTask(taskId))
  }

  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination) return;

    const { draggableId, destination } = result;
    const task = tasks.find(t => t.id === draggableId);

    if (task && task.status !== destination.droppableId) {
      try {
        const updatedTask = {
          ...task,
          status: destination.droppableId as Task['status'],
          updatedAt: new Date().toISOString(),
          completedAt: destination.droppableId === 'completed' ? new Date().toISOString() : null
        };
        
        await dispatch(updateTask(updatedTask)).unwrap();
      } catch (error) {
        console.error('Failed to update task:', error);
      }
    }
  };

  const filteredTasks = tasks.filter((task) => {
    const matchesTitle = filters.title ? task.title.toLowerCase().includes(filters.title.toLowerCase()) : true
    const matchesCategory = filters.category ? task.category === filters.category : true

    const startDate = filters.dateRange?.start ?? null
    const endDate = filters.dateRange?.end ?? null

    const matchesDateRange =
      startDate && endDate
        ? task.dueDate && new Date(task.dueDate) >= new Date(startDate) && new Date(task.dueDate) <= new Date(endDate)
        : true

    return matchesTitle && matchesCategory && matchesDateRange
  })

  const columns = [
    { title: "To Do", status: "todo", placeholderText: "No tasks to do", bgColor: "bg-[#fac2ff]" },
    {
      title: "In Progress",
      status: "in-progress",
      placeholderText: "No tasks in progress",
      bgColor: "bg-[#85d9f1]",
    },
    {
      title: "Completed",
      status: "completed",
      placeholderText: "No completed tasks",
      bgColor: "bg-[#cfffcd]",
    },
  ]

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="p-2 sm:p-6 lg:p-4">
        <div className="mb-4">
          <FilterSection 
            filters={filters} 
            tasks={tasks} 
            onFilterChange={handleFilterChange}
            setHasSearched={setHasSearched} 
          />
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 w-full mb-6">
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <button
              onClick={handleSort}
              className="flex-1 sm:flex-none font-semibold cursor-pointer flex items-center justify-center gap-2 px-3 py-2 
                       border border-solid border-black border-opacity-20 rounded-full min-h-[36px] text-sm"
            >
              Due Date {sortOrder === "asc" ? "↑" : "↓"}
            </button>

            <button
              onClick={() => setShowHistory(!showHistory)}
              className="font-semibold cursor-pointer flex items-center gap-2 px-3 sm:px-4 py-2 
                       border border-solid border-black border-opacity-20 rounded-full min-h-[36px] text-sm"
            >
              {showHistory ? "Hide Activity" : "Show Activity"}
            </button>
          </div>

          {selectedTasks.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 sm:gap-4 w-full sm:w-auto mt-2 sm:mt-0">
              <button
                onClick={() => handleBatchActionClick("complete")}
                className="flex-1 sm:flex-none cursor-pointer px-3 sm:px-4 py-2 text-sm bg-green-500 text-white 
                         rounded-full hover:bg-green-600 transition-colors duration-200 font-medium"
              >
                Complete Selected ({selectedTasks.length})
              </button>
              <button
                onClick={() => handleBatchActionClick("delete")}
                className="flex-1 sm:flex-none cursor-pointer px-3 sm:px-4 py-2 text-sm bg-red-500 text-white 
                         rounded-full hover:bg-red-600 transition-colors duration-200 font-medium"
              >
                Delete Selected ({selectedTasks.length})
              </button>
            </div>
          )}
        </div>

        {showHistory && (
          <TaskHistory 
            className="w-full max-w-2xl mx-auto mb-6" 
            onClose={() => setShowHistory(false)}
          />
        )}

        {isLoading ? (
          <div className="animate-pulse space-y-4">
            <ListShimmerUI />
          </div>
        ) : status === "failed" ? (
          <div className="p-4 text-center text-red-500">Failed to load tasks</div>
        ): (
          <>
            <div className="grid grid-cols-1 gap-4 min-w-0 overflow-x-hidden">
              {columns.map(({ title, status, placeholderText, bgColor }) => (
                <ListView
                  key={status}
                  title={title}
                  status={status}
                  tasks={filteredTasks.filter(task => task.status === status)}
                  placeholderText={placeholderText}
                  onAddTask={handleAddTask}
                  onEditTask={handleEditTask}
                  onDeleteTask={handleDeleteTask}
                  selectedTasks={selectedTasks}
                  onTaskSelect={handleTaskSelect}
                  statusColors={bgColor}
                />
              ))}
            </div>

            {isFormOpen && (
              <TaskForm
                onCancel={handleFormClose}
                editingTask={editingTask}
                onSubmitSuccess={handleFormSubmitSuccess}
                className="w-full max-w-md mx-auto"
              />
            )}
            {showBatchConfirm && (
              <div className="fixed inset-0 z-50 overflow-hidden bg-gray-900/75 flex items-center justify-center p-4">
                <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
                  {/* Header */}
                  <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gray-50 rounded-t-xl">
                    <h3 className="text-xl font-semibold text-gray-900">Confirm Batch Action</h3>
                    <button
                      onClick={() => {
                        setShowBatchConfirm(false)
                        setBatchAction(null)
                      }}
                      className="text-gray-400 hover:text-gray-500 p-2 rounded-full hover:bg-gray-100
                               transition-colors duration-200 cursor-pointer"
                      aria-label="Close"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  {/* Content */}
                  <div className="p-6 bg-gray-50 rounded-b-xl">
                    <p className="text-gray-600">
                      {batchAction === "complete"
                        ? `Are you sure you want to mark ${selectedTasks.length} tasks as complete?`
                        : `Are you sure you want to delete ${selectedTasks.length} tasks? This action cannot be undone.`}
                    </p>

                    {/* Actions */}
                    <div className="flex justify-end gap-3 mt-6">
                      <button
                        onClick={() => {
                          setShowBatchConfirm(false)
                          setBatchAction(null)
                        }}
                        className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-800 
                                 bg-white border border-gray-300 rounded-lg hover:bg-gray-50
                                 transition-colors duration-200 cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleBatchConfirm}
                        className={`px-4 py-2 text-sm font-medium text-white rounded-lg cursor-pointer
                                 transition-colors duration-200 ${
                                   batchAction === "complete"
                                     ? "bg-green-600 hover:bg-green-700"
                                     : "bg-red-600 hover:bg-red-700"
                                 }`}
                      >
                        {batchAction === "complete" ? "Complete" : "Delete"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </DragDropContext>
  )
}

export default TaskList

