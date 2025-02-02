import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import {
  updateTask,
  toggleTaskSelection,
  batchUpdateTasks,
  batchDeleteTasks,
  sortTasksByDueDate,
  deleteTask, 
} from '../../store/slices/tasksSlice';
import BoardView from './BoardView';
import { TaskForm } from '../createtask/TaskForm';
import { Task } from '../../types';
import TaskHistory from './TaskHistory';
import FilterSection, { TaskFilters } from '../header/FilterSection';

const TaskBoard: React.FC = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [showHistory, setShowHistory] = useState(false);

  const dispatch = useDispatch();
  const tasks = useSelector((state: RootState) => state.tasks.tasks);
  const selectedTasks = useSelector((state: RootState) => state.tasks.selectedTasks);
  const sortOrder = useSelector((state: RootState) => state.tasks.sortOrder);

  const [filters, setFilters] = useState<TaskFilters>({
    sortOrder: "asc",
    title: "",
    category: "",
    dueDate: null,
  });


  useEffect(() => {
    // Sort tasks when sortOrder changes
    dispatch(sortTasksByDueDate(filters.sortOrder));
  }, [filters.sortOrder, dispatch]);

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
    dispatch(batchUpdateTasks({
      ids: selectedTasks,
      updates: { status: 'completed' }
    }));
  };

  const handleBatchDelete = () => {
    dispatch(batchDeleteTasks(selectedTasks));
  };

  const handleSort = () => {
    const newOrder = sortOrder === 'asc' ? 'desc' : 'asc';
    dispatch(sortTasksByDueDate(newOrder));
  };

  const handleDeleteTask = (taskId: string) => {
    dispatch(deleteTask(taskId)); // Dispatch delete action for a single task
  };
  const handleFilterChange = (newFilters: TaskFilters) => {
    setFilters(newFilters);
  };

  const columns = [
    { title: 'To Do', status: 'todo', placeholderText: 'No tasks to do', bgColor: 'bg-[#fac2ff]' },
    { title: 'In Progress', status: 'in-progress', placeholderText: 'No tasks in progress', bgColor: 'bg-[#85d9f1]' },
    { title: 'Done', status: 'completed', placeholderText: 'No completed tasks', bgColor: 'bg-[#cfffcd]' }
  ];
 
  return (
    <div className="p-6">
       <FilterSection
        filters={filters}
        tasks={tasks}
        onFilterChange={handleFilterChange}
      />
      <div className="flex justify-between items-center mb-6 m-3">
        <div className="flex items-center gap-4">
          <button
            onClick={handleSort}
            className="font-semibold cursor-pointer flex items-center gap-1 px-3 py-2 border border-solid border-black border-opacity-20 rounded-full min-h-[26px] w-[150px] text-sm"
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
            className="font-semibold cursor-pointer flex items-center gap-1 px-3 py-2 border border-solid border-black border-opacity-20 rounded-full min-h-[26px] w-[150px] text-sm"
            aria-label={showHistory ? 'Hide task history' : 'Show task history'}
          >
            {showHistory ? 'Hide Activity' : 'Show Activity'}
          </button>
        </div>
        <div className="flex items-center gap-2">
          {selectedTasks.length > 0 && (
            <>
              <button
                onClick={handleBatchComplete}
                className="cursor-pointer px-3 py-1 text-sm bg-green-500 text-black rounded hover:bg-green-600"
              >
                Complete Selected
              </button>
              <button
                onClick={handleBatchDelete}
                className="px-3 py-1 text-sm bg-red-500 text-black rounded hover:bg-red-600"
              >
                Delete Selected
              </button>
            </>
          )}
        
        </div>
      </div>
      {showHistory && <TaskHistory />}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {columns.map(({ title, status, placeholderText }) => (
          <div key={status} className="p-4 rounded-lg">
            <BoardView
              title={title}
              status={status}
              tasks={tasks}
              placeholderText={placeholderText}
              onAddTask={handleAddTask}
              onDrop={handleTaskDrop}
              onEditTask={handleEditTask}
              onDeleteTask={handleDeleteTask} // Pass delete function to BoardView
              selectedTasks={selectedTasks}
              onTaskSelect={handleTaskSelect}
            />
          </div>
        ))}
      </div>

      {showHistory && <TaskHistory />}

      {isFormOpen && (
        <TaskForm
          onCancel={handleFormClose}
          editingTask={editingTask}
          onSubmitSuccess={handleFormSubmitSuccess} className={''}        />
      )}
    </div>
  );
};

export default TaskBoard;
