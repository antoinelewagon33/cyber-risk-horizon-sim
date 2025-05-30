
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, Database, Mail, Zap, Lock, Users } from 'lucide-react';

const scenarios = [
  {
    id: 'ransomware',
    name: 'Ransomware Attack',
    description: 'Malicious software encrypts critical systems and demands payment',
    icon: Lock,
    color: 'cyber-red',
    impact: 'High'
  },
  {
    id: 'data-breach',
    name: 'Data Breach',
    description: 'Unauthorized access to sensitive customer or business data',
    icon: Database,
    color: 'cyber-purple',
    impact: 'Critical'
  },
  {
    id: 'phishing',
    name: 'Phishing Campaign',
    description: 'Social engineering attack targeting employee credentials',
    icon: Mail,
    color: 'cyber-blue',
    impact: 'Medium'
  },
  {
    id: 'ddos',
    name: 'DDoS Attack',
    description: 'Distributed denial of service overwhelming network infrastructure',
    icon: Zap,
    color: 'cyber-green',
    impact: 'Medium'
  },
  {
    id: 'insider-threat',
    name: 'Insider Threat',
    description: 'Malicious or negligent actions by internal personnel',
    icon: Users,
    color: 'cyber-purple',
    impact: 'High'
  },
  {
    id: 'supply-chain',
    name: 'Supply Chain Attack',
    description: 'Compromise through third-party vendors or software',
    icon: Shield,
    color: 'cyber-red',
    impact: 'Critical'
  }
];

interface ScenarioSelectorProps {
  onScenarioSelect: (scenario: string) => void;
}

const ScenarioSelector: React.FC<ScenarioSelectorProps> = ({ onScenarioSelect }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {scenarios.map((scenario) => {
        const IconComponent = scenario.icon;
        return (
          <Card
            key={scenario.id}
            className="glass-morphism border-gray-700 hover:border-cyan-500/50 transition-all duration-300 hover:scale-105 cursor-pointer group"
            onClick={() => onScenarioSelect(scenario.id)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <IconComponent 
                  className={`h-6 w-6 text-${scenario.color} group-hover:animate-pulse`} 
                />
                <span className={`text-xs px-2 py-1 rounded bg-${scenario.color}/20 text-${scenario.color}`}>
                  {scenario.impact}
                </span>
              </div>
              <CardTitle className="text-lg text-white group-hover:text-cyber-blue transition-colors">
                {scenario.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-gray-400 text-sm mb-4">
                {scenario.description}
              </CardDescription>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full border-cyber-blue text-cyber-blue hover:bg-cyber-blue/10"
              >
                Select Scenario
              </Button>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default ScenarioSelector;
