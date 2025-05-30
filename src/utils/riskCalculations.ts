
import { OrganizationData, SimulationResult } from '@/types/simulation';

const scenarioConfigs = {
  'ransomware': {
    baseImpactMultiplier: 0.15,
    minDowntime: 72,
    maxDowntime: 720,
    regulatoryRisk: true,
    reputationImpact: 8
  },
  'data-breach': {
    baseImpactMultiplier: 0.12,
    minDowntime: 24,
    maxDowntime: 168,
    regulatoryRisk: true,
    reputationImpact: 9
  },
  'phishing': {
    baseImpactMultiplier: 0.05,
    minDowntime: 8,
    maxDowntime: 48,
    regulatoryRisk: false,
    reputationImpact: 5
  },
  'ddos': {
    baseImpactMultiplier: 0.03,
    minDowntime: 4,
    maxDowntime: 24,
    regulatoryRisk: false,
    reputationImpact: 4
  },
  'insider-threat': {
    baseImpactMultiplier: 0.08,
    minDowntime: 16,
    maxDowntime: 96,
    regulatoryRisk: true,
    reputationImpact: 7
  },
  'supply-chain': {
    baseImpactMultiplier: 0.20,
    minDowntime: 48,
    maxDowntime: 480,
    regulatoryRisk: true,
    reputationImpact: 8
  }
};

export const calculateRisk = (scenario: string, orgData: OrganizationData): SimulationResult => {
  const config = scenarioConfigs[scenario as keyof typeof scenarioConfigs];
  
  if (!config) {
    throw new Error(`Unknown scenario: ${scenario}`);
  }

  // Base calculations
  const hourlyRevenue = orgData.annualRevenue / (365 * 24);
  
  // Calculate downtime based on response time and backup status
  let downtimeMultiplier = 1;
  if (orgData.backupStatus === 'advanced') downtimeMultiplier *= 0.3;
  else if (orgData.backupStatus === 'basic') downtimeMultiplier *= 0.6;
  
  if (orgData.incidentResponseTime <= 4) downtimeMultiplier *= 0.5;
  else if (orgData.incidentResponseTime <= 12) downtimeMultiplier *= 0.7;
  
  const downtimeHours = Math.max(
    config.minDowntime * downtimeMultiplier,
    Math.min(config.maxDowntime * downtimeMultiplier, config.maxDowntime)
  );

  // Financial impact calculations
  const directLoss = orgData.annualRevenue * config.baseImpactMultiplier;
  const operationalLoss = hourlyRevenue * downtimeHours;
  
  let regulatoryFines = 0;
  if (config.regulatoryRisk) {
    const fineMultipliers = {
      'finance': 0.05,
      'healthcare': 0.04,
      'government': 0.02,
      'other': 0.01
    };
    const multiplier = fineMultipliers[orgData.industry as keyof typeof fineMultipliers] || 0.01;
    regulatoryFines = orgData.annualRevenue * multiplier;
  }

  // Insurance reduction
  let totalLoss = directLoss + operationalLoss + regulatoryFines;
  if (orgData.hasInsurance) {
    totalLoss *= 0.7; // 30% covered by insurance
  }

  // Risk level determination
  const revenueRatio = totalLoss / orgData.annualRevenue;
  let riskLevel: 'low' | 'medium' | 'high' | 'critical';
  if (revenueRatio < 0.05) riskLevel = 'low';
  else if (revenueRatio < 0.15) riskLevel = 'medium';
  else if (revenueRatio < 0.30) riskLevel = 'high';
  else riskLevel = 'critical';

  // Affected systems calculation
  const affectedSystems = Math.min(
    orgData.criticalServers,
    Math.ceil(orgData.criticalServers * (config.baseImpactMultiplier * 2))
  );

  // Recovery time calculation
  const recoveryTime = downtimeHours + (orgData.incidentResponseTime * 2);

  // Reputation impact
  const reputationScore = Math.max(1, config.reputationImpact - (orgData.complianceLevel === 'high' ? 2 : 0));
  const reputationDescription = getReputationDescription(reputationScore);
  const reputationRecoveryTime = getReputationRecoveryTime(reputationScore);

  // Generate recommendations
  const recommendations = generateRecommendations(scenario, orgData, riskLevel);

  return {
    scenario,
    organizationName: orgData.name,
    financialImpact: {
      directLoss: Math.round(directLoss),
      operationalLoss: Math.round(operationalLoss),
      regulatoryFines: Math.round(regulatoryFines),
      totalLoss: Math.round(totalLoss)
    },
    operationalImpact: {
      downtimeHours: Math.round(downtimeHours),
      affectedSystems,
      recoveryTime: Math.round(recoveryTime)
    },
    reputationalImpact: {
      score: reputationScore,
      description: reputationDescription,
      recoveryTime: reputationRecoveryTime
    },
    riskLevel,
    recommendations
  };
};

