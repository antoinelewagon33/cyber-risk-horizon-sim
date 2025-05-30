
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Calendar, DollarSign, Clock } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Simulation } from '@/types/simulation';
import { getSimulations } from '@/utils/firestore';

interface SimulationHistoryProps {
  onBack: () => void;
}

const SimulationHistory: React.FC<SimulationHistoryProps> = ({ onBack }) => {
  const [simulations, setSimulations] = useState<Simulation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSimulations();
  }, []);

  const loadSimulations = async () => {
    try {
      const data = await getSimulations();
      setSimulations(data);
    } catch (error) {
      console.error('Failed to load simulations:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
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

  // Prepare chart data
  const chartData = simulations.map((sim, index) => ({
    name: `Sim ${index + 1}`,
    totalLoss: sim.result.financialImpact.totalLoss,
    downtime: sim.result.operationalImpact.downtimeHours,
    scenario: sim.scenario,
    date: new Date(sim.timestamp).toLocaleDateString()
  }));

  const scenarioStats = simulations.reduce((acc, sim) => {
    const scenario = sim.scenario;
    if (!acc[scenario]) {
      acc[scenario] = { count: 0, totalLoss: 0, avgDowntime: 0 };
    }
    acc[scenario].count++;
    acc[scenario].totalLoss += sim.result.financialImpact.totalLoss;
    acc[scenario].avgDowntime += sim.result.operationalImpact.downtimeHours;
    return acc;
  }, {} as Record<string, { count: number; totalLoss: number; avgDowntime: number }>);

  const scenarioChartData = Object.entries(scenarioStats).map(([scenario, stats]) => ({
    scenario: scenario.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()),
    avgLoss: Math.round(stats.totalLoss / stats.count),
    avgDowntime: Math.round(stats.avgDowntime / stats.count),
    count: stats.count
  }));

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-cyber-blue">Loading simulation history...</div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button
          variant="outline"
          onClick={onBack}
          className="border-cyber-blue text-cyber-blue hover:bg-cyber-blue/10"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>
        <div>
          <h2 className="text-2xl font-bold text-white">Simulation History</h2>
          <p className="text-gray-400">{simulations.length} simulations completed</p>
        </div>
      </div>

      {simulations.length === 0 ? (
        <Card className="glass-morphism border-gray-700">
          <CardContent className="text-center py-12">
            <p className="text-gray-400 text-lg">No simulations found</p>
            <p className="text-gray-500">Run your first simulation to see results here</p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Financial Impact Chart */}
            <Card className="glass-morphism border-cyber-red/30">
              <CardHeader>
                <CardTitle className="text-cyber-red">Financial Impact Trends</CardTitle>
                <CardDescription>Total loss per simulation</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis 
                      dataKey="name" 
                      stroke="#9CA3AF"
                      fontSize={12}
                    />
                    <YAxis 
                      stroke="#9CA3AF"
                      fontSize={12}
                      tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`}
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        border: '1px solid #374151',
                        borderRadius: '8px'
                      }}
                      labelStyle={{ color: '#00f5ff' }}
                      formatter={(value: number, name) => [
                        formatCurrency(value),
                        name === 'totalLoss' ? 'Total Loss' : name
                      ]}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="totalLoss" 
                      stroke="#ff0080" 
                      strokeWidth={2}
                      dot={{ fill: '#ff0080', strokeWidth: 2, r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Scenario Comparison Chart */}
            <Card className="glass-morphism border-cyber-blue/30">
              <CardHeader>
                <CardTitle className="text-cyber-blue">Scenario Analysis</CardTitle>
                <CardDescription>Average impact by attack type</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={scenarioChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis 
                      dataKey="scenario" 
                      stroke="#9CA3AF"
                      fontSize={10}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis 
                      stroke="#9CA3AF"
                      fontSize={12}
                      tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`}
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        border: '1px solid #374151',
                        borderRadius: '8px'
                      }}
                      formatter={(value: number, name) => [
                        name === 'avgLoss' ? formatCurrency(value) : `${value}h`,
                        name === 'avgLoss' ? 'Avg Loss' : 'Avg Downtime'
                      ]}
                    />
                    <Bar dataKey="avgLoss" fill="#00f5ff" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Simulation List */}
          <Card className="glass-morphism border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Recent Simulations</CardTitle>
              <CardDescription>Detailed view of your simulation history</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {simulations.slice(0, 10).map((simulation) => (
                  <div 
                    key={simulation.id}
                    className="flex items-center justify-between p-4 rounded-lg bg-black/20 border border-gray-700 hover:border-gray-600 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="font-semibold text-white">
                          {simulation.organizationData.name}
                        </h3>
                        <Badge 
                          variant="outline"
                          className={`border-${getRiskColor(simulation.result.riskLevel)} text-${getRiskColor(simulation.result.riskLevel)}`}
                        >
                          {simulation.result.riskLevel}
                        </Badge>
                        <Badge variant="secondary">
                          {simulation.scenario.replace('-', ' ')}
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-6 text-sm text-gray-400">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          {new Date(simulation.timestamp).toLocaleDateString()}
                        </div>
                        <div className="flex items-center">
                          <DollarSign className="h-4 w-4 mr-1" />
                          {formatCurrency(simulation.result.financialImpact.totalLoss)}
                        </div>
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          {simulation.result.operationalImpact.downtimeHours}h downtime
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default SimulationHistory;
