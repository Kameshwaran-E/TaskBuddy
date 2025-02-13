export interface Task {
  id: string;
  userId: string | undefined;
  title: string;
  description: string;
  category: string;
  dueDate: string;
  status: string;
  selectedTasks?: string[];
  onTaskSelect?: string[];
  createdAt: string;
  updatedAt: string;
  tags?: string[];
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  attachments: { fileName: string; fileUrl: string }[];
  completedAt?: string | null
}
export interface InputFieldProps {
  label: string;
  placeholder?: string;
  type?: 'button' | 'submit' | 'reset';
  icon?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
  
}

export interface TaskFormData {
  title: string;
  description: string;
  category: string;
  dueDate: string;
  status: string;
  type?: 'button' | 'submit' | 'reset';
}

export interface TaskHistory {
  id: string
  taskId: string
  action: "created" | "updated" | "deleted"
  changes: TaskHistoryChange[]
  timestamp: string
}

export interface TaskHistoryChange {
  field: keyof Task | "all"
  oldValue?: any
  newValue: any
}



