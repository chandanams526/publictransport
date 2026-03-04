/*
  # Public Transport Crowd Indicator System

  1. New Tables
    - `routes`
      - `id` (uuid, primary key) - Unique identifier for each route
      - `name` (text) - Route name/number (e.g., "Bus 42", "Metro Red Line")
      - `type` (text) - Transport type (bus, train, metro)
      - `description` (text) - Additional route information
      - `created_at` (timestamptz) - Record creation timestamp
    
    - `stops`
      - `id` (uuid, primary key) - Unique identifier for each stop
      - `route_id` (uuid, foreign key) - Reference to routes table
      - `name` (text) - Stop name (e.g., "Central Station", "Main Street")
      - `sequence_order` (integer) - Order of stop in route
      - `latitude` (numeric) - Geographic latitude
      - `longitude` (numeric) - Geographic longitude
      - `created_at` (timestamptz) - Record creation timestamp
    
    - `crowd_reports`
      - `id` (uuid, primary key) - Unique identifier for each report
      - `route_id` (uuid, foreign key) - Reference to routes table
      - `stop_id` (uuid, foreign key) - Reference to stops table
      - `crowd_level` (text) - Crowd level (low, medium, high)
      - `reported_at` (timestamptz) - When the crowd level was observed
      - `created_at` (timestamptz) - Record creation timestamp

  2. Security
    - Enable RLS on all tables
    - Add policies for public read access (commuters can view all data)
    - Add policies for public write access to crowd_reports (anyone can submit reports)
    - Routes and stops are read-only for the public (managed by admins)

  3. Indexes
    - Index on route_id for stops table (faster stop lookups by route)
    - Index on stop_id and reported_at for crowd_reports (faster recent report queries)
    - Index on route_id and reported_at for crowd_reports (analytics queries)
*/

-- Create routes table
CREATE TABLE IF NOT EXISTS routes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  type text NOT NULL CHECK (type IN ('bus', 'train', 'metro')),
  description text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

-- Create stops table
CREATE TABLE IF NOT EXISTS stops (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  route_id uuid NOT NULL REFERENCES routes(id) ON DELETE CASCADE,
  name text NOT NULL,
  sequence_order integer NOT NULL,
  latitude numeric(10, 8) NOT NULL,
  longitude numeric(11, 8) NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create crowd_reports table
CREATE TABLE IF NOT EXISTS crowd_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  route_id uuid NOT NULL REFERENCES routes(id) ON DELETE CASCADE,
  stop_id uuid NOT NULL REFERENCES stops(id) ON DELETE CASCADE,
  crowd_level text NOT NULL CHECK (crowd_level IN ('low', 'medium', 'high')),
  reported_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_stops_route_id ON stops(route_id);
CREATE INDEX IF NOT EXISTS idx_crowd_reports_stop_id_reported_at ON crowd_reports(stop_id, reported_at DESC);
CREATE INDEX IF NOT EXISTS idx_crowd_reports_route_id_reported_at ON crowd_reports(route_id, reported_at DESC);

-- Enable Row Level Security
ALTER TABLE routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE stops ENABLE ROW LEVEL SECURITY;
ALTER TABLE crowd_reports ENABLE ROW LEVEL SECURITY;

-- Policies for routes (public read)
CREATE POLICY "Anyone can view routes"
  ON routes FOR SELECT
  TO anon
  USING (true);

-- Policies for stops (public read)
CREATE POLICY "Anyone can view stops"
  ON stops FOR SELECT
  TO anon
  USING (true);

-- Policies for crowd_reports (public read and insert)
CREATE POLICY "Anyone can view crowd reports"
  ON crowd_reports FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Anyone can submit crowd reports"
  ON crowd_reports FOR INSERT
  TO anon
  WITH CHECK (true);