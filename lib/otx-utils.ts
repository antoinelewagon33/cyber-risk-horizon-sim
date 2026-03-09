export interface OTXPulseResponse {
  count: number
  next: string | null
  previous: string | null
  results: OTXPulse[]
}

export interface OTXPulse {
  id: string
  name: string
  description: string
  created: string
  modified: string
  author_name: string
  public: number
  adversary: string
  targeted_countries: string[]
  malware_families: string[]
  attack_ids: string[]
  industries: string[]
  tags: string[]
  references: string[]
  indicators: OTXIndicator[]
}

export interface OTXIndicator {
  id: number
  indicator: string
  type: string
  created: string
  content: string
  access_type: string
  access_reason: string
}

export const THREAT_CATEGORIES = {
  ransomware: "Ransomware",
  phishing: "Phishing Campaign",
  ddos: "DDoS Attack",
  malware: "Malware Distribution",
  trojan: "Malware Distribution",
  botnet: "Botnet Activity",
  apt: "APT Campaign",
  exploit: "Exploit Kit",
  vulnerability: "Vulnerability Exploit",
  backdoor: "Backdoor Access",
  spam: "Spam Campaign",
  suspicious: "Suspicious Activity",
}

export const SEVERITY_KEYWORDS = {
  critical: ["apt", "ransomware", "zero-day", "critical", "nation-state", "advanced persistent threat"],
  high: ["malware", "trojan", "backdoor", "exploit", "vulnerability", "breach"],
  medium: ["phishing", "spam", "suspicious", "botnet", "campaign"],
  low: ["scan", "probe", "reconnaissance", "information gathering"],
}

export function categorizeThreat(tags: string[], malwareFamilies: string[]): string {
  const allTags = [...tags, ...malwareFamilies].map((tag) => tag.toLowerCase())

  for (const [keyword, category] of Object.entries(THREAT_CATEGORIES)) {
    if (allTags.some((tag) => tag.includes(keyword))) {
      return category
    }
  }

  return "Suspicious Activity"
}

export function determineSeverity(pulse: OTXPulse): "Critical" | "High" | "Medium" | "Low" {
  const tags = pulse.tags.map((tag) => tag.toLowerCase())
  const malwareFamilies = pulse.malware_families.map((family) => family.toLowerCase())
  const allTags = [...tags, ...malwareFamilies, pulse.name.toLowerCase(), pulse.description.toLowerCase()]

  // Check for critical indicators
  if (allTags.some((tag) => SEVERITY_KEYWORDS.critical.some((keyword) => tag.includes(keyword)))) {
    return "Critical"
  }

  // Check for high severity indicators
  if (allTags.some((tag) => SEVERITY_KEYWORDS.high.some((keyword) => tag.includes(keyword)))) {
    return "High"
  }

  // Check for medium severity indicators
  if (allTags.some((tag) => SEVERITY_KEYWORDS.medium.some((keyword) => tag.includes(keyword)))) {
    return "Medium"
  }

  return "Low"
}

export function getGeoLocation(countries: string[]) {
  const countryCoordinates: Record<string, { lat: number; lng: number }> = {
    china: { lat: 39.9042, lng: 116.4074 },
    russia: { lat: 55.7558, lng: 37.6176 },
    iran: { lat: 35.6762, lng: 51.4214 },
    "north korea": { lat: 37.5665, lng: 126.978 },
    usa: { lat: 40.7128, lng: -74.006 },
    "united states": { lat: 40.7128, lng: -74.006 },
    germany: { lat: 52.52, lng: 13.405 },
    uk: { lat: 51.5074, lng: -0.1278 },
    "united kingdom": { lat: 51.5074, lng: -0.1278 },
    japan: { lat: 35.6762, lng: 139.6503 },
    singapore: { lat: 1.3521, lng: 103.8198 },
    australia: { lat: -33.8688, lng: 151.2093 },
  }

  for (const country of countries) {
    const coords = countryCoordinates[country.toLowerCase()]
    if (coords) {
      return { ...coords, country }
    }
  }

  // Return random location if no match found
  const locations = Object.entries(countryCoordinates)
  const randomLocation = locations[Math.floor(Math.random() * locations.length)]
  return { ...randomLocation[1], country: randomLocation[0] }
}
