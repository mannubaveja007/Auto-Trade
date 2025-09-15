import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

export function formatDate(date) {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(date));
}

export function formatDateTime(date) {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
}

export function generateId() {
  return Math.random().toString(36).substr(2, 9);
}

export function getStatusColor(status) {
  const colors = {
    open: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
    negotiating: 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400',
    completed: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
    cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
    pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
    accepted: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
    rejected: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
  };
  return colors[status?.toLowerCase()] || 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
}

export function getUrgencyColor(urgency) {
  const colors = {
    low: 'text-green-600 dark:text-green-400',
    medium: 'text-orange-600 dark:text-orange-400',
    high: 'text-red-600 dark:text-red-400',
  };
  return colors[urgency?.toLowerCase()] || 'text-gray-600 dark:text-gray-400';
}