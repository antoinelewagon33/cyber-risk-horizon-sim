import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Activity, Globe, Clock } from 'lucide-react';
import { Threat, ThreatSeverity } from '@/types/threat';

interface ThreatFeedProps {
  threats: Threat[];
  onThreatSelect?: (threat: Threat) => void;
  selectedThreatId?: string;
}

const getSeverityConfig = (severity: ThreatSeverity) => {
  switch (severity) {
    case 'critique':
      return {
        label: 'Critique',
        bgColor: 'bg-red-500',
        textColor: 'text-white',
      };
    case 'eleve':
      return {
        label: 'Élevé',
        bgColor: 'bg-orange-500',
        textColor: 'text-white',
      };
    case 'moyen':
      return {
        label: 'Moyen',
        bgColor: 'bg-yellow-500',
        textColor: 'text-white',
      };
    case 'faible':
      return {
        label: 'Faible',
        bgColor: 'bg-green-500',
        textColor: 'text-white',
      };
    default:
      return {
        label: 'Inconnu',
        bgColor: 'bg-gray-500',
        textColor: 'text-white',
      };
  }
};

const formatTime = (date: Date) => {
  return date.toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
};

const ThreatFeed: React.FC<ThreatFeedProps> = ({
  threats,
  onThreatSelect,
  selectedThreatId,
}) => {
  return (
    <Card className="glass-morphism border-cyber-blue/30 h-full flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-gray-100">
          <Activity className="h-5 w-5 text-cyber-blue" />
          <span>Flux de Menaces</span>
          <Badge variant="outline" className="ml-auto border-cyber-blue text-cyber-blue">
            {threats.length} actives
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 p-0">
        <ScrollArea className="h-[400px] px-4 pb-4">
          <div className="space-y-3">
            {threats.map((threat) => {
              const severityConfig = getSeverityConfig(threat.severity);
              const isSelected = selectedThreatId === threat.id;

              return (
                <div
                  key={threat.id}
                  onClick={() => onThreatSelect?.(threat)}
                  className={`
                    p-3 rounded-lg border transition-all cursor-pointer
                    ${isSelected 
                      ? 'border-cyber-blue bg-cyber-blue/10' 
                      : 'border-gray-700 bg-black/20 hover:border-gray-600 hover:bg-black/30'
                    }
                  `}
                >
                  {/* Header Row: Type + Severity Badge */}
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-100 font-medium text-sm">
                      {threat.type}
                    </span>
                    <Badge 
                      className={`${severityConfig.bgColor} ${severityConfig.textColor} text-xs px-2 py-0.5`}
                    >
                      {severityConfig.label}
                    </Badge>
                  </div>

                  {/* IP Address - Monospace */}
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-gray-300 font-mono text-sm">
                      {threat.sourceIp}
                    </span>
                  </div>

                  {/* Location Info */}
                  <div className="flex items-center gap-2 mb-2">
                    <Globe className="h-3.5 w-3.5 text-gray-400" />
                    <span className="text-gray-200 text-sm">
                      {threat.sourceLocation.city && `${threat.sourceLocation.city}, `}
                      {threat.sourceLocation.country}
                    </span>
                  </div>

                  {/* Timestamp */}
                  <div className="flex items-center gap-2">
                    <Clock className="h-3.5 w-3.5 text-gray-400" />
                    <span className="text-gray-400 text-xs">
                      {formatTime(threat.timestamp)}
                    </span>
                  </div>
                </div>
              );
            })}

            {threats.length === 0 && (
              <div className="text-center py-8 text-gray-400">
                Aucune menace détectée
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default ThreatFeed;
