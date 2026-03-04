import { MapPin, Clock } from 'lucide-react';
import { CrowdIndicator } from './CrowdIndicator';
import type { Stop, CrowdLevel } from '../lib/database.types';

interface StopItemProps {
  stop: Stop;
  currentCrowdLevel: CrowdLevel | null;
  lastReportedTime: string | null;
  onReportClick: () => void;
}

export function StopItem({ stop, currentCrowdLevel, lastReportedTime, onReportClick }: StopItemProps) {
  const getTimeAgo = (timestamp: string) => {
    const now = new Date();
    const then = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - then.getTime()) / 60000);

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  return (
    <div className="bg-white rounded-lg border-2 border-gray-200 p-4 hover:border-gray-300 transition-colors">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-start gap-2">
          <div className="mt-1">
            <MapPin size={18} className="text-gray-500" />
          </div>
          <div>
            <h4 className="font-medium text-gray-900">{stop.name}</h4>
            <p className="text-xs text-gray-500 mt-0.5">Stop #{stop.sequence_order}</p>
          </div>
        </div>
        <CrowdIndicator level={currentCrowdLevel} size="sm" />
      </div>

      {lastReportedTime && (
        <div className="flex items-center gap-1 text-xs text-gray-500 mb-3">
          <Clock size={12} />
          Updated {getTimeAgo(lastReportedTime)}
        </div>
      )}

      <button
        onClick={onReportClick}
        className="w-full py-2 px-3 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
      >
        Report Current Crowd Level
      </button>
    </div>
  );
}
