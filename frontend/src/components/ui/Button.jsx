import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

const buttonVariants = {
  default: 'bg-primary-600 text-white hover:bg-primary-700 dark:bg-primary-600 dark:hover:bg-primary-700',
  secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600',
  success: 'bg-success-600 text-white hover:bg-success-700 dark:bg-success-600 dark:hover:bg-success-700',
  warning: 'bg-warning-600 text-white hover:bg-warning-700 dark:bg-warning-600 dark:hover:bg-warning-700',
  danger: 'bg-danger-600 text-white hover:bg-danger-700 dark:bg-danger-600 dark:hover:bg-danger-700',
  outline: 'border-2 border-primary-600 text-primary-600 hover:bg-primary-50 dark:border-primary-400 dark:text-primary-400 dark:hover:bg-primary-950',
  ghost: 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800',
};

const sizeVariants = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
  xl: 'px-8 py-4 text-lg',
};

export function Button({
  children,
  variant = 'default',
  size = 'md',
  disabled = false,
  loading = false,
  className,
  onClick,
  type = 'button',
  ...props
}) {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-soft hover:shadow-soft-lg';

  return (
    <motion.button
      type={type}
      className={cn(
        baseClasses,
        buttonVariants[variant],
        sizeVariants[size],
        disabled && 'pointer-events-none',
        className
      )}
      disabled={disabled || loading}
      onClick={onClick}
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
      {...props}
    >
      {loading && (
        <motion.div
          className="mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        />
      )}
      {children}
    </motion.button>
  );
}

export default Button;