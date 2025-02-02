import React, { useState } from 'react';
import { Task } from '../../types';
import ListView from './ListView';

interface AccordionItemProps {
  title: string;
  status: string;
  tasks: Task[];
  placeholderText: string;
  selectedTasks: string[];
  onTaskSelect: (taskId: string) => void;
  onAddTask: () => void;
  onDrop: (updatedTask: Task) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
  defaultOpen?: boolean;
  className?: string;
}
const statusColors: Record<string, string> = {
  'todo': 'bg-[#fac2ff]',
  'in-progress': 'bg-[#85d9f1]',
  'completed': 'bg-[#cfffcd]',
};

const AccordionItem: React.FC<AccordionItemProps> = ({
  title,
  status,
  tasks,
  placeholderText,
  selectedTasks,
  onTaskSelect,
  onAddTask,
  onDrop,
  onEditTask,
  onDeleteTask,
}) => {
  const [isOpen, setIsOpen] = useState(true); // Accordion starts open

  const toggleAccordion = () => setIsOpen((prev) => !prev);

  return (
    <div className="border-b mb-4">
      <div
        className={`flex justify-between items-center cursor-pointer p-4 h-20 rounded-xl ${statusColors[status] || 'bg-gray-500'}`}
        onClick={toggleAccordion}
      >
        <span className="font-semibold ">{title}</span>
        <svg
          className={`w-4 h-4 transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </div>

      {isOpen && (
        <div className="p-4">
          <ListView
            title={title}
            status={status}
            tasks={tasks}
            placeholderText={placeholderText}
            onAddTask={onAddTask}
            onDrop={onDrop}
            onEditTask={onEditTask}
            onDeleteTask={onDeleteTask}
            selectedTasks={selectedTasks}
            onTaskSelect={onTaskSelect}
          />
        </div>
      )}
    </div>
  );
};

export default AccordionItem;