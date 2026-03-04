import { Users } from 'lucide-react';
import type { CrowdLevel } from '../lib/database.types';

interface CrowdIndicatorProps {
  level: CrowdLevel | null;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export function CrowdIndicator({ level, size = 'md', showLabel = true }: CrowdIndicatorProps) {
  const colors = {
    low: {
      bg: 'bg-green-100',
      text: 'text-green-800',
      border: 'border-green-300',
      label: 'Low Crowd',
    },
    medium: {
      bg: 'bg-yellow-100',
      text: 'text-yellow-800',
      border: 'border-yellow-300',
      label: 'Medium Crowd',
    },
    high: {
      bg: 'bg-red-100',
      text: 'text-red-800',
      border: 'border-red-300',
      label: 'High Crowd',
    },
  };

  const sizes = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-1.5',
    lg: 'text-base px-4 py-2',
  };

  if (!level) {
    return (
      <span className={`inline-flex items-center gap-1 rounded-full bg-gray-100 text-gray-600 border border-gray-300 ${sizes[size]}`}>
        <Users size={size === 'sm' ? 12 : size === 'md' ? 16 : 20} />
        {showLabel && 'No Data'}
      </span>
    );
  }

  const color = colors[level];

  return (
    <span className={`inline-flex items-center gap-1 rounded-full ${color.bg} ${color.text} border ${color.border} ${sizes[size]}`}>
      <Users size={size === 'sm' ? 12 : size === 'md' ? 16 : 20} />
      {showLabel && color.label}
    </span>
  );
}
