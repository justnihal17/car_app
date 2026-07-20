import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  Play,
  Pause,
  RotateCcw,
  Layers
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Polyline, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface OrderMapProps {
  order: {
    id: string;
    customer: {
      name: string;
    };
    driver?: {
      name: string;
      vehicle: string;
    };
    location: {
      address: string;
    };
    status: string;
    eta: string;
  };
}

// Create custom icons
const createAgentIcon = () => new L.DivIcon({
  className: 'custom-agent-icon',
  html: `<div style="width: 32px; height: 32px; background: #10b981; border: 2px solid white; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);">
           <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1 .4-1 1v7c0 .6.4 1 1 1h1M14 17h2"/><circle cx="7.5" cy="17.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/></svg>
         </div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

const createDestIcon = () => new L.DivIcon({
  className: 'custom-dest-icon',
  html: `<div style="width: 24px; height: 24px; background: #ef4444; border: 2px solid white; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);">
           <div style="width: 8px; height: 8px; background: white; border-radius: 50%;"></div>
         </div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

const createDepotIcon = () => new L.DivIcon({
  className: 'custom-depot-icon',
  html: `<div style="width: 24px; height: 24px; background: #3b82f6; border: 2px solid white; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);">
           <div style="width: 8px; height: 8px; background: white; border-radius: 50%;"></div>
         </div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

// Component to handle map view updates
const MapUpdater = ({ center, zoom }: { center: [number, number], zoom: number }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
};

export function OrderMap({ order }: OrderMapProps) {
  const [mapStyle, setMapStyle] = useState<'street' | 'satellite' | 'terrain'>('street');
  const [isSimulating, setIsSimulating] = useState(true);
  const [progress, setProgress] = useState(0.4); 
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFeedback, setSearchFeedback] = useState('');

  const animationRef = useRef<number | null>(null);

  // Dubai Marina Coordinates
  const routePoints: [number, number][] = [
    [25.0735, 55.1390], // Depot / Start
    [25.0768, 55.1430], 
    [25.0792, 55.1459],
    [25.0815, 55.1481],
    [25.0847, 55.1492],
    [25.0863, 55.1462], // Destination (Marina Gate)
  ];

  const mapCenter: [number, number] = [25.080, 55.144];

  useEffect(() => {
    if (isSimulating) {
      let lastTime = performance.now();
      const animate = (time: number) => {
        const delta = (time - lastTime) / 1000;
        lastTime = time;
        setProgress((prev) => {
          let next = prev + delta * 0.03; 
          if (next > 1) {
            next = 0; 
          }
          return next;
        });
        animationRef.current = requestAnimationFrame(animate);
      };
      animationRef.current = requestAnimationFrame(animate);
    } else {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isSimulating]);

  const getPositionOnRoute = (p: number): [number, number] => {
    if (p <= 0) return routePoints[0];
    if (p >= 1) return routePoints[routePoints.length - 1];

    const segmentCount = routePoints.length - 1;
    const segmentIndex = Math.min(Math.floor(p * segmentCount), segmentCount - 1);
    const segmentProgress = (p * segmentCount) - segmentIndex;

    const start = routePoints[segmentIndex];
    const end = routePoints[segmentIndex + 1];

    return [
      start[0] + (end[0] - start[0]) * segmentProgress,
      start[1] + (end[1] - start[1]) * segmentProgress
    ];
  };

  const agentPos = getPositionOnRoute(progress);
  const destPos = routePoints[routePoints.length - 1];
  const originPos = routePoints[0];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setSearchFeedback('Searching coordinates...');
    setTimeout(() => {
      setSearchFeedback(`Located: "${searchQuery}" in Dubai Marina Zone`);
      setTimeout(() => setSearchFeedback(''), 4000);
    }, 1500);
  };

  // Map Tile Providers
  const tileProviders = {
    street: "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
    satellite: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    terrain: "https://stamen-tiles.a.ssl.fastly.net/terrain/{z}/{x}/{y}.jpg"
  };

  return (
    <div id="real-live-map-wrapper" className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col relative h-[440px]">
      
      {/* Top Map Bar Controls */}
      <div className="absolute top-3 left-3 right-3 z-[1000] flex flex-col sm:flex-row sm:items-center justify-between gap-2 pointer-events-none">
        
        {/* Real-time Address and Search bar */}
        <form onSubmit={handleSearch} className="flex items-center gap-1.5 bg-white/95 backdrop-blur-md border border-slate-200 rounded-lg p-1.5 shadow-lg w-full max-w-sm pointer-events-auto">
          <div className="pl-2 text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input 
            type="text" 
            placeholder="Search address or enter GPS coordinates..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 text-xs bg-transparent outline-none border-none text-slate-800 placeholder-slate-400 font-medium py-1"
          />
          <button type="submit" className="bg-red-600 hover:bg-red-700 text-white font-bold text-[10px] px-2.5 py-1 rounded-md transition-all shadow-sm">
            Search
          </button>
        </form>

        {/* Live Simulation Widget */}
        <div className="flex items-center gap-2 bg-white/95 backdrop-blur-md border border-slate-200 rounded-lg p-1.5 shadow-lg pointer-events-auto text-xs self-end sm:self-auto">
          <span className="font-bold text-slate-700 flex items-center gap-1.5 px-1">
            <span className={`w-2 h-2 rounded-full ${isSimulating ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400'}`}></span>
            Live Route Simulation
          </span>
          <div className="flex items-center border-l border-slate-200 pl-1.5 gap-1">
            <button 
              onClick={() => setIsSimulating(!isSimulating)}
              title={isSimulating ? 'Pause movement' : 'Play movement'}
              className="p-1 rounded hover:bg-slate-100 text-slate-600 transition-colors"
            >
              {isSimulating ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            </button>
            <button 
              onClick={() => setProgress(0)}
              title="Reset location"
              className="p-1 rounded hover:bg-slate-100 text-slate-600 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Floating status and search feedback */}
      {searchFeedback && (
        <div className="absolute top-16 left-3 z-[1000] bg-slate-900/90 text-white text-[10px] px-2.5 py-1.5 rounded-lg border border-slate-700 shadow-md animate-fade-in">
          {searchFeedback}
        </div>
      )}

      {/* Right Map Layer Controls */}
      <div className="absolute top-16 right-3 z-[1000] flex flex-col gap-2 pointer-events-auto">
        <div className="bg-white/95 backdrop-blur-md border border-slate-200 rounded-lg p-1 shadow-lg flex flex-col gap-1">
          <button 
            onClick={() => setMapStyle('street')}
            className={`px-2 py-1 text-[9px] font-bold rounded-md transition-all ${mapStyle === 'street' ? 'bg-red-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            MAP
          </button>
          <button 
            onClick={() => setMapStyle('satellite')}
            className={`px-2 py-1 text-[9px] font-bold rounded-md transition-all ${mapStyle === 'satellite' ? 'bg-red-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            SATELLITE
          </button>
        </div>
      </div>

      {/* Main React Leaflet Map Canvas */}
      <div className="flex-1 w-full h-full relative z-0">
        <MapContainer 
          center={mapCenter} 
          zoom={14} 
          style={{ width: '100%', height: '100%' }}
          zoomControl={false}
          attributionControl={false}
        >
          <TileLayer
            url={tileProviders[mapStyle === 'terrain' ? 'street' : mapStyle]} 
          />
          
          <MapUpdater center={mapCenter} zoom={14} />

          {/* Route Line */}
          <Polyline 
            positions={routePoints} 
            color="#3b82f6" 
            weight={5} 
            opacity={0.8}
            dashArray="10, 10"
          />

          {/* Origin Marker */}
          <Marker position={originPos} icon={createDepotIcon()}>
            <Popup>
              <div className="font-bold text-sm">Stylein Depot</div>
              <div className="text-xs text-gray-500">Starting Point</div>
            </Popup>
          </Marker>

          {/* Destination Marker */}
          <Marker position={destPos} icon={createDestIcon()}>
            <Popup>
              <div className="font-bold text-sm">{order.customer.name}</div>
              <div className="text-xs text-gray-500">{order.location.address}</div>
            </Popup>
          </Marker>

          {/* Agent Vehicle Marker */}
          <Marker position={agentPos} icon={createAgentIcon()}>
            <Popup>
              <div className="font-bold text-sm text-emerald-600">Active Agent</div>
              <div className="text-xs font-semibold">ETA: {order.eta}</div>
            </Popup>
          </Marker>
        </MapContainer>
      </div>

      {/* Bottom info bar */}
      <div className="bg-slate-50 border-t border-slate-200 px-3 py-1.5 flex items-center justify-between text-[9px] text-slate-400 font-medium relative z-[1000]">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-slate-500 tracking-tight">Leaflet Maps</span>
          <span>Map data © OpenStreetMap contributors</span>
        </div>
      </div>
    </div>
  );
}
