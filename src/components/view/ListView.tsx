import React, { useState, useEffect } from 'react';
import { Task } from '../../types';
import { Droppable, Draggable } from '@hello-pangea/dnd';
import type { DroppableProps } from '@hello-pangea/dnd';

interface TaskColumnProps {
  title: string;
  placeholderText?: string;
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

// Create a wrapper component for Droppable with proper typing
const StrictModeDroppable = ({
  children,
  droppableId,
  type,
  ...props
}: DroppableProps) => {
  const [enabled, setEnabled] = useState(false);
  
  useEffect(() => {
    const animation = requestAnimationFrame(() => setEnabled(true));
    return () => {
      cancelAnimationFrame(animation);
      setEnabled(false);
    };
  }, []);

  if (!enabled) {
    return null;
  }

  return <Droppable droppableId={droppableId} type={type} {...props}>{children}</Droppable>;
};

const ListView: React.FC<TaskColumnProps> = ({
  title,
  tasks = [],
  status,
  selectedTasks = [],
  onTaskSelect,
  onEditTask = () => {},
  onDeleteTask = () => {},
  onAddTask = () => {},
  statusColors,
}) => {
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(true);

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
          <div className="space-y-4 max-h-[calc(100vh-16rem)] overflow-y-auto">
            <div 
              ref={provided.innerRef} 
              {...provided.droppableProps}
              className={`rounded-lg bg-[#f1f1f1]  border ${
                snapshot.isDraggingOver ? 'border-blue-400 shadow-lg' : 'border-gray-200'
              } overflow-hidden transition-all duration-200`}
            >
              <div 
                onClick={() => setIsExpanded(!isExpanded)}
                className={`flex items-center justify-between p-4 text-black ${statusColors} 
                         cursor-pointer transition-colors duration-200 hover:bg-opacity-90`}
              >
                <div className="flex items-center gap-2">
                  <svg
                    className={`w-5 h-5 transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                  <h2 className="text-lg font-semibold">{title}</h2>
                </div>
                <span className="px-3 py-1 text-sm bg-white bg-opacity-30 rounded-full">
                  {tasks.length}
                </span>
              </div>

              <div className={`transition-all duration-200 ${isExpanded ? 'max-h-[2000px]' : 'max-h-0'} overflow-hidden`}>
                <div className="p-4">
                  <button
                    onClick={onAddTask}
                    className="w-full mb-4 flex items-center gap-2 text-sm font-semibold text-gray-700 
                             hover:text-gray-900 transition-colors duration-200 group"
                  >
                    <svg className="w-5 h-5 group-hover:scale-110 transition-transform duration-200"
                         fill="none" strokeWidth="2" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                    </svg>
                    <span className='cursor-pointer'>Add task</span>
                  </button>

                  <div ref={provided.innerRef} {...provided.droppableProps}>
                    {tasks.map((task, index) => (
                      <Draggable key={task.id} draggableId={task.id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`group bg-white rounded-lg shadow-sm hover:shadow-md mb-3 
                                     transition-all duration-200 ${
                                       snapshot.isDragging ? 'rotate-1 scale-[1.02] ring-2 ring-blue-400 shadow-xl' : ''
                                     }`}
                          >
                            <div className="flex items-center gap-4 p-3">
                              <input
                                type="checkbox"
                                checked={selectedTasks.includes(task.id)}
                                onChange={() => onTaskSelect(task.id)}
                                className="cursor-pointer w-4 h-4 text-blue-600 rounded flex-shrink-0"
                              />
                              <div 
                                className="flex items-center justify-between flex-1 min-w-0 cursor-pointer" 
                                onClick={() => onEditTask?.(task)}
                              >
                                <div className="flex items-center gap-4 flex-1 min-w-0">
                                  <span className="font-medium truncate">{task.title}</span>
                                  <span className="text-sm text-gray-500 whitespace-nowrap">{task.category}</span>
                                  <span className="text-sm text-gray-500 whitespace-nowrap flex items-center gap-1">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    {new Date(task.dueDate).toLocaleDateString()}
                                  </span>
                                </div>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteClick(e, task.id);
                                  }}
                                  className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-50
                                           transition-colors duration-200 md:opacity-0 group-hover:opacity-100"
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
              </div>
            </div>
          </div>

          {/* Delete confirmation modal */}
          {taskToDelete && (
            <div className="fixed inset-0 bg-gray-900/75 bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 max-w-sm mx-4">
                <h3 className="text-lg font-semibold mb-4">Confirm Delete</h3>
                <p className="text-gray-600 mb-6">
                  Are you sure you want to delete this task? This action cannot be undone.
                </p>
                <div className="flex justify-end gap-4">
                  <button
                    onClick={() => setTaskToDelete(null)}
                    className="cursor-pointer px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirmDelete}
                    className="cursor-pointer px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 
                             transition-colors duration-200"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </StrictModeDroppable>
  );
};

export default ListView;
