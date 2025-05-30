import React, { useState } from 'react';
import { Shield, AlertTriangle, Activity, Target } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import ScenarioSelector from '@/components/ScenarioSelector';
import SimulationForm from '@/components/SimulationForm';
import ResultsDisplay from '@/components/ResultsDisplay';
import SimulationHistory from '@/components/SimulationHistory';
import SettingsPanel from '@/components/SettingsPanel';
import { Simulation, SimulationResult } from '@/types/simulation';
import { useSettings } from '@/contexts/SettingsContext';
import { useTranslation } from '@/utils/translations';

const Index = () => {
  const [currentStep, setCurrentStep] = useState<'select' | 'form' | 'results' | 'history'>('select');
  const [selectedScenario, setSelectedScenario] = useState<string>('');
  const [simulationResult, setSimulationResult] = useState<SimulationResult | null>(null);
  
  const { language } = useSettings();
  const { t } = useTranslation(language);

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
              <div>
                <h1 className="text-2xl font-bold neon-text">{t('title')}</h1>
                <p className="text-sm text-gray-400">{t('subtitle')}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <SettingsPanel />
              <Button
                variant="outline"
                onClick={() => setCurrentStep('history')}
                className="border-cyber-blue text-cyber-blue hover:bg-cyber-blue/10"
              >
                <Activity className="h-4 w-4 mr-2" />
                {t('history')}
              </Button>
              <Button
                onClick={handleNewSimulation}
                className="bg-cyber-blue hover:bg-cyber-blue/80 text-black font-semibold"
              >
                <Target className="h-4 w-4 mr-2" />
                {t('newSimulation')}
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
                {t('cyberRiskAssessment').split(' ')[0]} <span className="neon-text">{t('cyberRiskAssessment').split(' ').slice(1).join(' ')}</span>
              </h2>
              <p className="text-gray-300 max-w-2xl mx-auto">
                {t('description')}
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="glass-morphism border-cyber-blue/30 hover:border-cyber-blue/60 transition-all duration-300">
                <CardHeader>
                  <CardTitle className="flex items-center text-cyber-blue">
                    <AlertTriangle className="h-5 w-5 mr-2" />
                    {t('threatScenarios')}
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    {t('threatScenariosDesc')}
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
                    {t('riskAssessment')}
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    {t('riskAssessmentDesc')}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-400">{t('financialLoss')}</span>
                      <span className="text-cyber-red">{t('highImpact')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-400">{t('downtime')}</span>
                      <span className="text-cyber-blue">{t('variable')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-400">{t('reputation')}</span>
                      <span className="text-cyber-purple">{t('longTerm')}</span>
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
