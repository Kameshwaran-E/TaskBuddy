import React from 'react';
import { ButtonProps } from './types';

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'secondary',
  onClick,
  className = '',
   // added disabled prop
}) => {
  const baseStyles = "px-6 py-2.5 text-sm font-bold cursor-pointer rounded-[41px]";
  const variantStyles = variant === 'primary' 
    ? "text-white bg-fuchsia-800 border-none" 
    : "bg-white border border-solid border-black border-opacity-20";
  // added styles for disabled state

  return (
    <button 
      onClick={onClick}
      className={`${baseStyles} ${variantStyles}  ${className}`}
      // make sure the button is disabled in HTML as well
    >
      {children}
    </button>
  );
};
