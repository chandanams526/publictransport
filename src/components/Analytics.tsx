import { BarChart3, TrendingUp, Clock } from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Route } from '../lib/database.types';

interface PeakTime {
  hour: number;
  avgCrowdLevel: number;
  totalReports: number;
}

interface AnalyticsProps {
  route: Route;
  onBack: () => void;
}

export function Analytics({ route, onBack }: AnalyticsProps) {
  const [peakTimes, setPeakTimes] = useState<PeakTime[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, [route.id]);

  const loadAnalytics = async () => {
    try {
      const { data: reports } = await supabase
        .from('crowd_reports')
        .select('crowd_level, reported_at')
        .eq('route_id', route.id)
        .order('reported_at', { ascending: false })
        .limit(1000);

      if (reports) {
        const hourlyData: { [key: number]: { total: number; count: number } } = {};

        reports.forEach((report) => {
          const hour = new Date(report.reported_at).getHours();
          const levelValue = report.crowd_level === 'low' ? 1 : report.crowd_level === 'medium' ? 2 : 3;

          if (!hourlyData[hour]) {
            hourlyData[hour] = { total: 0, count: 0 };
          }

          hourlyData[hour].total += levelValue;
          hourlyData[hour].count += 1;
        });

        const peaks = Object.entries(hourlyData)
          .map(([hour, data]) => ({
            hour: parseInt(hour),
            avgCrowdLevel: data.total / data.count,
            totalReports: data.count,
          }))
          .sort((a, b) => a.hour - b.hour);

        setPeakTimes(peaks);
      }
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatHour = (hour: number) => {
    if (hour === 0) return '12 AM';
    if (hour < 12) return `${hour} AM`;
    if (hour === 12) return '12 PM';
    return `${hour - 12} PM`;
  };

  const getCrowdLevelLabel = (avg: number) => {
    if (avg < 1.5) return 'Low';
    if (avg < 2.5) return 'Medium';
    return 'High';
  };

  const getCrowdColor = (avg: number) => {
    if (avg < 1.5) return 'bg-green-500';
    if (avg < 2.5) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const maxHeight = peakTimes.length > 0 ? Math.max(...peakTimes.map(p => p.avgCrowdLevel)) : 3;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-4xl mx-auto p-4">
        <div className="mb-6">
          <button
            onClick={onBack}
            className="text-gray-600 hover:text-gray-900 font-medium mb-4 flex items-center gap-2"
          >
            ← Back to Route
          </button>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center gap-3 mb-2">
              <BarChart3 size={28} className="text-gray-900" />
              <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
            </div>
            <p className="text-gray-600">{route.name}</p>
          </div>
        </div>

        {loading ? (
          <div className="bg-white rounded-xl p-12 text-center shadow-sm border border-gray-200">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-200 border-t-gray-900"></div>
            <p className="text-gray-600 mt-4">Loading analytics...</p>
          </div>
        ) : peakTimes.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center shadow-sm border border-gray-200">
            <TrendingUp size={48} className="text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No data available yet. Start reporting crowd levels!</p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Clock size={20} />
                Peak Crowd Times by Hour
              </h2>
              <div className="space-y-3">
                {peakTimes.map((peak) => (
                  <div key={peak.hour} className="flex items-center gap-4">
                    <div className="w-20 text-sm font-medium text-gray-700">
                      {formatHour(peak.hour)}
                    </div>
                    <div className="flex-1">
                      <div className="bg-gray-100 rounded-full h-8 overflow-hidden">
                        <div
                          className={`h-full ${getCrowdColor(peak.avgCrowdLevel)} transition-all flex items-center justify-end pr-3`}
                          style={{ width: `${(peak.avgCrowdLevel / maxHeight) * 100}%` }}
                        >
                          <span className="text-xs font-medium text-white">
                            {getCrowdLevelLabel(peak.avgCrowdLevel)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="w-24 text-xs text-gray-500 text-right">
                      {peak.totalReports} {peak.totalReports === 1 ? 'report' : 'reports'}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Insights</h2>
              <div className="space-y-2 text-sm text-gray-700">
                <p>
                  • Based on {peakTimes.reduce((sum, p) => sum + p.totalReports, 0)} crowd reports
                </p>
                <p>
                  • Busiest time: {formatHour(peakTimes.reduce((max, p) => p.avgCrowdLevel > max.avgCrowdLevel ? p : max).hour)}
                </p>
                <p>
                  • Quietest time: {formatHour(peakTimes.reduce((min, p) => p.avgCrowdLevel < min.avgCrowdLevel ? p : min).hour)}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
