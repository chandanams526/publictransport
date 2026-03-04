export type CrowdLevel = 'low' | 'medium' | 'high';
export type TransportType = 'bus' | 'train' | 'metro';

export interface Route {
  id: string;
  name: string;
  type: TransportType;
  description: string;
  created_at: string;
}

export interface Stop {
  id: string;
  route_id: string;
  name: string;
  sequence_order: number;
  latitude: number;
  longitude: number;
  created_at: string;
}

export interface CrowdReport {
  id: string;
  route_id: string;
  stop_id: string;
  crowd_level: CrowdLevel;
  reported_at: string;
  created_at: string;
}

export interface Database {
  public: {
    Tables: {
      routes: {
        Row: Route;
        Insert: Omit<Route, 'id' | 'created_at'>;
        Update: Partial<Omit<Route, 'id' | 'created_at'>>;
      };
      stops: {
        Row: Stop;
        Insert: Omit<Stop, 'id' | 'created_at'>;
        Update: Partial<Omit<Stop, 'id' | 'created_at'>>;
      };
      crowd_reports: {
        Row: CrowdReport;
        Insert: Omit<CrowdReport, 'id' | 'created_at'> & {
          reported_at?: string;
        };
        Update: Partial<Omit<CrowdReport, 'id' | 'created_at'>>;
      };
    };
  };
}
