
import React, { useState } from 'react';
import { Shield, AlertTriangle, Activity, Target } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import ScenarioSelector from '@/components/ScenarioSelector';
import SimulationForm from '@/components/SimulationForm';
import ResultsDisplay from '@/components/ResultsDisplay';
import SimulationHistory from '@/components/SimulationHistory';
import { Simulation, SimulationResult } from '@/types/simulation';

const Index = () => {
  const [currentStep, setCurrentStep] = useState<'select' | 'form' | 'results' | 'history'>('select');
  const [selectedScenario, setSelectedScenario] = useState<string>('');
  const [simulationResult, setSimulationResult] = useState<SimulationResult | null>(null);

  const handleScenarioSelect = (scenario: string) => {
    setSelectedScenario(scenario);
    setCurrentStep('form');
  };

  const handleSimulationComplete = (result: SimulationResult) => {
    setSimulationResult(result);
    setCurrentStep('results');
  };

  const handleNewSimulation = () => {
    setCurrentStep('select');
    setSelectedScenario('');
    setSimulationResult(null);
  };

  return (
    <div className="min-h-screen bg-cyber-gradient cyber-grid">
      {/* Header */}
      <header className="border-b border-cyan-500/20 bg-black/20 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Shield className="h-8 w-8 text-cyber-blue animate-glow" />
              <h1 className="text-2xl font-bold neon-text">CyberRisk Simulator</h1>
            </div>
            <div className="flex space-x-4">
              <Button
                variant="outline"
                onClick={() => setCurrentStep('history')}
                className="border-cyber-blue text-cyber-blue hover:bg-cyber-blue/10"
              >
                <Activity className="h-4 w-4 mr-2" />
                History
              </Button>
              <Button
                onClick={handleNewSimulation}
                className="bg-cyber-blue hover:bg-cyber-blue/80 text-black font-semibold"
              >
                <Target className="h-4 w-4 mr-2" />
                New Simulation
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {currentStep === 'select' && (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-4xl font-bold mb-4">
                Cyber Risk <span className="neon-text">Assessment</span>
              </h2>
              <p className="text-gray-300 max-w-2xl mx-auto">
                Simulate various cyber attack scenarios and assess their potential business impact.
                Select a threat scenario to begin your risk assessment.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="glass-morphism border-cyber-blue/30 hover:border-cyber-blue/60 transition-all duration-300">
                <CardHeader>
                  <CardTitle className="flex items-center text-cyber-blue">
                    <AlertTriangle className="h-5 w-5 mr-2" />
                    Threat Scenarios
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    Choose from realistic cyber attack scenarios
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ScenarioSelector onScenarioSelect={handleScenarioSelect} />
                </CardContent>
              </Card>

              <Card className="glass-morphism border-cyber-purple/30 hover:border-cyber-purple/60 transition-all duration-300">
                <CardHeader>
                  <CardTitle className="flex items-center text-cyber-purple">
                    <Activity className="h-5 w-5 mr-2" />
                    Risk Assessment
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    Calculate financial and operational impact
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-400">Financial Loss</span>
                      <span className="text-cyber-red">High Impact</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-400">Downtime</span>
                      <span className="text-cyber-blue">Variable</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-400">Reputation</span>
                      <span className="text-cyber-purple">Long-term</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {currentStep === 'form' && (
          <SimulationForm
            scenario={selectedScenario}
            onComplete={handleSimulationComplete}
            onBack={() => setCurrentStep('select')}
          />
        )}

        {currentStep === 'results' && simulationResult && (
          <ResultsDisplay
            result={simulationResult}
            onNewSimulation={handleNewSimulation}
            onViewHistory={() => setCurrentStep('history')}
          />
        )}

        {currentStep === 'history' && (
          <SimulationHistory onBack={() => setCurrentStep('select')} />
        )}
      </main>
    </div>
  );
};

export default Index;
