import { X, Users, AlertCircle } from 'lucide-react';
import { useState } from 'react';
import type { CrowdLevel, Stop } from '../lib/database.types';

interface ReportModalProps {
  stop: Stop;
  routeId: string;
  onClose: () => void;
  onSubmit: (level: CrowdLevel) => Promise<void>;
}

export function ReportModal({ stop, onClose, onSubmit }: ReportModalProps) {
  const [selectedLevel, setSelectedLevel] = useState<CrowdLevel | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const levels: { value: CrowdLevel; label: string; description: string; color: string }[] = [
    {
      value: 'low',
      label: 'Low Crowd',
      description: 'Plenty of seats available',
      color: 'bg-green-500 hover:bg-green-600 border-green-600',
    },
    {
      value: 'medium',
      label: 'Medium Crowd',
      description: 'Some standing passengers',
      color: 'bg-yellow-500 hover:bg-yellow-600 border-yellow-600',
    },
    {
      value: 'high',
      label: 'High Crowd',
      description: 'Very crowded, hard to board',
      color: 'bg-red-500 hover:bg-red-600 border-red-600',
    },
  ];

  const handleSubmit = async () => {
    if (!selectedLevel) return;

    setIsSubmitting(true);
    setError(null);

    try {
      await onSubmit(selectedLevel);
      onClose();
    } catch (err) {
      setError('Failed to submit report. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Report Crowd Level</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="mb-6">
          <p className="text-sm text-gray-600">
            Help fellow commuters by reporting the current crowd level at:
          </p>
          <p className="font-medium text-gray-900 mt-1">{stop.name}</p>
        </div>

        <div className="space-y-3 mb-6">
          {levels.map((level) => (
            <button
              key={level.value}
              onClick={() => setSelectedLevel(level.value)}
              className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                selectedLevel === level.value
                  ? `${level.color} text-white shadow-md`
                  : 'border-gray-200 hover:border-gray-300 bg-white text-gray-900'
              }`}
            >
              <div className="flex items-center gap-3">
                <Users size={24} />
                <div>
                  <div className="font-semibold">{level.label}</div>
                  <div className={`text-sm ${selectedLevel === level.value ? 'text-white text-opacity-90' : 'text-gray-600'}`}>
                    {level.description}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-800 text-sm">
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2 px-4 border-2 border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!selectedLevel || isSubmitting}
            className="flex-1 py-2 px-4 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Report'}
          </button>
        </div>
      </div>
    </div>
  );
}
