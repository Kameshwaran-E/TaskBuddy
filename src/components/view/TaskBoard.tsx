import type React from "react"
import { useEffect, useState } from "react"
import { useSelector, useDispatch } from "react-redux"
import type { RootState, AppDispatch } from "../../store"
import {
  updateTask,
  toggleTaskSelection,
  batchUpdateTasks,
  batchDeleteTasks,
  sortTasksByDueDate,
  deleteTask,
  fetchTasks,
  applyFilters,
} from "../../store/slices/tasksSlice"
import BoardView from "./BoardView"
import { TaskForm } from "../createtask/TaskForm"
import type { Task } from "../../types"
import TaskHistory from "./TaskHistory"
import FilterSection, { type TaskFilters } from "../header/FilterSection"
import noresult from "../../assets/noresult.webp"
import { DragDropContext, DropResult } from '@hello-pangea/dnd'

interface TaskBoardProps {
  hasSearched: boolean;
  setHasSearched: (value: boolean) => void;
}

const TaskBoard: React.FC<TaskBoardProps> = ({ hasSearched, setHasSearched }) => {
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [showHistory, setShowHistory] = useState(false)
  const [showBatchConfirm, setShowBatchConfirm] = useState(false)
  const [batchAction, setBatchAction] = useState<"complete" | "delete" | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const dispatch = useDispatch<AppDispatch>()
  const tasks = useSelector((state: RootState) => state.tasks.tasks)
  const filteredTasks = useSelector((state: RootState) => state.tasks.filteredTasks)
  const selectedTasks = useSelector((state: RootState) => state.tasks.selectedTasks)
  const batchStatus = useSelector((state: RootState) => state.tasks.batchStatus)
  const status = useSelector((state: RootState) => state.tasks.status)

  const [filters, setFilters] = useState<TaskFilters>({
    sortOrder: "asc",
    title: "",
    category: "",
    dueDate: null,
  })

  useEffect(() => {
    dispatch(sortTasksByDueDate(filters.sortOrder))
  }, [filters.sortOrder, dispatch])

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

  useEffect(() => {
    dispatch(applyFilters(filters))
  }, [dispatch, tasks])

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

  const handleTaskSelect = (taskId: string) => {
    dispatch(toggleTaskSelection(taskId))
  }

  const handleBatchConfirm = async () => {
    if (batchStatus === "processing") return

    try {
      if (batchAction === "complete") {
        await dispatch(
          batchUpdateTasks({
            ids: selectedTasks,
            updates: { 
              status: "completed",
              completedAt: new Date().toISOString(),
            },
          })
        ).unwrap()
      } else if (batchAction === "delete") {
        await dispatch(batchDeleteTasks(selectedTasks)).unwrap()
      }
      setShowBatchConfirm(false)
      setBatchAction(null)
    } catch (error) {
      console.error("Failed to perform batch action:", error)
    }
  }

  const handleSort = () => {
    const newOrder = filters.sortOrder === "asc" ? "desc" : "asc"
    setFilters((prev) => ({ ...prev, sortOrder: newOrder }))
  }

  const handleDeleteTask = async (taskId: string) => {
    try {
      await dispatch(deleteTask(taskId)).unwrap()
    } catch (error) {
      console.error("Failed to delete task:", error)
    }
  }

  const handleFilterChange = (newFilters: TaskFilters) => {
    setFilters(newFilters)
    dispatch(applyFilters(newFilters))
    setHasSearched(true)
  }

  const handleBatchActionClick = (action: "complete" | "delete") => {
    setBatchAction(action)
    setShowBatchConfirm(true)
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

  const columns = [
    { title: "To Do", status: "todo", placeholderText: "No tasks to do", bgColor: "bg-[#fac2ff]" },
    { title: "In Progress", status: "in-progress", placeholderText: "No tasks in progress", bgColor: "bg-[#85d9f1]" },
    { title: "Done", status: "completed", placeholderText: "No completed tasks", bgColor: "bg-[#cfffcd]" },
  ]

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="h-screen p-4 flex flex-col">
        {/* Top Section with Search and Action Buttons */}
        <div className="flex flex-col gap-4 mb-6">
          {/* FilterSection */}
          <FilterSection 
            filters={filters} 
            tasks={tasks} 
            onFilterChange={handleFilterChange}
            setHasSearched={setHasSearched}
          />

          {/* Action Buttons */}
          <div className="flex items-center gap-4">
            <button
              onClick={handleSort}
              className="font-semibold cursor-pointer flex items-center gap-2 px-4 py-2 
                       border border-solid border-black border-opacity-20 rounded-full min-h-[36px] text-sm"
            >
              Due Date {filters.sortOrder === "asc" ? "↑" : "↓"}
            </button>

            <button
              onClick={() => setShowHistory(!showHistory)}
              className="font-semibold cursor-pointer flex items-center gap-2 px-4 py-2 
                       border border-solid border-black border-opacity-20 rounded-full min-h-[36px] text-sm"
            >
              {showHistory ? "Hide Activity" : "Show Activity"}
            </button>

            {selectedTasks.length > 0 && (
              <div className="flex items-center gap-4 ml-auto">
                <button
                  onClick={() => handleBatchActionClick("complete")}
                  className="cursor-pointer px-4 py-2 text-sm bg-green-500 text-white rounded-full
                           hover:bg-green-600 transition-colors duration-200 font-medium"
                >
                  Complete Selected ({selectedTasks.length})
                </button>
                <button
                  onClick={() => handleBatchActionClick("delete")}
                  className="cursor-pointer px-4 py-2 text-sm bg-red-500 text-white rounded-full
                           hover:bg-red-600 transition-colors duration-200 font-medium"
                >
                  Delete Selected ({selectedTasks.length})
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(3)].map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="h-16 bg-gray-200 rounded-t-lg mb-4"></div>
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-24 bg-gray-100 rounded-lg"></div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : status === "failed" ? (
          <div className="p-4 text-center text-red-500">Failed to load tasks</div>
        ) : filteredTasks.length === 0 && hasSearched && tasks.length > 0 ? (
          <div className="flex flex-col items-center justify-center mt-8">
            <img src={noresult} alt="No Results" className="w-64 h-64 mb-4" />
            <p className="text-gray-600">No matching tasks found</p>
          </div>
        ) : (
          <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4 min-h-0">
            {columns.map(({ title, status, placeholderText, bgColor }) => (
              <BoardView
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
        )}

        {/* Task History Modal */}
        {showHistory && (
          <TaskHistory
            className="w-full max-w-2xl mx-auto mb-6" 
            onClose={() => setShowHistory(false)}
          />
        )}

        {/* Modals */}
        {isFormOpen && (
          <TaskForm
            onCancel={handleFormClose}
            editingTask={editingTask}
            onSubmitSuccess={handleFormClose}
            className="w-full max-w-lg mx-auto"
          />
        )}

        {showBatchConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-sm mx-4">
              <h3 className="text-lg font-semibold mb-4">Confirm Batch Action</h3>
              <p className="text-gray-600 mb-6">
                {batchAction === "complete"
                  ? `Are you sure you want to mark ${selectedTasks.length} tasks as complete?`
                  : `Are you sure you want to delete ${selectedTasks.length} tasks? This action cannot be undone.`}
              </p>
              <div className="flex justify-end gap-4">
                <button
                  onClick={() => {
                    setShowBatchConfirm(false)
                    setBatchAction(null)
                  }}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleBatchConfirm}
                  disabled={batchStatus === "processing"}
                  className={`px-4 py-2 text-white rounded-lg transition-colors duration-200
                            ${
                              batchAction === "complete"
                                ? "bg-green-500 hover:bg-green-600"
                                : "bg-red-500 hover:bg-red-600"
                            }
                            disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {batchStatus === "processing" 
                    ? "Processing..." 
                    : batchAction === "complete" 
                      ? "Complete" 
                      : "Delete"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DragDropContext>
  )
}

export default TaskBoard;