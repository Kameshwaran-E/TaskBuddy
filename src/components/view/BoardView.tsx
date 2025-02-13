import React, { useState } from 'react';
import { Task } from '../../types';
import { Draggable } from '@hello-pangea/dnd';
import { StrictModeDroppable } from '../utils/StrictModeDroppable';

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
  statusColors: string;
}

function BoardView({
  title,
  tasks,
  status,
  selectedTasks,
  onTaskSelect,
  onEditTask,
  onDeleteTask,
  statusColors,
  onAddTask,
}: TaskColumnProps) {
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null);

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

  return (
    <StrictModeDroppable droppableId={status}>
      {(provided, snapshot) => (
        <>
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`flex flex-col h-full rounded-lg border ${
              snapshot.isDraggingOver ? `${statusColors} shadow-lg scale-[1.02]` : 'border-gray-200'
            } transition-all duration-200`}
          >
            <div className={`flex items-center justify-between p-4 rounded-t-lg text-black ${statusColors}`}>
              <h2 className="text-lg font-semibold">{title}</h2>
              <span className="px-3 py-1 text-sm bg-white bg-opacity-30 rounded-full">
                {tasks.length}
              </span>
            </div>

            <div className="flex-1 p-4 bg-[#f1f1f1] overflow-y-auto max-h-[calc(100vh-16rem)]">
              <button
                onClick={onAddTask}
                className="w-full mb-4 flex items-center gap-2 text-sm font-semibold text-gray-700 
                         hover:text-gray-900 transition-colors duration-200 group"
              >
                <svg
                  className="w-5 h-5 group-hover:scale-110 transition-transform duration-200"
                  fill="none"
                  strokeWidth="2"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                <span className='cursor-pointer'>Add task</span>
              </button>

              {tasks.map((task, index) => (
                <Draggable key={task.id} draggableId={task.id} index={index}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      style={{
                        ...provided.draggableProps.style,
                        transform: snapshot.isDragging ? provided.draggableProps.style?.transform : 'none'
                      }}
                      className={`group bg-white rounded-lg shadow-sm hover:shadow-md mb-3 
                                transition-all duration-200 ${
                                  snapshot.isDragging ? 'rotate-2 scale-105 shadow-xl ring-2 ring-blue-400' : ''
                                }`}
                    >
                      <div className="p-4" onClick={() => onEditTask?.(task)}>
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3 flex-1">
                            <input
                              type="checkbox"
                              checked={selectedTasks.includes(task.id)}
                              onChange={() => onTaskSelect(task.id)}
                              onClick={(e) => e.stopPropagation()}
                              className="cursor-pointer w-4 h-4 text-blue-600 rounded focus:ring-blue-500 
                                       border-gray-300 transition-colors duration-200"
                              aria-label={`Select task: ${task.title}`}
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-col gap-2">
                                <h3 className="font-medium text-gray-900 truncate">{task.title}</h3>
                                {task.description && (
                                  <p className="text-sm text-gray-600 line-clamp-2 hidden sm:block">
                                    {task.description}
                                  </p>
                                )}
                                <div className="flex flex-wrap gap-2">
                                  <span className="px-2 py-1 text-xs font-medium text-blue-600 bg-blue-50 rounded-full">
                                    {task.category}
                                  </span>
                                  <span className="text-xs text-gray-500 flex items-center gap-1">
                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    {new Date(task.dueDate).toLocaleDateString()}
                                  </span>
                                  {task.completedAt && (
                                    <span className="text-xs text-green-600">
                                      Completed: {new Date(task.completedAt).toLocaleDateString()}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={(e) => handleDeleteClick(e, task.id)}
                            className="cursor-pointer text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-50
                                     transition-colors duration-200 visible md:invisible group-hover:visible
                                     focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
                            aria-label={`Delete task: ${task.title}`}
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          </div>

          {taskToDelete && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 max-w-sm mx-4">
                <h3 className="text-lg font-semibold mb-4">Confirm Delete</h3>
                <p className="text-gray-600 mb-6">Are you sure you want to delete this task?</p>
                <div className="flex justify-end gap-4">
                  <button onClick={() => setTaskToDelete(null)} className="px-4 py-2 text-gray-600">Cancel</button>
                  <button onClick={handleConfirmDelete} className="px-4 py-2 bg-red-500 text-white rounded-lg">Delete</button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </StrictModeDroppable>
  );
}

export default BoardView;