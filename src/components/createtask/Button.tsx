import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary"
  className?: string
}

export const Button: React.FC<ButtonProps> = ({ children, variant = "secondary", className = "", ...props }) => {
  const baseClasses = "px-6 py-2.5 text-sm font-bold cursor-pointer rounded-[41px]";
  const variantClasses= variant === 'primary' 
    ? "text-white bg-fuchsia-800 border-none" 
    : "";
  // added styles for disabled state

  return (
    <button className={`${baseClasses} ${variantClasses} ${className}`} {...props}>
      {children}
    </button>
  );
};


