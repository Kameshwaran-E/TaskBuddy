// types.ts

export interface Task {
  id: string;
  title: string;
  description: string;
  category: string;
  dueDate: string;
  status: string;
  attachments: { fileName: string; fileUrl: string }[]; // Corrected to hold file objects
}

export interface TaskHistory {
  id: string;
  taskId: string;
  action: 'created' | 'updated' | 'deleted';
  changes: { field: string; oldValue: any; newValue: any }[];
  timestamp: string;
}

export interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
  onClick?: () => void;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
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
  attachments: { fileName: string; fileUrl: string }[]; // Include attachments in the data type
}
