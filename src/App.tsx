import { useEffect, useState } from 'react';
import { Bus, MapPin, BarChart3, Radio } from 'lucide-react';
import { supabase } from './lib/supabase';
import { RouteCard } from './components/RouteCard';
import { StopItem } from './components/StopItem';
import { ReportModal } from './components/ReportModal';
import { Analytics } from './components/Analytics';
import type { Route, Stop, CrowdReport, CrowdLevel } from './lib/database.types';

type View = 'routes' | 'route-detail' | 'analytics';

function App() {
  const [view, setView] = useState<View>('routes');
  const [routes, setRoutes] = useState<Route[]>([]);
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);
  const [stops, setStops] = useState<Stop[]>([]);
  const [crowdReports, setCrowdReports] = useState<CrowdReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [selectedStop, setSelectedStop] = useState<Stop | null>(null);

  useEffect(() => {
    loadRoutes();
  }, []);

  useEffect(() => {
    if (selectedRoute) {
      loadStops(selectedRoute.id);
      loadCrowdReports(selectedRoute.id);
      subscribeToReports(selectedRoute.id);
    }
  }, [selectedRoute]);

  const loadRoutes = async () => {
    try {
      const { data, error } = await supabase
        .from('routes')
        .select('*')
        .order('name');

      if (error) throw error;
      setRoutes(data || []);
    } catch (error) {
      console.error('Error loading routes:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStops = async (routeId: string) => {
    try {
      const { data, error } = await supabase
        .from('stops')
        .select('*')
        .eq('route_id', routeId)
        .order('sequence_order');

      if (error) throw error;
      setStops(data || []);
    } catch (error) {
      console.error('Error loading stops:', error);
    }
  };

  const loadCrowdReports = async (routeId: string) => {
    try {
      const { data, error } = await supabase
        .from('crowd_reports')
        .select('*')
        .eq('route_id', routeId)
        .order('reported_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      setCrowdReports(data || []);
    } catch (error) {
      console.error('Error loading crowd reports:', error);
    }
  };

  const subscribeToReports = (routeId: string) => {
    const channel = supabase
      .channel('crowd-reports')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'crowd_reports',
          filter: `route_id=eq.${routeId}`,
        },
        (payload) => {
          setCrowdReports((prev) => [payload.new as CrowdReport, ...prev]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const handleSubmitReport = async (level: CrowdLevel) => {
    if (!selectedStop || !selectedRoute) return;

    const { error } = await supabase.from('crowd_reports').insert({
      route_id: selectedRoute.id,
      stop_id: selectedStop.id,
      crowd_level: level,
    });

    if (error) {
      throw error;
    }
  };

  const getLatestCrowdLevel = (stopId: string): CrowdLevel | null => {
    const report = crowdReports
      .filter((r) => r.stop_id === stopId)
      .sort((a, b) => new Date(b.reported_at).getTime() - new Date(a.reported_at).getTime())[0];

    return report?.crowd_level || null;
  };

  const getLastReportedTime = (stopId: string): string | null => {
    const report = crowdReports
      .filter((r) => r.stop_id === stopId)
      .sort((a, b) => new Date(b.reported_at).getTime() - new Date(a.reported_at).getTime())[0];

    return report?.reported_at || null;
  };

  const handleRouteClick = (route: Route) => {
    setSelectedRoute(route);
    setView('route-detail');
  };

  const handleBackToRoutes = () => {
    setSelectedRoute(null);
    setStops([]);
    setCrowdReports([]);
    setView('routes');
  };

  const handleOpenAnalytics = () => {
    setView('analytics');
  };

  const handleBackFromAnalytics = () => {
    setView('route-detail');
  };

  if (view === 'analytics' && selectedRoute) {
    return <Analytics route={selectedRoute} onBack={handleBackFromAnalytics} />;
  }

  if (view === 'route-detail' && selectedRoute) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="max-w-4xl mx-auto p-4">
          <div className="mb-6">
            <button
              onClick={handleBackToRoutes}
              className="text-gray-600 hover:text-gray-900 font-medium mb-4 flex items-center gap-2"
            >
              ← Back to Routes
            </button>
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 mb-1">{selectedRoute.name}</h1>
                  <p className="text-gray-600">{selectedRoute.description}</p>
                  <div className="flex items-center gap-2 mt-3">
                    <Radio size={16} className="text-green-500 animate-pulse" />
                    <span className="text-sm text-green-700 font-medium">Live Updates Active</span>
                  </div>
                </div>
                <button
                  onClick={handleOpenAnalytics}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
                >
                  <BarChart3 size={18} />
                  Analytics
                </button>
              </div>
            </div>
          </div>

          {stops.length === 0 ? (
            <div className="bg-white rounded-xl p-12 text-center shadow-sm border border-gray-200">
              <MapPin size={48} className="text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No stops found for this route.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {stops.map((stop) => (
                <StopItem
                  key={stop.id}
                  stop={stop}
                  currentCrowdLevel={getLatestCrowdLevel(stop.id)}
                  lastReportedTime={getLastReportedTime(stop.id)}
                  onReportClick={() => {
                    setSelectedStop(stop);
                    setReportModalOpen(true);
                  }}
                />
              ))}
            </div>
          )}

          {reportModalOpen && selectedStop && (
            <ReportModal
              stop={selectedStop}
              routeId={selectedRoute.id}
              onClose={() => {
                setReportModalOpen(false);
                setSelectedStop(null);
              }}
              onSubmit={handleSubmitReport}
            />
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-4xl mx-auto p-4">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Bus size={32} className="text-gray-900" />
            <h1 className="text-3xl font-bold text-gray-900">Public Transport Crowd Indicator</h1>
          </div>
          <p className="text-gray-600">Real-time crowd levels to help you plan your journey</p>
        </div>

        {loading ? (
          <div className="bg-white rounded-xl p-12 text-center shadow-sm border border-gray-200">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-200 border-t-gray-900"></div>
            <p className="text-gray-600 mt-4">Loading routes...</p>
          </div>
        ) : routes.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center shadow-sm border border-gray-200">
            <Bus size={48} className="text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-2">No routes available yet.</p>
            <p className="text-sm text-gray-500">Routes will appear here once added.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {routes.map((route) => (
              <RouteCard key={route.id} route={route} onClick={() => handleRouteClick(route)} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
