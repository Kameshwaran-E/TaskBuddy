import type React from "react"
import { useState, useEffect } from "react"
import Modal from "react-modal"
import { Button } from "./Button"
import { InputField } from "./InputField"
import type { Task } from "../../types"
import { useDispatch } from "react-redux"
import { createTask, updateTask } from "../../store/slices/tasksSlice"
import type { AppDispatch } from "../../store"
import { toast, ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import { auth } from "../../firebase/firebaseConfig"

Modal.setAppElement("#root")

interface TaskFormProps {
  onCancel: () => void
  editingTask?: Task | null
  onSubmitSuccess?: () => void
  className: string
}

export const TaskForm: React.FC<TaskFormProps> = ({ onCancel, editingTask, onSubmitSuccess }) => {
  const dispatch = useDispatch<AppDispatch>()
  const [formData, setFormData] = useState<Omit<Task, "id" | "attachments">>({
    title: "",
    description: "",
    category: "",
    dueDate: "",
    status: "",
    userId: auth.currentUser?.uid,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  })

  const [attachments, setAttachments] = useState<File[]>([])
  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (editingTask) {
      const { id, attachments, ...rest } = editingTask
      setFormData({
        ...rest,
        updatedAt: new Date().toISOString(),
      })
    } else {
      setFormData({
        title: "",
        description: "",
        category: "",
        dueDate: "",
        status: "",
        userId: auth.currentUser?.uid,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
    }
    setAttachments([])
  }, [editingTask])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files) {
      setAttachments(Array.from(files))
    }
  }

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {}
    if (!formData.title.trim()) newErrors.title = "Task title is required"
    if (!formData.category) newErrors.category = "Task category is required"
    if (!formData.dueDate) newErrors.dueDate = "Due date is required"
    if (!formData.status) newErrors.status = "Task status is required"
    if (formData.description.trim().length > 500) newErrors.description = "Description must be 500 characters or less"
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm() || isSubmitting) return

    setIsSubmitting(true)
    try {
      if (editingTask) {
        await dispatch(updateTask({
          id: editingTask.id,
          ...formData,
          attachments: attachments.map((file) => ({
            fileName: file.name,
            fileUrl: URL.createObjectURL(file),
          })),
        })).unwrap()
        toast.success("Task updated successfully")
      } else {
        await dispatch(createTask({
          ...formData,
          attachments: attachments.map((file) => ({
            fileName: file.name,
            fileUrl: URL.createObjectURL(file),
          })),
        })).unwrap()
        toast.success("Task created successfully")
      }

      onSubmitSuccess?.()
      onCancel()
    } catch (error) {
      console.error("Error saving task:", error)
      toast.error("Failed to save task. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-gray-900/75 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            {editingTask ? "Edit Task" : "Create New Task"}
          </h2>
          <button
            onClick={onCancel}
            className="cursor-pointer text-gray-400 hover:text-gray-500 p-1.5 rounded-full hover:bg-gray-100"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-4">
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="space-y-3">
              <InputField
                label="Task Title*"
                placeholder="Enter task title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
              {errors.title && <p className="text-red-500 text-xs mt-0.5">{errors.title}</p>}

              <textarea
                placeholder="Enter task description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="p-2 w-full text-sm rounded-lg border border-solid resize-none bg-zinc-100 bg-opacity-40 
                         border-black border-opacity-10 h-20"
              />
              {errors.description && <p className="text-red-500 text-xs mt-0.5">{errors.description}</p>}

              <div>
                <label className="block text-xs font-semibold text-black text-opacity-60 mb-1">Attachments</label>
                <input
                  type="file"
                  multiple
                  onChange={handleFileChange}
                  className="p-2 w-full text-sm rounded-lg border border-solid bg-zinc-100 bg-opacity-40 border-black border-opacity-10"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-black text-opacity-60 mb-1">Task Category*</label>
                <div className="grid grid-cols-2 gap-2">
                  {["Work", "Personal"].map((category) => (
                    <Button
                    key={category}
                    type="button"
                    onClick={(e) => {
                      e.preventDefault(); 
                      e.currentTarget.blur();  
                      setFormData({ ...formData, category });
                    }}
                    className={`w-full px-4 py-2 text-xs transition-colors duration-200 ${
                      formData.category === category
                        ? "bg-fuchsia-800 text-white"
                        : "bg-gray-200 text-gray-800 hover:bg-fuchsia-800 hover:text-white"
                    }`}
                  >
                    {category}
                  </Button>
                  
                  ))}
                </div>
                {errors.category && <p className="text-red-500 text-xs mt-0.5">{errors.category}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-black text-opacity-60 mb-1">Due on*</label>
                  <input
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    className="p-3 w-full text-sm rounded-lg border border-solid bg-zinc-100 bg-opacity-40 border-black border-opacity-10"
                  />
                  {errors.dueDate && <p className="text-red-500 text-xs mt-0.5">{errors.dueDate}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-black text-opacity-60 mb-1">Task Status*</label>
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
                  {errors.status && <p className="text-red-500 text-xs mt-0.5">{errors.status}</p>}
                </div>
              </div>
            </div>
          </form>
        </div>

        <div className="flex justify-end gap-3 p-4 border-t border-gray-200">
          <Button onClick={onCancel}>Cancel</Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Saving..." : editingTask ? "Update Task" : "Create Task"}
          </Button>
        </div>
      </div>

      <ToastContainer />
    </div>
  )
}

