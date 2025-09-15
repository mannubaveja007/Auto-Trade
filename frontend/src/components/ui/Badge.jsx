import React from 'react';
import { motion } from 'framer-motion';
import { cn, getStatusColor } from '../../lib/utils';

export function Badge({ children, variant, className, animate = true, ...props }) {
  const Component = animate ? motion.span : 'span';
  const motionProps = animate ? {
    initial: { scale: 0 },
    animate: { scale: 1 },
    transition: { type: 'spring', stiffness: 300 }
  } : {};

  return (
    <Component
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
        variant ? getStatusColor(variant) : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
        className
      )}
      {...motionProps}
      {...props}
    >
      {children}
    </Component>
  );
}

export default Badge;