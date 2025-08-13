// components/ui/Input.tsx
import React from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  showPasswordToggle?: boolean;
}

export function Input({
  label,
  error,
  icon,
  showPasswordToggle = false,
  className = '',
  type = 'text',
  ...props
}: InputProps) {
  const [showPassword, setShowPassword] = React.useState(false);
  const inputType = showPasswordToggle ? (showPassword ? 'text' : 'password') : type;

  const baseStyles = 'w-full  px-4 py-3 bg-white/80 backdrop-blur-sm border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 dark:bg-gray-800/80 dark:border-gray-600 dark:text-white dark:placeholder-gray-500 hover:bg-white dark:hover:bg-gray-800';

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
          {label}
        </label>
      )}
      
      <div className="relative group">
        {icon && (
          <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 flex items-center transition-colors duration-200 group-focus-within:text-blue-500">
            {icon}
          </div>
        )}
        
        <input
          type={inputType}
          className={`${baseStyles} ${icon ? 'pl-12' : ''} ${showPasswordToggle ? 'pr-12' : ''} ${error ? 'border-red-500 focus:ring-red-500 bg-red-50/50 dark:bg-red-900/20' : ''} ${className}`}
          {...props}
        />
        
        {showPasswordToggle && (
          <button
            type="button"
            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        )}
      </div>
      
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400 font-medium">{error}</p>
      )}
    </div>
  );
}