const getReputationDescription = (score: number): string => {
  if (score <= 3) return 'Minimal reputation damage, quick recovery expected';
  if (score <= 5) return 'Moderate reputation impact, some customer concern';
  if (score <= 7) return 'Significant reputation damage, customer trust affected';
  return 'Severe reputation damage, major customer and partner concerns';
};

const getReputationRecoveryTime = (score: number): string => {
  if (score <= 3) return '1-3 months';
  if (score <= 5) return '6-12 months';
  if (score <= 7) return '1-2 years';
  return '2+ years';
};

const generateRecommendations = (scenario: string, orgData: OrganizationData, riskLevel: string): string[] => {
  const recommendations: string[] = [];

  // General recommendations based on current state
  if (orgData.backupStatus === 'none') {
    recommendations.push('Implement comprehensive backup strategy with offline/immutable backups');
  } else if (orgData.backupStatus === 'basic') {
    recommendations.push('Upgrade to advanced backup solutions with air-gapped storage');
  }

  if (orgData.incidentResponseTime > 24) {
    recommendations.push('Develop and test incident response procedures to reduce response time');
  }

  if (!orgData.hasInsurance) {
    recommendations.push('Consider cyber insurance to mitigate financial losses');
  }

  if (orgData.complianceLevel === 'basic') {
    recommendations.push('Enhance security compliance and audit procedures');
  }

  // Scenario-specific recommendations
  const scenarioRecommendations = {
    'ransomware': [
      'Deploy endpoint detection and response (EDR) solutions',
      'Implement network segmentation to limit lateral movement',
      'Regular security awareness training for employees'
    ],
    'data-breach': [
      'Implement data loss prevention (DLP) solutions',
      'Enhance access controls and privilege management',
      'Regular penetration testing and vulnerability assessments'
    ],
    'phishing': [
      'Deploy advanced email security solutions',
      'Implement multi-factor authentication across all systems',
      'Conduct regular phishing simulation exercises'
    ],
    'ddos': [
      'Implement DDoS protection services',
      'Enhance network monitoring and traffic analysis',
      'Develop redundant infrastructure and failover procedures'
    ],
    'insider-threat': [
      'Implement user behavior analytics (UBA)',
      'Enhance employee background checks and monitoring',
      'Develop insider threat detection and response procedures'
    ],
    'supply-chain': [
      'Implement third-party risk management program',
      'Enhance vendor security assessments',
      'Develop supply chain incident response procedures'
    ]
  };

  recommendations.push(...(scenarioRecommendations[scenario as keyof typeof scenarioRecommendations] || []));

  // Risk-level specific recommendations
  if (riskLevel === 'critical' || riskLevel === 'high') {
    recommendations.push('Consider hiring dedicated cybersecurity personnel or CISO');
    recommendations.push('Implement 24/7 security operations center (SOC)');
  }

  return recommendations.slice(0, 6); // Limit to 6 recommendations
};
