import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

export function Card({ children, className, hover = true, ...props }) {
  return (
    <motion.div
      className={cn(
        'bg-white dark:bg-gray-900 rounded-xl shadow-soft border border-gray-200 dark:border-gray-800',
        hover && 'hover:shadow-soft-lg transition-shadow duration-200',
        className
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function CardHeader({ children, className }) {
  return (
    <div className={cn('p-6 pb-4', className)}>
      {children}
    </div>
  );
}

export function CardBody({ children, className }) {
  return (
    <div className={cn('p-6 pt-0', className)}>
      {children}
    </div>
  );
}

export function CardFooter({ children, className }) {
  return (
    <div className={cn('p-6 pt-4 border-t border-gray-200 dark:border-gray-800', className)}>
      {children}
    </div>
  );
}