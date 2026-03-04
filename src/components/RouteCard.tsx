import { Bus, Brain as Train, TrainTrack, ChevronRight } from 'lucide-react';
import type { Route } from '../lib/database.types';

interface RouteCardProps {
  route: Route;
  onClick: () => void;
}

export function RouteCard({ route, onClick }: RouteCardProps) {
  const icons = {
    bus: Bus,
    train: Train,
    metro: TrainTrack,
  };

  const Icon = icons[route.type];

  const colors = {
    bus: 'bg-blue-50 text-blue-700 border-blue-200',
    train: 'bg-purple-50 text-purple-700 border-purple-200',
    metro: 'bg-teal-50 text-teal-700 border-teal-200',
  };

  return (
    <button
      onClick={onClick}
      className={`w-full p-4 rounded-lg border-2 ${colors[route.type]} hover:shadow-md transition-all text-left`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white rounded-lg shadow-sm">
            <Icon size={24} />
          </div>
          <div>
            <h3 className="font-semibold text-lg">{route.name}</h3>
            {route.description && (
              <p className="text-sm opacity-75 mt-0.5">{route.description}</p>
            )}
          </div>
        </div>
        <ChevronRight size={20} className="opacity-50" />
      </div>
    </button>
  );
}
