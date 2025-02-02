import React, { useState } from "react";
import { Task } from "../../types";

interface TaskColumnProps {
  title: string;
  placeholderText: string;
  tasks: Task[];
  status: string;
  onAddTask?: () => void;
  selectedTasks: string[];
  onTaskSelect: (task: string) => void;
  onDrop?: (task: Task) => void;
  onEditTask?: (task: Task) => void;
  onDeleteTask?: (taskId: string) => void;
}
const statusColors: Record<string, string> = {
  'todo': 'bg-[#fac2ff]',
  'in-progress': 'bg-[#85d9f1]',
  'completed': 'bg-[#cfffcd]',
};

const ListView: React.FC<TaskColumnProps> = ({
  title,
  placeholderText,
  tasks,
  status,
  onAddTask,
  onDrop,
  onEditTask,
  onDeleteTask,
}) => {
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.currentTarget.classList.add("bg-zinc-200");
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.currentTarget.classList.remove("bg-zinc-200");
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.currentTarget.classList.remove("bg-zinc-200");

    setTimeout(() => {
      const taskId = e.dataTransfer.getData("taskId");
      if (!taskId) return;

      const task = tasks.find((t) => t.id === taskId);
      if (task && task.status !== status) {
        const updatedTask = { ...task, status, updatedAt: new Date().toISOString() };
        onDrop?.(updatedTask);
      }
    }, 0);
  };

  const handleDeleteClick = (e: React.MouseEvent, taskId: string) => {
    e.stopPropagation();
    setTaskToDelete(taskId);
  };

  const handleConfirmDelete = () => {
    if (taskToDelete && onDeleteTask) {
      onDeleteTask(taskToDelete);
      setTaskToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setTaskToDelete(null);
  };

  const filteredTasks = tasks.filter((task) => task.status === status);

  return (
    <div
      className="flex flex-col p-2 rounded-lg border border-gray-200 bg-zinc-100 
                 transition-colors duration-200 w-full min-h-[200px]
                 max-sm:min-h-[300px] shadow-md"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Header Section */}
      <div className={`flex items-center justify-between p-4 rounded-t-lg text-black ${statusColors[status] || 'bg-gray-500'}`}>
          <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
        <span className="px-3 py-1 text-sm bg-gray-200 rounded-full">{filteredTasks.length}</span>
      </div>

      {/* Task List Container */}
      <div className="flex flex-col px-4 mt-3 overflow-auto max-h-[500px] sm:max-h-[400px]">
        {/* Add Task Button */}
        <button
          onClick={onAddTask}
          className="flex items-center gap-2 text-sm font-bold uppercase text-gray-700 
                    hover:text-gray-900 transition-opacity duration-200 mb-4 cursor-pointer"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            strokeWidth="2"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          <span>Add task</span>
        </button>

        {/* Empty State */}
        {filteredTasks.length === 0 ? (
          <div className="flex items-center justify-center min-h-20 mt-8 text-base font-medium text-center text-zinc-500">
            {placeholderText}
          </div>
        ) : (
          <ol className="space-y-2">
            {filteredTasks.map((task) => (
              <li
                key={task.id}
                draggable
                onDragStart={(e) => e.dataTransfer.setData("taskId", task.id)}
                onClick={() => onEditTask?.(task)}
                className="cursor-pointer bg-white p-3 rounded-lg shadow-sm hover:shadow-md 
                           transition-all duration-200 flex flex-col sm:flex-row items-start sm:items-center"
              >
                 <div className={`flex items-center justify-between p-4 rounded-t-lg text-black ${statusColors[status] || 'bg-gray-500'}`}>
                 <h3 className="font-medium text-gray-800 flex-1">{task.title}</h3>
                  <span className="px-2 py-1 text-xs font-medium text-blue-600 bg-blue-100 rounded-full">
                    {task.category}
                  </span>
                  <span className="text-xs text-gray-500 ml-2">Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                </div>
                <button
                  onClick={(e) => handleDeleteClick(e, task.id)}
                  className="text-white m-2 sm:mt-0 bg-red-400 
                             px-3 py-1 rounded-full transition-colors duration-200 text-xs cursor-pointer  transition delay-150 duration-300 ease-in-out hover:-translate-y-1 hover:scale-110 "
                >
                  Delete
                </button>
              </li>
            ))}
          </ol>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {taskToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Confirm Delete</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this task? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={handleCancelDelete}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors duration-200"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ListView;
