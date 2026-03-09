import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Map as MapIcon, Loader2 } from 'lucide-react';
import { Threat, HoneypotLocation, MOCK_HONEYPOTS, ThreatSeverity } from '@/types/threat';

const getSeverityColor = (severity: ThreatSeverity): string => {
  switch (severity) {
    case 'critique': return '#ef4444';
    case 'eleve': return '#f97316';
    case 'moyen': return '#eab308';
    case 'faible': return '#22c55e';
    default: return '#6b7280';
  }
};

// Map Legend Component
const MapLegend: React.FC = () => {
  return (
    <div 
      className="absolute bottom-4 left-4 z-[1000] p-3 rounded-lg"
      style={{
        background: 'rgba(10, 10, 15, 0.9)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
      }}
    >
      <div className="text-gray-100 text-xs font-semibold mb-2">Légende</div>
      <div className="space-y-2">
        {/* Honeypots */}
        <div className="flex items-center gap-2">
          <div 
            className="w-4 h-4 rounded-full"
            style={{ 
              background: '#00f5ff',
              boxShadow: '0 0 6px #00f5ff',
            }}
          />
          <span className="text-gray-200 text-xs">Honeypots</span>
        </div>
        
        {/* Attack Sources by severity */}
        <div className="flex items-center gap-2">
          <div 
            className="w-3 h-3 rounded-full"
            style={{ background: '#ef4444' }}
          />
          <span className="text-gray-200 text-xs">Critique</span>
        </div>
        <div className="flex items-center gap-2">
          <div 
            className="w-3 h-3 rounded-full"
            style={{ background: '#f97316' }}
          />
          <span className="text-gray-200 text-xs">Élevé</span>
        </div>
        <div className="flex items-center gap-2">
          <div 
            className="w-3 h-3 rounded-full"
            style={{ background: '#eab308' }}
          />
          <span className="text-gray-200 text-xs">Moyen</span>
        </div>
        <div className="flex items-center gap-2">
          <div 
            className="w-3 h-3 rounded-full"
            style={{ background: '#22c55e' }}
          />
          <span className="text-gray-200 text-xs">Faible</span>
        </div>

        {/* Attribution */}
        <div className="pt-1 mt-1 border-t border-gray-700">
          <span className="text-gray-400 text-[10px]">OpenStreetMap</span>
        </div>
      </div>
    </div>
  );
};

interface ThreatMapProps {
  threats: Threat[];
  honeypots?: HoneypotLocation[];
  selectedThreatId?: string;
  onThreatSelect?: (threat: Threat) => void;
  newThreatIds?: Set<string>;
}

