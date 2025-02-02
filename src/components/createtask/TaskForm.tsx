import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import { Button } from './Button';
import { InputField } from './InputField';
import { Task } from '../../types';
import { useDispatch } from 'react-redux';
import { addTask, updateTask } from '../../store/slices/tasksSlice';
import { v4 as uuidv4 } from 'uuid';
import { toast, ToastContainer } from 'react-toastify';  // Importing toast and ToastContainer
import 'react-toastify/dist/ReactToastify.css';  // Importing CSS for React Toastify

Modal.setAppElement('#root');

interface TaskFormProps {
  onCancel: () => void;
  editingTask?: Task | null;
  onSubmitSuccess?: () => void;
  className:string;
}

export const TaskForm: React.FC<TaskFormProps> = ({ onCancel, editingTask, onSubmitSuccess }) => {
  const dispatch = useDispatch();
  const [formData, setFormData] = useState<Omit<Task, 'id' | 'attachments'>>({
    title: '',
    description: '',
    category: '',
    dueDate: '',
    status: '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  
  });

  const [attachments, setAttachments] = useState<File[]>([]);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalIsOpen, setModalIsOpen] = useState(false);

  useEffect(() => {
    setModalIsOpen(true); // Open modal when component mounts
    if (editingTask) {
      setFormData({
        title: editingTask.title,
        description: editingTask.description,
        category: editingTask.category,
        dueDate: editingTask.dueDate,
        status: editingTask.status,
        createdAt: editingTask.createdAt,
        updatedAt: new Date().toISOString(),
      });
      setAttachments([]); // Clear previous attachments on edit
    } else {
      setFormData({
        title: '',
        description: '',
        category: '',
        dueDate: '',
        status: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      setAttachments([]);
    }
  }, [editingTask]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      setAttachments(Array.from(files));  // Convert the FileList to an array
    }
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    if (!formData.title.trim()) newErrors.title = 'Task title is required';
    if (!formData.category) newErrors.category = 'Task category is required';
    if (!formData.dueDate) newErrors.dueDate = 'Due date is required';
    if (!formData.status) newErrors.status = 'Task status is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm() || isSubmitting) return;
  
    setIsSubmitting(true);
    try {
      const taskData: Task = {
        id: editingTask?.id || uuidv4(),
        ...formData,
        attachments: attachments.map((file) => ({
          fileName: file.name,
          fileUrl: URL.createObjectURL(file),
        })),
      };
  
      if (editingTask) {
        dispatch(updateTask(taskData));
        toast.success('Task updated successfully');
      } else {
        dispatch(addTask(taskData));
        toast.success('Task created successfully');
      }
  
      setTimeout(() => {
        onSubmitSuccess?.();
        setModalIsOpen(false);
        onCancel();
      }, 2000); // Delay to allow toast to display
    } catch (error) {
      toast.error('Failed to save task. Please try again.');
      console.error('Error saving task:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={onCancel}
        style={{
          content: {
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '700px',
            maxWidth: '100%',
            height: '90vh',
            padding: '24px',
            borderRadius: '18px',
            boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
          },
          overlay: {
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 1000,
          },
        }}
        contentLabel={editingTask ? 'Edit Task' : 'Create Task'}
      >
        <button
          type="button"
          onClick={onCancel}
          className="absolute top-4 right-4 text-gray-800 hover:text-gray-700 text-xl cursor-pointer"
          aria-label="Close form"
        >
          ✕
        </button>

        <h1 className="text-2xl font-semibold text-zinc-800 mb-4 text-center">
          {editingTask ? 'Edit Task' : 'Create Task'}
        </h1>

        <div className="overflow-y-auto flex-1 px-2" style={{ maxHeight: 'calc(80vh - 80px)' }}>
          <form onSubmit={handleSubmit} className="w-full flex flex-col">
            <InputField
              label="Task Title"
              placeholder="Task title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="mb-4 w-full"
            />
            {errors.title && <p className="text-red-500 text-xs">{errors.title}</p>}

            <div className="mb-4">
              <label className="mb-2 text-xs font-semibold text-black text-opacity-60">Description</label>
              <textarea
                placeholder="Description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="p-3 w-full text-sm rounded-lg border border-solid resize-none bg-zinc-100 bg-opacity-40 border-black border-opacity-10 min-h-[100px]"
              />
            </div>

            <div className="mb-4">
              <label className="mb-2 text-xs font-semibold text-black text-opacity-60">Attachments</label>
              <input
                type="file"
                multiple
                onChange={handleFileChange}  // Added here
                className="p-2 w-full text-sm rounded-lg border border-solid bg-zinc-100 bg-opacity-40 border-black border-opacity-10"
              />
            </div>

            <div className="mb-4">
              <label className="mb-2 text-xs font-semibold text-black text-opacity-60">Task Category*</label>
              <div className="flex gap-2.5">
                {['Work', 'Personal', 'Shopping', 'Health'].map((category) => (
                  <Button
                    key={category}
                    type="button"
                    onClick={() => setFormData({ ...formData, category })}
                    className="px-6 py-2 text-xs hover:bg-fuchsia-800 hover:text-white"
                  >
                    {category}
                  </Button>
                ))}
              </div>
              {errors.category && <p className="text-red-500 text-xs">{errors.category}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-2 text-xs font-semibold text-black text-opacity-60">Due on*</label>
                <input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  className="p-3 w-full text-sm rounded-lg border border-solid bg-zinc-100 bg-opacity-40 border-black border-opacity-10"
                />
              </div>

              <div>
                <label className="mb-2 text-xs font-semibold text-black text-opacity-60">Task Status*</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="p-3 w-full text-sm rounded-lg border border-solid bg-zinc-100 bg-opacity-40 border-black border-opacity-10"
                >
                  <option value="">Choose</option>
                  <option value="todo">To Do</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Done</option>
                </select>
              </div>
            </div>

            <div className="flex gap-4 justify-end p-4 bg-zinc-100">
              <Button type="button" className='hover:bg-red-500 hover:text-white' onClick={onCancel}>CANCEL</Button>
              <Button type="submit" variant="primary">
                {isSubmitting ? 'SAVING...' : editingTask ? 'UPDATE' : 'CREATE'}
              </Button>
            </div>
          </form>
        </div>
      </Modal>

      {/* ToastContainer to render toasts */}
      <ToastContainer />
    </>
  );
};
