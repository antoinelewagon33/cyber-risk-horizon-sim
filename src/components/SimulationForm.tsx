
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, Calculator } from 'lucide-react';
import { OrganizationData, SimulationResult } from '@/types/simulation';
import { calculateRisk } from '@/utils/riskCalculations';
import { saveSimulation } from '@/utils/firestore';
import { useToast } from '@/hooks/use-toast';

interface SimulationFormProps {
  scenario: string;
  onComplete: (result: SimulationResult) => void;
  onBack: () => void;
}

const SimulationForm: React.FC<SimulationFormProps> = ({ scenario, onComplete, onBack }) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState<OrganizationData>({
    name: '',
    annualRevenue: 0,
    criticalServers: 0,
    backupStatus: 'basic',
    incidentResponseTime: 24,
    employeeCount: 0,
    industry: '',
    hasInsurance: false,
    complianceLevel: 'basic'
  });

  const [isCalculating, setIsCalculating] = useState(false);

  const handleInputChange = (field: keyof OrganizationData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCalculating(true);

    try {
      // Calculate risk impact
      const result = calculateRisk(scenario, formData);
      
      // Save to Firestore (you'll implement this)
      await saveSimulation({
        id: Date.now().toString(),
        scenario,
        organizationData: formData,
        result,
        timestamp: new Date()
      });

      toast({
        title: "Simulation Complete",
        description: "Risk assessment has been calculated and saved.",
      });

      onComplete(result);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to complete simulation. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsCalculating(false);
    }
  };

  const getScenarioTitle = (scenario: string) => {
    const titles: Record<string, string> = {
      'ransomware': 'Ransomware Attack',
      'data-breach': 'Data Breach',
      'phishing': 'Phishing Campaign',
      'ddos': 'DDoS Attack',
      'insider-threat': 'Insider Threat',
      'supply-chain': 'Supply Chain Attack'
    };
    return titles[scenario] || 'Cyber Attack';
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button
          variant="outline"
          onClick={onBack}
          className="border-cyber-blue text-cyber-blue hover:bg-cyber-blue/10"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div>
          <h2 className="text-2xl font-bold text-white">
            Organization Assessment
          </h2>
          <p className="text-gray-400">
            Scenario: <span className="text-cyber-blue">{getScenarioTitle(scenario)}</span>
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Basic Information */}
          <Card className="glass-morphism border-cyber-blue/30">
            <CardHeader>
              <CardTitle className="text-cyber-blue">Basic Information</CardTitle>
              <CardDescription>Organization details and context</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="name" className="text-white">Organization Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="bg-black/30 border-gray-600 text-white"
                  placeholder="Enter organization name"
                  required
                />
              </div>

              <div>
                <Label htmlFor="industry" className="text-white">Industry</Label>
                <Select value={formData.industry} onValueChange={(value) => handleInputChange('industry', value)}>
                  <SelectTrigger className="bg-black/30 border-gray-600 text-white">
                    <SelectValue placeholder="Select industry" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-900 border-gray-600">
                    <SelectItem value="finance">Financial Services</SelectItem>
                    <SelectItem value="healthcare">Healthcare</SelectItem>
                    <SelectItem value="retail">Retail</SelectItem>
                    <SelectItem value="manufacturing">Manufacturing</SelectItem>
                    <SelectItem value="technology">Technology</SelectItem>
                    <SelectItem value="education">Education</SelectItem>
                    <SelectItem value="government">Government</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="revenue" className="text-white">Annual Revenue (USD)</Label>
                <Input
                  id="revenue"
                  type="number"
                  value={formData.annualRevenue || ''}
                  onChange={(e) => handleInputChange('annualRevenue', parseInt(e.target.value) || 0)}
                  className="bg-black/30 border-gray-600 text-white"
                  placeholder="1000000"
                  required
                />
              </div>

              <div>
                <Label htmlFor="employees" className="text-white">Employee Count</Label>
                <Input
                  id="employees"
                  type="number"
                  value={formData.employeeCount || ''}
                  onChange={(e) => handleInputChange('employeeCount', parseInt(e.target.value) || 0)}
                  className="bg-black/30 border-gray-600 text-white"
                  placeholder="100"
                  required
                />
              </div>
            </CardContent>
          </Card>

          {/* Technical Infrastructure */}
          <Card className="glass-morphism border-cyber-purple/30">
            <CardHeader>
              <CardTitle className="text-cyber-purple">Technical Infrastructure</CardTitle>
              <CardDescription>System configuration and security posture</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="servers" className="text-white">Critical Servers</Label>
                <Input
                  id="servers"
                  type="number"
                  value={formData.criticalServers || ''}
                  onChange={(e) => handleInputChange('criticalServers', parseInt(e.target.value) || 0)}
                  className="bg-black/30 border-gray-600 text-white"
                  placeholder="10"
                  required
                />
              </div>

              <div>
                <Label htmlFor="backup" className="text-white">Backup Status</Label>
                <Select value={formData.backupStatus} onValueChange={(value: any) => handleInputChange('backupStatus', value)}>
                  <SelectTrigger className="bg-black/30 border-gray-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-900 border-gray-600">
                    <SelectItem value="none">No Backups</SelectItem>
                    <SelectItem value="basic">Basic Backups</SelectItem>
                    <SelectItem value="advanced">Advanced/Immutable Backups</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="response-time" className="text-white">Incident Response Time (hours)</Label>
                <Input
                  id="response-time"
                  type="number"
                  value={formData.incidentResponseTime || ''}
                  onChange={(e) => handleInputChange('incidentResponseTime', parseInt(e.target.value) || 24)}
                  className="bg-black/30 border-gray-600 text-white"
                  placeholder="24"
                  required
                />
              </div>

              <div>
                <Label htmlFor="compliance" className="text-white">Compliance Level</Label>
                <Select value={formData.complianceLevel} onValueChange={(value: any) => handleInputChange('complianceLevel', value)}>
                  <SelectTrigger className="bg-black/30 border-gray-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-900 border-gray-600">
                    <SelectItem value="basic">Basic Compliance</SelectItem>
                    <SelectItem value="moderate">Moderate Compliance</SelectItem>
                    <SelectItem value="high">High Compliance</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="insurance"
                  checked={formData.hasInsurance}
                  onCheckedChange={(checked) => handleInputChange('hasInsurance', checked)}
                  className="border-cyber-blue data-[state=checked]:bg-cyber-blue"
                />
                <Label htmlFor="insurance" className="text-white">Has Cyber Insurance</Label>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Submit Button */}
        <div className="flex justify-center">
          <Button
            type="submit"
            disabled={isCalculating}
            className="bg-cyber-blue hover:bg-cyber-blue/80 text-black font-semibold px-8 py-3 text-lg"
          >
            {isCalculating ? (
              <>
                <Calculator className="h-5 w-5 mr-2 animate-spin" />
                Calculating Risk...
              </>
            ) : (
              <>
                <Calculator className="h-5 w-5 mr-2" />
                Calculate Risk Impact
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default SimulationForm;
