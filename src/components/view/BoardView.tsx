import React from 'react';
import { Task } from '../../types';

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

function BoardView({
  title,
  placeholderText,
  tasks,
  status,
  onAddTask,
  onDrop,
  onEditTask,
  onDeleteTask,
}: TaskColumnProps) {

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.currentTarget.classList.add('bg-zinc-200');
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.currentTarget.classList.remove('bg-zinc-200');
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.currentTarget.classList.remove('bg-zinc-200');

    const taskId = e.dataTransfer.getData('taskId');
    const task = tasks.find(t => t.id === taskId);

    if (task && task.status !== status) {
      const updatedTask = { ...task, status, updatedAt: new Date().toISOString() };
      onDrop?.(updatedTask);
    }
  };

  return (
    <div
      className="flex flex-col px-2 pt-2 pb-40 rounded-lg border border-gray-300 bg-zinc-100 max-md:pb-24 max-md:mr-1.5 max-md:max-w-full transition-colors duration-200"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className={`flex items-center justify-between p-4 rounded-t-lg text-black ${statusColors[status] || 'bg-gray-500'}`}>
        <h2 className="text-lg font-semibold">{title}</h2>
        <span className="px-2 py-1 text-sm bg-gray-200 text-black rounded-full">
          {tasks.filter(task => task.status === status).length}
        </span>
      </div>

      <div className="flex flex-col mt-3.5 px-4">
        <button
          onClick={onAddTask}
          className="flex gap-2 items-center text-sm font-bold uppercase text-black text-opacity-80 hover:text-opacity-100 transition-opacity duration-200"
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

        {tasks.filter(task => task.status === status).length === 0 ? (
          <div className="flex items-center justify-center min-h-20 mt-8 text-base font-medium text-center text-zinc-500">
            {placeholderText}
          </div>
        ) : (
          <div className="mt-4 space-y-2">
            {tasks
              .filter(task => task.status === status)
              .map(task => (
                <div
                  key={task.id}
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.setData('taskId', task.id);
                  }}
                  onClick={() => onEditTask?.(task)}
                  className="p-4 bg-white rounded-lg shadow-sm cursor-pointer hover:shadow-md transition-shadow duration-200"
                >
                  <h3 className="font-medium text-gray-800">{task.title}</h3>
                  {task.description && (
                    <p className="mt-1 text-sm text-gray-600 line-clamp-2">
                      {task.description}
                    </p>
                  )}
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    <span className="px-2 py-1 text-xs font-medium text-blue-600 bg-blue-100 rounded-full">
                      {task.category}
                    </span>
                    <span className="text-xs text-gray-500">
                      Due: {new Date(task.dueDate).toLocaleDateString()}
                    </span>
                    {task.attachments && task.attachments.length > 0 && (
                      <span className="flex items-center gap-1 text-xs text-gray-500">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                        </svg>
                        {task.attachments.length}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      console.log("Deleting Task:", task.id);
                      onDeleteTask?.(task.id);
                    }}
                    className="text-white m-2 bg-red-400 px-3 py-1 rounded-full transition-colors duration-200 text-xs cursor-pointer hover:-translate-y-1 hover:scale-110"
                  >
                    Delete
                  </button>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default BoardView;