// Inner map component that will be rendered only on client
const ThreatMapInner: React.FC<ThreatMapProps & { L: typeof import('leaflet') }> = ({
  threats,
  honeypots = MOCK_HONEYPOTS,
  selectedThreatId,
  onThreatSelect,
  newThreatIds = new Set(),
  L,
}) => {
  const [ReactLeaflet, setReactLeaflet] = useState<typeof import('react-leaflet') | null>(null);

  useEffect(() => {
    import('react-leaflet').then((module) => {
      setReactLeaflet(module);
    });
  }, []);

  if (!ReactLeaflet) {
    return (
      <div className="h-[400px] flex items-center justify-center bg-gray-900/50 rounded-b-lg">
        <Loader2 className="h-8 w-8 animate-spin text-cyber-blue" />
      </div>
    );
  }

  const { MapContainer, TileLayer, Marker, Polyline, Popup } = ReactLeaflet;

  const createHoneypotIcon = () => {
    return L.divIcon({
      className: 'honeypot-marker',
      html: `
        <div style="
          width: 24px;
          height: 24px;
          background: #00f5ff;
          border: 3px solid #0a0a0f;
          border-radius: 50%;
          box-shadow: 0 0 10px #00f5ff;
        "></div>
      `,
      iconSize: [24, 24],
      iconAnchor: [12, 12],
    });
  };

  const createAttackerIcon = (severity: ThreatSeverity) => {
    const colors = {
      critique: '#ef4444',
      eleve: '#f97316',
      moyen: '#eab308',
      faible: '#22c55e',
    };
    const color = colors[severity];
    
    return L.divIcon({
      className: 'attacker-marker',
      html: `
        <div style="
          width: 16px;
          height: 16px;
          background: ${color};
          border: 2px solid #0a0a0f;
          border-radius: 50%;
          box-shadow: 0 0 8px ${color};
        "></div>
      `,
      iconSize: [16, 16],
      iconAnchor: [8, 8],
    });
  };

  const honeypotIcon = createHoneypotIcon();

  return (
    <div className="h-[400px] rounded-b-lg overflow-hidden relative">
      <MapContainer
        center={[30, 0]}
        zoom={2}
        style={{ height: '100%', width: '100%', background: '#0a0a0f' }}
        zoomControl={false}
        attributionControl={false}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />

        {/* Honeypot markers */}
        {honeypots.map((honeypot) => (
          <Marker
            key={honeypot.id}
            position={[honeypot.lat, honeypot.lng]}
            icon={honeypotIcon}
          >
            <Popup>
              <div className="text-sm">
                <strong>{honeypot.name}</strong>
                <br />
                {honeypot.country}
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Attack source markers and animated lines */}
        {threats.map((threat) => {
          const attackerIcon = createAttackerIcon(threat.severity);
          const isNew = newThreatIds.has(threat.id);
          const color = getSeverityColor(threat.severity);

          const positions: [number, number][] = [
            [threat.sourceLocation.lat, threat.sourceLocation.lng],
            [threat.targetLocation.lat, threat.targetLocation.lng],
          ];

          return (
            <React.Fragment key={threat.id}>
              {/* Attack line with animation via CSS */}
              <Polyline
                positions={positions}
                pathOptions={{
                  color,
                  weight: 2,
                  opacity: 0.6,
                  dashArray: '6, 10',
                  className: isNew ? 'animate-attack-line' : 'pulse-attack-line',
                }}
              />

              {/* Attacker marker */}
              <Marker
                position={[threat.sourceLocation.lat, threat.sourceLocation.lng]}
                icon={attackerIcon}
                eventHandlers={{
                  click: () => onThreatSelect?.(threat),
                }}
              >
                <Popup>
                  <div className="text-sm">
                    <strong>{threat.type}</strong>
                    <br />
                    IP: <code>{threat.sourceIp}</code>
                    <br />
                    {threat.sourceLocation.city && `${threat.sourceLocation.city}, `}
                    {threat.sourceLocation.country}
                  </div>
                </Popup>
              </Marker>
            </React.Fragment>
          );
        })}
      </MapContainer>

      {/* Legend overlay */}
      <MapLegend />
    </div>
  );
};

const ThreatMap: React.FC<ThreatMapProps> = (props) => {
  const [leaflet, setLeaflet] = useState<typeof import('leaflet') | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    // Dynamically import Leaflet and its CSS
    Promise.all([
      import('leaflet'),
      import('leaflet/dist/leaflet.css'),
    ]).then(([L]) => {
      // Fix Leaflet default marker icon issue
      delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: () => string })._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
      });
      setLeaflet(L);
    });
  }, []);

  return (
    <Card className="glass-morphism border-cyber-blue/30 h-full flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-gray-100">
          <MapIcon className="h-5 w-5 text-cyber-blue" />
          <span>Carte des Menaces</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 p-0 relative">
        {!isClient || !leaflet ? (
          <div className="h-[400px] flex items-center justify-center bg-gray-900/50 rounded-b-lg">
            <Loader2 className="h-8 w-8 animate-spin text-cyber-blue" />
          </div>
        ) : (
          <ThreatMapInner {...props} L={leaflet} />
        )}
      </CardContent>
    </Card>
  );
};

export default ThreatMap;
