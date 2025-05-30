
export interface OrganizationData {
  name: string;
  annualRevenue: number;
  criticalServers: number;
  backupStatus: 'none' | 'basic' | 'advanced';
  incidentResponseTime: number; // hours
  employeeCount: number;
  industry: string;
  hasInsurance: boolean;
  complianceLevel: 'basic' | 'moderate' | 'high';
}

export interface Simulation {
  id: string;
  userId?: string;
  scenario: string;
  organizationData: OrganizationData;
  result: SimulationResult;
  timestamp: Date;
}

export interface SimulationResult {
  scenario: string;
  organizationName: string;
  financialImpact: {
    directLoss: number;
    operationalLoss: number;
    regulatoryFines: number;
    totalLoss: number;
  };
  operationalImpact: {
    downtimeHours: number;
    affectedSystems: number;
    recoveryTime: number;
  };
  reputationalImpact: {
    score: number; // 1-10
    description: string;
    recoveryTime: string;
  };
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  recommendations: string[];
}

export interface ScenarioConfig {
  id: string;
  name: string;
  description: string;
  icon: string;
  baseImpactMultiplier: number;
  minDowntime: number;
  maxDowntime: number;
  regulatoryRisk: boolean;
}
