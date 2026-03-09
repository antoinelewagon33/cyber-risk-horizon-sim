import React, { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Map as MapIcon } from 'lucide-react';
import { Threat, HoneypotLocation, MOCK_HONEYPOTS, ThreatSeverity } from '@/types/threat';

// Fix Leaflet default marker icon issue
delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: () => string })._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Custom icons
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

const getSeverityColor = (severity: ThreatSeverity): string => {
  switch (severity) {
    case 'critique': return '#ef4444';
    case 'eleve': return '#f97316';
    case 'moyen': return '#eab308';
    case 'faible': return '#22c55e';
    default: return '#6b7280';
  }
};

// Animated polyline component
interface AnimatedAttackLineProps {
  threat: Threat;
  isNew: boolean;
}

const AnimatedAttackLine: React.FC<AnimatedAttackLineProps> = ({ threat, isNew }) => {
  const map = useMap();
  const lineRef = useRef<L.Polyline | null>(null);
  const [isAnimating, setIsAnimating] = useState(isNew);

  const positions: L.LatLngExpression[] = [
    [threat.sourceLocation.lat, threat.sourceLocation.lng],
    [threat.targetLocation.lat, threat.targetLocation.lng],
  ];

  const color = getSeverityColor(threat.severity);

  useEffect(() => {
    if (!isNew || !lineRef.current) return;

    const element = lineRef.current.getElement();
    if (!element) return;

    // Get the path length for animation
    const pathLength = (element as SVGPathElement).getTotalLength?.() || 1000;

    // Set initial state for dash animation
    element.style.strokeDasharray = `${pathLength}`;
    element.style.strokeDashoffset = `${pathLength}`;
    element.style.transition = 'stroke-dashoffset 1.5s ease-in-out';

    // Trigger animation
    requestAnimationFrame(() => {
      element.style.strokeDashoffset = '0';
    });

    // After animation, add pulse effect
    const timer = setTimeout(() => {
      setIsAnimating(false);
      element.style.animation = 'pulse-line 2s ease-in-out infinite';
    }, 1500);

    return () => clearTimeout(timer);
  }, [isNew]);

  return (
    <Polyline
      ref={lineRef}
      positions={positions}
      pathOptions={{
        color,
        weight: 2,
        opacity: isAnimating ? 0.75 : 0.6,
        dashArray: isAnimating ? undefined : '6, 10',
      }}
    />
  );
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

const ThreatMap: React.FC<ThreatMapProps> = ({
  threats,
  honeypots = MOCK_HONEYPOTS,
  selectedThreatId,
  onThreatSelect,
  newThreatIds = new Set(),
}) => {
  const honeypotIcon = createHoneypotIcon();

  return (
    <Card className="glass-morphism border-cyber-blue/30 h-full flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-gray-100">
          <MapIcon className="h-5 w-5 text-cyber-blue" />
          <span>Carte des Menaces</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 p-0 relative">
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
              const isSelected = selectedThreatId === threat.id;

              return (
                <React.Fragment key={threat.id}>
                  {/* Attack line */}
                  <AnimatedAttackLine threat={threat} isNew={isNew} />

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
      </CardContent>
    </Card>
  );
};

export default ThreatMap;
