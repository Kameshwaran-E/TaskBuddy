import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../../store";
import {
  updateTask,
  toggleTaskSelection,
  batchUpdateTasks,
  batchDeleteTasks,
  sortTasksByDueDate,
  setFilters,
  deleteTask,
} from "../../store/slices/tasksSlice";
import AccordionItem from "./AccordionItem";
import { TaskForm } from "../createtask/TaskForm";
import { Task } from "../../types";
import TaskHistory from "./TaskHistory";
import FilterSection from "../header/FilterSection";

const TaskList: React.FC = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [showHistory, setShowHistory] = useState(false);

  const dispatch = useDispatch();
  const tasks = useSelector((state: RootState) => state.tasks.tasks);
  const selectedTasks = useSelector(
    (state: RootState) => state.tasks.selectedTasks
  );
  const sortOrder = useSelector((state: RootState) => state.tasks.sortOrder);
  const filters = useSelector((state: RootState) => state.tasks.filters);

  const handleAddTask = () => {
    setEditingTask(null);
    setIsFormOpen(true);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setIsFormOpen(true);
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingTask(null);
  };

  const handleTaskDrop = (updatedTask: Task) => {
    dispatch(updateTask(updatedTask));
  };

  const handleFormSubmitSuccess = () => {
    setIsFormOpen(false);
    setEditingTask(null);
  };

  const handleTaskSelect = (taskId: string) => {
    dispatch(toggleTaskSelection(taskId));
  };

  const handleBatchComplete = () => {
    dispatch(
      batchUpdateTasks({
        ids: selectedTasks,
        updates: { status: "completed" },
      })
    );
  };

  const handleBatchDelete = () => {
    dispatch(batchDeleteTasks(selectedTasks));
  };

  const handleSort = () => {
    const newOrder = sortOrder === "asc" ? "desc" : "asc";
    dispatch(sortTasksByDueDate(newOrder));
  };

  const handleFilterChange = (newFilters: any) => {
    dispatch(setFilters(newFilters));
  };

  const handleDeleteTask = (taskId: string) => {
    dispatch(deleteTask(taskId));
  };

  const filteredTasks = tasks.filter((task) => {
    const matchesTitle = filters.title
      ? task.title.toLowerCase().includes(filters.title.toLowerCase())
      : true;
    const matchesCategory = filters.category
      ? task.category === filters.category
      : true;

    const startDate = filters.dateRange?.start ?? null;
    const endDate = filters.dateRange?.end ?? null;

    const matchesDateRange =
      startDate && endDate
        ? task.dueDate &&
          new Date(task.dueDate) >= new Date(startDate) &&
          new Date(task.dueDate) <= new Date(endDate)
        : true;

    return matchesTitle && matchesCategory && matchesDateRange;
  });

  const columns = [
    { title: "To Do", status: "todo", placeholderText: "No tasks to do",bgColor: 'bg-[#fac2ff]' },
    {
      title: "In Progress",
      status: "in-progress",
      placeholderText: "No tasks in progress",
      bgColor: 'bg-[#85d9f1]'
    },
    {
      title: "Completed",
      status: "completed",
      placeholderText: "No completed tasks",
      bgColor: 'bg-[#cfffcd]'
    },
  ];

  return (
    <div className="p-6 sm:px-8 lg:px-12">
      <FilterSection
        tasks={tasks}
        filters={filters}
        onFilterChange={handleFilterChange}
      />

<div className="flex justify-between items-center mb-6 m-3">
        <div className="flex items-center gap-4">
          <button
            onClick={handleSort}
            className="font-semibold cursor-pointer flex items-center gap-1 px-3 py-2 border border-solid border-black border-opacity-20 rounded-full min-h-[26px] w-[140px] text-sm"
            aria-label={`Sort tasks by due date in ${sortOrder === 'asc' ? 'ascending' : 'descending'} order`}
          >
            <span>Due Date</span>
            {sortOrder && (
              <svg
                className={`w-4 h-4 transform ${sortOrder === 'desc' ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            )}
          </button>
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="font-semibold cursor-pointer flex items-center gap-1 px-3 py-2 border border-solid border-black border-opacity-20 rounded-full min-h-[26px] w-[140px] text-sm"
            aria-label={showHistory ? 'Hide task history' : 'Show task history'}
          >
            {showHistory ? 'Hide Activity' : 'Show Activity'}
          </button>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          {selectedTasks.length > 0 && (
            <>
              <button
                onClick={handleBatchComplete}
                className="px-3 py-1 text-sm bg-green-500 text-black rounded w-full sm:w-auto"
              >
                Complete Selected
              </button>
              <button
                onClick={handleBatchDelete}
                className="px-3 py-1 text-sm bg-red-500 text-white rounded w-full sm:w-auto"
              >
                Delete Selected
              </button>
            </>
          )}
        </div>
      </div>
      {showHistory && <TaskHistory className="w-full sm:w-96 mx-auto" />}
      <div className="space-y-4 sm:space-y-0 sm:flex sm:flex-wrap sm:gap-4 flex-col">
        {columns.map(({ title, status, placeholderText }) => {
          const columnTasks = filteredTasks.filter((task) => task.status === status);
          return (
            <AccordionItem
              key={status}
              title={title}
              status={status}
              tasks={columnTasks}
              placeholderText={placeholderText}
              onAddTask={handleAddTask}
              onDrop={handleTaskDrop}
              onEditTask={handleEditTask}
              onDeleteTask={handleDeleteTask}
              selectedTasks={selectedTasks}
              onTaskSelect={handleTaskSelect}
              defaultOpen={true}
              className="w-full h-5 sm:w-auto"
            />
          );
        })}
      </div>

      {isFormOpen && (
        <TaskForm
          onCancel={handleFormClose}
          editingTask={editingTask}
          onSubmitSuccess={handleFormSubmitSuccess}
          className="w-full sm:w-96 mx-auto"
        />
      )}
    </div>
  );
};

export default TaskList;