import React from 'react';
import { InputFieldProps } from './types';

export const InputField: React.FC<InputFieldProps> = ({
  label,
  placeholder,
  type = 'text',
  icon,
  value,
  onChange,
  className = ''
}) => {
  return (
    <div className="relative flex-1 max-sm:w-full">
      <label className="mb-2 text-xs font-semibold text-black text-opacity-60">
        {label}
      </label>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className={`p-3 w-full text-sm rounded-lg border border-solid bg-zinc-100 bg-opacity-40 border-black border-opacity-10 ${className}`}
      />
      {icon && (
        <i className={`${icon} absolute right-3 top-2/4 -translate-y-2/4 pointer-events-none`} />
      )}
    </div>
  );
};