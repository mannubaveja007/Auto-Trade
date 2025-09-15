import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

export function Input({
  label,
  error,
  className,
  containerClassName,
  required = false,
  ...props
}) {
  return (
    <motion.div
      className={cn('space-y-2', containerClassName)}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <input
        className={cn(
          'w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg',
          'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100',
          'placeholder-gray-400 dark:placeholder-gray-500',
          'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent',
          'transition-colors duration-200',
          error && 'border-red-500 focus:ring-red-500',
          className
        )}
        {...props}
      />
      {error && (
        <motion.p
          className="text-sm text-red-600 dark:text-red-400"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          transition={{ duration: 0.2 }}
        >
          {error}
        </motion.p>
      )}
    </motion.div>
  );
}

export function Select({
  label,
  error,
  children,
  className,
  containerClassName,
  required = false,
  ...props
}) {
  return (
    <motion.div
      className={cn('space-y-2', containerClassName)}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <select
        className={cn(
          'w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg',
          'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100',
          'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent',
          'transition-colors duration-200',
          error && 'border-red-500 focus:ring-red-500',
          className
        )}
        {...props}
      >
        {children}
      </select>
      {error && (
        <motion.p
          className="text-sm text-red-600 dark:text-red-400"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          transition={{ duration: 0.2 }}
        >
          {error}
        </motion.p>
      )}
    </motion.div>
  );
}

export function Textarea({
  label,
  error,
  className,
  containerClassName,
  required = false,
  ...props
}) {
  return (
    <motion.div
      className={cn('space-y-2', containerClassName)}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <textarea
        className={cn(
          'w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg',
          'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100',
          'placeholder-gray-400 dark:placeholder-gray-500',
          'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent',
          'transition-colors duration-200 resize-vertical',
          error && 'border-red-500 focus:ring-red-500',
          className
        )}
        {...props}
      />
      {error && (
        <motion.p
          className="text-sm text-red-600 dark:text-red-400"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          transition={{ duration: 0.2 }}
        >
          {error}
        </motion.p>
      )}
    </motion.div>
  );
}