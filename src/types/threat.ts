export type ThreatSeverity = 'critique' | 'eleve' | 'moyen' | 'faible';

export interface ThreatLocation {
  lat: number;
  lng: number;
  country: string;
  city?: string;
}

export interface Threat {
  id: string;
  timestamp: Date;
  sourceIp: string;
  sourceLocation: ThreatLocation;
  targetLocation: ThreatLocation;
  severity: ThreatSeverity;
  type: string;
  description: string;
}

export interface HoneypotLocation {
  id: string;
  name: string;
  lat: number;
  lng: number;
  country: string;
}

// Mock data for demonstration
export const MOCK_HONEYPOTS: HoneypotLocation[] = [
  { id: 'hp-1', name: 'Honeypot Paris', lat: 48.8566, lng: 2.3522, country: 'France' },
  { id: 'hp-2', name: 'Honeypot New York', lat: 40.7128, lng: -74.0060, country: 'USA' },
  { id: 'hp-3', name: 'Honeypot Tokyo', lat: 35.6762, lng: 139.6503, country: 'Japan' },
  { id: 'hp-4', name: 'Honeypot London', lat: 51.5074, lng: -0.1278, country: 'UK' },
  { id: 'hp-5', name: 'Honeypot Sydney', lat: -33.8688, lng: 151.2093, country: 'Australia' },
];

export const generateMockThreats = (): Threat[] => {
  const attackLocations = [
    { lat: 55.7558, lng: 37.6173, country: 'Russie', city: 'Moscou' },
    { lat: 39.9042, lng: 116.4074, country: 'Chine', city: 'Pékin' },
    { lat: 37.5665, lng: 126.9780, country: 'Corée du Nord', city: 'Séoul' },
    { lat: 52.5200, lng: 13.4050, country: 'Allemagne', city: 'Berlin' },
    { lat: 19.4326, lng: -99.1332, country: 'Mexique', city: 'Mexico' },
    { lat: -23.5505, lng: -46.6333, country: 'Brésil', city: 'São Paulo' },
    { lat: 28.6139, lng: 77.2090, country: 'Inde', city: 'New Delhi' },
    { lat: 35.6895, lng: 51.3890, country: 'Iran', city: 'Téhéran' },
  ];

  const threatTypes = [
    'SSH Brute Force',
    'SQL Injection',
    'DDoS Attack',
    'Malware Delivery',
    'Port Scan',
    'XSS Attempt',
    'Credential Stuffing',
    'API Abuse',
  ];

  const severities: ThreatSeverity[] = ['critique', 'eleve', 'moyen', 'faible'];

  const threats: Threat[] = [];
  const now = new Date();

  for (let i = 0; i < 15; i++) {
    const sourceLocation = attackLocations[Math.floor(Math.random() * attackLocations.length)];
    const targetHoneypot = MOCK_HONEYPOTS[Math.floor(Math.random() * MOCK_HONEYPOTS.length)];
    const severity = severities[Math.floor(Math.random() * severities.length)];
    const type = threatTypes[Math.floor(Math.random() * threatTypes.length)];

    threats.push({
      id: `threat-${i + 1}`,
      timestamp: new Date(now.getTime() - Math.random() * 3600000), // Within last hour
      sourceIp: `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
      sourceLocation: {
        lat: sourceLocation.lat,
        lng: sourceLocation.lng,
        country: sourceLocation.country,
        city: sourceLocation.city,
      },
      targetLocation: {
        lat: targetHoneypot.lat,
        lng: targetHoneypot.lng,
        country: targetHoneypot.country,
      },
      severity,
      type,
      description: `${type} détecté depuis ${sourceLocation.city}, ${sourceLocation.country}`,
    });
  }

  return threats.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
};
