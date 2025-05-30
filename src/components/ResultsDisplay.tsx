import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingDown, 
  Clock, 
  AlertTriangle, 
  DollarSign, 
  Activity,
  RotateCcw,
  History,
  Shield
} from 'lucide-react';
import { SimulationResult } from '@/types/simulation';
import { useSettings } from '@/contexts/SettingsContext';
import { useTranslation } from '@/utils/translations';
import { formatCurrency } from '@/utils/currency';

interface ResultsDisplayProps {
  result: SimulationResult;
  onNewSimulation: () => void;
  onViewHistory: () => void;
}

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ result, onNewSimulation, onViewHistory }) => {
  const { language, currency } = useSettings();
  const { t } = useTranslation(language);

  const formatAmount = (amount: number) => {
    return formatCurrency(amount, currency);
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'low': return 'cyber-green';
      case 'medium': return 'cyber-blue';
      case 'high': return 'yellow-500';
      case 'critical': return 'cyber-red';
      default: return 'gray-500';
    }
  };

  const getRiskProgress = (level: string) => {
    switch (level) {
      case 'low': return 25;
      case 'medium': return 50;
      case 'high': return 75;
      case 'critical': return 100;
      default: return 0;
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold text-white">
          {t('riskAssessmentResults')}
        </h2>
        <p className="text-gray-400">
          {t('scenario')}: <span className="text-cyber-blue">{t(result.scenario as keyof typeof import('@/utils/translations').translations.en)}</span> | 
          {t('organization')}: <span className="text-cyber-blue">{result.organizationName}</span>
        </p>
        <div className="flex justify-center space-x-4">
          <Button
            onClick={onNewSimulation}
            className="bg-cyber-blue hover:bg-cyber-blue/80 text-black font-semibold"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            {t('newSimulation')}
          </Button>
          <Button
            variant="outline"
            onClick={onViewHistory}
            className="border-cyber-purple text-cyber-purple hover:bg-cyber-purple/10"
          >
            <History className="h-4 w-4 mr-2" />
            {t('viewHistory')}
          </Button>
        </div>
      </div>

      {/* Risk Level Overview */}
      <Card className="glass-morphism border-2 animate-glow">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center space-x-2">
            <Shield className="h-6 w-6 text-cyber-blue" />
            <span className="text-2xl">{t('overallRiskLevel')}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <Badge 
              variant="outline" 
              className={`text-2xl py-2 px-6 border-${getRiskColor(result.riskLevel)} text-${getRiskColor(result.riskLevel)}`}
            >
              {t(result.riskLevel as keyof typeof import('@/utils/translations').translations.en)}
            </Badge>
          </div>
          <Progress 
            value={getRiskProgress(result.riskLevel)} 
            className="h-4"
          />
          <p className="text-center text-gray-400">
            This assessment indicates a <strong className={`text-${getRiskColor(result.riskLevel)}`}>
              {result.riskLevel}
            </strong> level of risk for your organization
          </p>
        </CardContent>
      </Card>

      {/* Impact Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Financial Impact */}
        <Card className="glass-morphism border-cyber-red/30 hover:border-cyber-red/60 transition-all">
          <CardHeader>
            <CardTitle className="flex items-center text-cyber-red">
              <DollarSign className="h-5 w-5 mr-2" />
              {t('financialImpact')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-cyber-red">
                {formatAmount(result.financialImpact.totalLoss)}
              </div>
              <p className="text-sm text-gray-400">{t('totalEstimatedLoss')}</p>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-400">{t('directLoss')}:</span>
                <span className="text-white">{formatAmount(result.financialImpact.directLoss)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-400">{t('operationalLoss')}:</span>
                <span className="text-white">{formatAmount(result.financialImpact.operationalLoss)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-400">{t('regulatoryFines')}:</span>
                <span className="text-white">{formatAmount(result.financialImpact.regulatoryFines)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Operational Impact */}
        <Card className="glass-morphism border-cyber-blue/30 hover:border-cyber-blue/60 transition-all">
          <CardHeader>
            <CardTitle className="flex items-center text-cyber-blue">
              <Clock className="h-5 w-5 mr-2" />
              {t('operationalImpact')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-cyber-blue">
                {result.operationalImpact.downtimeHours}h
              </div>
              <p className="text-sm text-gray-400">{t('estimatedDowntime')}</p>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-400">{t('affectedSystems')}:</span>
                <span className="text-white">{result.operationalImpact.affectedSystems}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-400">{t('recoveryTime')}:</span>
                <span className="text-white">{result.operationalImpact.recoveryTime}h</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Reputational Impact */}
        <Card className="glass-morphism border-cyber-purple/30 hover:border-cyber-purple/60 transition-all">
          <CardHeader>
            <CardTitle className="flex items-center text-cyber-purple">
              <TrendingDown className="h-5 w-5 mr-2" />
              {t('reputationalImpact')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-cyber-purple">
                {result.reputationalImpact.score}/10
              </div>
              <p className="text-sm text-gray-400">{t('impactScore')}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-gray-300">{result.reputationalImpact.description}</p>
              <div className="flex justify-between">
                <span className="text-sm text-gray-400">{t('recoveryTime')}:</span>
                <span className="text-white">{result.reputationalImpact.recoveryTime}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recommendations */}
      <Card className="glass-morphism border-cyber-green/30">
        <CardHeader>
          <CardTitle className="flex items-center text-cyber-green">
            <AlertTriangle className="h-5 w-5 mr-2" />
            {t('securityRecommendations')}
          </CardTitle>
          <CardDescription>
            {t('actionableSteps')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {result.recommendations.map((recommendation, index) => (
              <div 
                key={index}
                className="flex items-start space-x-3 p-3 rounded-lg bg-black/20 border border-gray-700"
              >
                <div className="flex-shrink-0 w-6 h-6 bg-cyber-green/20 rounded-full flex items-center justify-center mt-1">
                  <span className="text-cyber-green text-sm font-bold">{index + 1}</span>
                </div>
                <p className="text-gray-300 text-sm">{recommendation}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResultsDisplay;
