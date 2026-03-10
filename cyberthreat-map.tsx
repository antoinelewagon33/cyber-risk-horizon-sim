"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Play,
  Pause,
  RotateCcw,
  AlertTriangle,
  Wifi,
  WifiOff,
  Shield,
  Target,
  Activity,
  Globe,
  Clock,
  Users,
  Layers,
} from "lucide-react"

interface OTXPulse {
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

interface OTXIndicator {
  id: number
  indicator: string
  type: string
  created: string
  content: string
  access_type: string
  access_reason: string
}

interface ThreatPulse {
  id: string
  name: string
  type: string
  severity: "Critical" | "High" | "Medium" | "Low"
  source: { lat: number; lng: number; country: string; city: string }
  target: { lat: number; lng: number; country: string; city: string }
  timestamp: Date
  description: string
  author: string
  tags: string[]
  indicators: number
  adversary: string
}

interface AnimatedPing {
  id: string
  pulse: ThreatPulse
  progress: number
  startTime: number
  duration: number
}

interface PingRef {
  marker: any
  ping: AnimatedPing
}

const SEVERITY_COLORS = {
  Critical: "#dc2626",
  High: "#ea580c",
  Medium: "#d97706",
  Low: "#16a34a",
}

const SEVERITY_PRIORITY = {
  Critical: 4,
  High: 3,
  Medium: 2,
  Low: 1,
}

export default function Component() {
  const [isConnected, setIsConnected] = useState(false)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [pulses, setPulses] = useState<ThreatPulse[]>([])
  const [animatedPings, setAnimatedPings] = useState<AnimatedPing[]>([])
  const [isPlaying, setIsPlaying] = useState(true)
  const [mapLoaded, setMapLoaded] = useState(false)
  const [selectedThreat, setSelectedThreat] = useState<ThreatPulse | null>(null)
  const [stats, setStats] = useState({
    total: 0,
    critical: 0,
    high: 0,
    medium: 0,
    low: 0,
    activePings: 0,
    countries: 0,
  })
  const animationRef = useRef<number>()
  const pulseIndexRef = useRef(0)
  const mapRef = useRef<any>(null)
  const markersRef = useRef<any[]>([])
  const pingsRef = useRef<PingRef[]>([])

  const mapWidth = 1200
  const mapHeight = 600

  // Enhanced geographic locations with cities
  const attackSources = [
    { lat: 39.9042, lng: 116.4074, country: "China", city: "Beijing" },
    { lat: 31.2304, lng: 121.4737, country: "China", city: "Shanghai" },
    { lat: 55.7558, lng: 37.6176, country: "Russia", city: "Moscow" },
    { lat: 59.9311, lng: 30.3609, country: "Russia", city: "St. Petersburg" },
    { lat: 35.6762, lng: 51.4214, country: "Iran", city: "Tehran" },
    { lat: 37.5665, lng: 126.978, country: "North Korea", city: "Pyongyang" },
    { lat: 40.7128, lng: -74.006, country: "USA", city: "New York" },
    { lat: 34.0522, lng: -118.2437, country: "USA", city: "Los Angeles" },
    { lat: 51.5074, lng: -0.1278, country: "UK", city: "London" },
    { lat: 48.8566, lng: 2.3522, country: "France", city: "Paris" },
    { lat: 52.52, lng: 13.405, country: "Germany", city: "Berlin" },
    { lat: 50.1109, lng: 8.6821, country: "Germany", city: "Frankfurt" },
    { lat: 19.4326, lng: -99.1332, country: "Mexico", city: "Mexico City" },
    { lat: -23.5505, lng: -46.6333, country: "Brazil", city: "São Paulo" },
  ]

  const honeypots = [
    { lat: 37.7749, lng: -122.4194, country: "USA", city: "San Francisco" },
    { lat: 40.7128, lng: -74.006, country: "USA", city: "New York" },
    { lat: 39.0458, lng: -76.6413, country: "USA", city: "Baltimore" },
    { lat: 51.5074, lng: -0.1278, country: "UK", city: "London" },
    { lat: 35.6762, lng: 139.6503, country: "Japan", city: "Tokyo" },
    { lat: 52.52, lng: 13.405, country: "Germany", city: "Berlin" },
    { lat: 1.3521, lng: 103.8198, country: "Singapore", city: "Singapore" },
    { lat: -33.8688, lng: 151.2093, country: "Australia", city: "Sydney" },
    { lat: 55.6761, lng: 12.5683, country: "Denmark", city: "Copenhagen" },
    { lat: 60.1699, lng: 24.9384, country: "Finland", city: "Helsinki" },
    { lat: 47.3769, lng: 8.5417, country: "Switzerland", city: "Zurich" },
    { lat: 45.4642, lng: 9.19, country: "Italy", city: "Milan" },
  ]

  // Initialize Leaflet map
  useEffect(() => {
    const initMap = async () => {
      if (typeof window === "undefined") return

      try {
        // Dynamically import Leaflet
        const L = (await import("leaflet")).default

        // Import Leaflet CSS
        const link = document.createElement("link")
        link.rel = "stylesheet"
        link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        document.head.appendChild(link)

        // Fix for default markers
        delete (L.Icon.Default.prototype as any)._getIconUrl
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
          iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
          shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
        })

        // Initialize map
        const map = L.map("threat-map", {
          center: [20, 0],
          zoom: 2,
          zoomControl: false,
          attributionControl: false,
        })

        // Add custom zoom controls
        L.control
          .zoom({
            position: "topright",
          })
          .addTo(map)

        // Dark theme tile layer
        L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
          attribution: "© OpenStreetMap contributors © CARTO",
          subdomains: "abcd",
          maxZoom: 19,
        }).addTo(map)

        // Custom styles for markers
        const createCustomIcon = (color: string, type: "source" | "honeypot") => {
          const size = type === "honeypot" ? 12 : 8
          return L.divIcon({
            className: "custom-marker",
            html: `
              <div style="
                width: ${size}px;
                height: ${size}px;
                background: ${color};
                border: 2px solid ${type === "honeypot" ? "#065f46" : "#7f1d1d"};
                border-radius: 50%;
                box-shadow: 0 0 ${size}px ${color}50;
                animation: pulse-${type} 2s infinite;
              "></div>
              <style>
                @keyframes pulse-honeypot {
                  0%, 100% { transform: scale(1); opacity: 1; }
                  50% { transform: scale(1.5); opacity: 0.7; }
                }
                @keyframes pulse-source {
                  0%, 100% { transform: scale(1); opacity: 0.8; }
                  50% { transform: scale(1.3); opacity: 0.5; }
                }
              </style>
            `,
            iconSize: [size + 4, size + 4],
            iconAnchor: [size / 2 + 2, size / 2 + 2],
          })
        }

        // Add honeypot markers
        honeypots.forEach((honeypot) => {
          const marker = L.marker([honeypot.lat, honeypot.lng], {
            icon: createCustomIcon("#10b981", "honeypot"),
          })
            .bindPopup(
              `
              <div style="font-family: system-ui;">
                <strong>🛡️ Honeypot</strong><br>
                <strong>${honeypot.city}, ${honeypot.country}</strong><br>
                <small>Defense System Active</small>
              </div>
            `,
              { className: "custom-popup" },
            )
            .addTo(map)

          markersRef.current.push(marker)
        })

        // Add attack source markers
        attackSources.forEach((source) => {
          const marker = L.marker([source.lat, source.lng], {
            icon: createCustomIcon("#ef4444", "source"),
          })
            .bindPopup(
              `
              <div style="font-family: system-ui;">
                <strong>⚠️ Attack Source</strong><br>
                <strong>${source.city}, ${source.country}</strong><br>
                <small>Threat Origin Detected</small>
              </div>
            `,
              { className: "custom-popup" },
            )
            .addTo(map)

          markersRef.current.push(marker)
        })

        mapRef.current = map
        setMapLoaded(true)

        // Add custom CSS for popups
        const style = document.createElement("style")
        style.textContent = `
          .custom-popup .leaflet-popup-content-wrapper {
            background: rgba(15, 23, 42, 0.95);
            color: #f1f5f9;
            border-radius: 8px;
            border: 1px solid #334155;
            backdrop-filter: blur(10px);
          }
          .custom-popup .leaflet-popup-tip {
            background: rgba(15, 23, 42, 0.95);
            border: 1px solid #334155;
          }
          .custom-marker {
            z-index: 1000;
          }
          .leaflet-control-zoom {
            border: none !important;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1) !important;
          }
          .leaflet-control-zoom a {
            background: rgba(15, 23, 42, 0.9) !important;
            color: white !important;
            border: 1px solid #334155 !important;
            backdrop-filter: blur(10px);
          }
          .leaflet-control-zoom a:hover {
            background: rgba(30, 41, 59, 0.9) !important;
          }
        `
        document.head.appendChild(style)
      } catch (error) {
        console.error("Error initializing map:", error)
        setError("Failed to load interactive map")
      }
    }

    initMap()

    return () => {
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }
    }
  }, [])

  const fetchOTXPulses = async (): Promise<ThreatPulse[]> => {
    try {
      setError(null)
      const response = await fetch("/api/otx-pulses")

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      setIsConnected(true)
      setLastUpdate(new Date())

      return data.results.map((pulse: OTXPulse) => {
        const severity = determineSeverity(pulse)
        const sourceLocation = attackSources[Math.floor(Math.random() * attackSources.length)]
        const targetLocation = honeypots[Math.floor(Math.random() * honeypots.length)]

        return {
          id: pulse.id,
          name: pulse.name,
          type: categorizeThreats(pulse.tags, pulse.malware_families),
          severity,
          source: sourceLocation,
          target: targetLocation,
          timestamp: new Date(pulse.created),
          description: pulse.description || pulse.name,
          author: pulse.author_name,
          tags: pulse.tags,
          indicators: pulse.indicators?.length || 0,
          adversary: pulse.adversary || "Unknown",
        }
      })
    } catch (err) {
      console.error("Error fetching OTX pulses:", err)
      setError(err instanceof Error ? err.message : "Failed to fetch threat data")
      setIsConnected(false)
      return []
    }
  }

  const determineSeverity = (pulse: OTXPulse): "Critical" | "High" | "Medium" | "Low" => {
    const criticalTags = ["apt", "ransomware", "zero-day", "critical", "nation-state"]
    const highTags = ["malware", "trojan", "backdoor", "exploit", "vulnerability"]
    const mediumTags = ["phishing", "spam", "suspicious", "botnet"]

    const tags = pulse.tags.map((tag) => tag.toLowerCase())
    const malwareFamilies = pulse.malware_families.map((family) => family.toLowerCase())
    const allTags = [...tags, ...malwareFamilies]

    if (allTags.some((tag) => criticalTags.some((critical) => tag.includes(critical)))) {
      return "Critical"
    }
    if (allTags.some((tag) => highTags.some((high) => tag.includes(high)))) {
      return "High"
    }
    if (allTags.some((tag) => mediumTags.some((medium) => tag.includes(medium)))) {
      return "Medium"
    }

    return "Low"
  }

  const categorizeThreats = (tags: string[], malwareFamilies: string[]): string => {
    const allTags = [...tags, ...malwareFamilies].map((tag) => tag.toLowerCase())

    if (allTags.some((tag) => tag.includes("ransomware"))) return "Ransomware"
    if (allTags.some((tag) => tag.includes("phishing"))) return "Phishing Campaign"
    if (allTags.some((tag) => tag.includes("ddos"))) return "DDoS Attack"
    if (allTags.some((tag) => tag.includes("malware") || tag.includes("trojan"))) return "Malware Distribution"
    if (allTags.some((tag) => tag.includes("botnet"))) return "Botnet Activity"
    if (allTags.some((tag) => tag.includes("apt"))) return "APT Campaign"
    if (allTags.some((tag) => tag.includes("exploit"))) return "Exploit Kit"

    return "Suspicious Activity"
  }

  // Add animated line with Worms-style drawing (coordinate interpolation)
  const addAnimatedLineToMap = async (pulse: ThreatPulse) => {
    if (!mapRef.current || !mapLoaded) return
    try {
      const L = (await import("leaflet")).default
      const colorMap: Record<string, string> = {
        Critical: "#ef4444",
        High: "#f97316",
        Medium: "#eab308",
        Low: "#22c55e",
      }
      const color = colorMap[pulse.severity]

      const startLat = pulse.source.lat
      const startLng = pulse.source.lng
      const endLat = pulse.target.lat
      const endLng = pulse.target.lng

      // Start with a zero-length polyline
      const polyline = L.polyline([[startLat, startLng], [startLat, startLng]], {
        color: color,
        weight: 2,
        opacity: 0.85,
        dashArray: "6, 8",
      }).addTo(mapRef.current)

      const delay = pulse.severity === "Medium" || pulse.severity === "Low" ? 2000 : 0
      const animDuration = 2000 // 2 seconds to draw

      setTimeout(() => {
        const startTime = performance.now()

        const frame = (now: number) => {
          const elapsed = now - startTime
          const t = Math.min(elapsed / animDuration, 1)
          // ease-in-out
          const eased = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t

          const currentLat = startLat + (endLat - startLat) * eased
          const currentLng = startLng + (endLng - startLng) * eased

          polyline.setLatLngs([
            [startLat, startLng],
            [currentLat, currentLng],
          ])

          if (t < 1) {
            requestAnimationFrame(frame)
          } else {
            // Line fully drawn — remove immediately
            setTimeout(() => {
              if (mapRef.current) {
                try { mapRef.current.removeLayer(polyline) } catch (e) {}
              }
            }, 200)
          }
        }

        requestAnimationFrame(frame)
      }, delay)

    } catch (error) {
      console.error("Error adding animated line to map:", error)
    }
  }



  // Add animated ping to map
  const addPingToMap = async (ping: AnimatedPing) => {
    if (!mapRef.current || !mapLoaded) return

    try {
      const L = (await import("leaflet")).default
      const color = SEVERITY_COLORS[ping.pulse.severity]

      // Trigger the Worms-style animated line
      await addAnimatedLineToMap(ping.pulse)

      // Create moving marker
      const movingIcon = L.divIcon({
        className: "moving-ping",
        html: `
          <div style="
            width: 16px;
            height: 16px;
            background: ${color};
            border: 2px solid white;
            border-radius: 50%;
            box-shadow: 0 0 20px ${color};
            animation: ping-pulse 1s infinite;
          "></div>
          <style>
            @keyframes ping-pulse {
              0%, 100% { transform: scale(1); }
              50% { transform: scale(1.5); }
            }
          </style>
        `,
        iconSize: [20, 20],
        iconAnchor: [10, 10],
      })

      const movingMarker = L.marker([ping.pulse.source.lat, ping.pulse.source.lng], {
        icon: movingIcon,
      }).addTo(mapRef.current)

      // Bind popup with threat details
      movingMarker.bindPopup(
        `
        <div style="font-family: system-ui; min-width: 200px;">
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
            <span style="
              background: ${color}; 
              color: white; 
              padding: 2px 8px; 
              border-radius: 12px; 
              font-size: 11px; 
              font-weight: bold;
            ">${ping.pulse.severity}</span>
            <strong>${ping.pulse.type}</strong>
          </div>
          <div style="margin-bottom: 8px;">
            <strong>${ping.pulse.name}</strong>
          </div>
          <div style="font-size: 12px; color: #94a3b8; margin-bottom: 8px;">
            ${ping.pulse.description.substring(0, 100)}...
          </div>
          <div style="font-size: 11px; color: #64748b;">
            <div><span style="color: #94a3b8; font-weight: 600;">From:</span> ${ping.pulse.source.city}, ${ping.pulse.source.country}</div>
            <div><span style="color: #94a3b8; font-weight: 600;">To:</span> ${ping.pulse.target.city}, ${ping.pulse.target.country}</div>
            <div><span style="color: #94a3b8; font-weight: 600;">Indicators:</span> ${ping.pulse.indicators}</div>
            <div><span style="color: #94a3b8; font-weight: 600;">Author:</span> ${ping.pulse.author}</div>
          </div>
        </div>
      `,
        { className: "custom-popup" },
      )

      // Store reference for cleanup
      pingsRef.current.push({ marker: movingMarker, ping })

      // Animate the marker along the path
      const animateMarker = () => {
        const progress = ping.progress
        const lat = ping.pulse.source.lat + (ping.pulse.target.lat - ping.pulse.source.lat) * progress
        const lng = ping.pulse.source.lng + (ping.pulse.target.lng - ping.pulse.source.lng) * progress

        movingMarker.setLatLng([lat, lng])

        if (progress >= 1) {
          // Remove from map when animation completes
          if (mapRef.current) {
            mapRef.current.removeLayer(movingMarker)
          }
          pingsRef.current = pingsRef.current.filter((p) => p.ping.id !== ping.id)
        }
      }

      // Start animation
      const animationInterval = setInterval(() => {
        animateMarker()
        if (ping.progress >= 1) {
          clearInterval(animationInterval)
        }
      }, 50)
    } catch (error) {
      console.error("Error adding ping to map:", error)
    }
  }

  useEffect(() => {
    const loadThreatData = async () => {
      const threatPulses = await fetchOTXPulses()
      const sortedPulses = threatPulses.sort((a, b) => SEVERITY_PRIORITY[b.severity] - SEVERITY_PRIORITY[a.severity])
      setPulses(sortedPulses)

      // Calculate enhanced stats
      const uniqueCountries = new Set([
        ...sortedPulses.map((p) => p.source.country),
        ...sortedPulses.map((p) => p.target.country),
      ])

      const newStats = sortedPulses.reduce(
        (acc, pulse) => {
          acc.total++
          acc[pulse.severity.toLowerCase() as keyof typeof acc]++
          return acc
        },
        { total: 0, critical: 0, high: 0, medium: 0, low: 0, activePings: 0, countries: uniqueCountries.size },
      )
      setStats(newStats)
    }

    loadThreatData()
    const interval = setInterval(loadThreatData, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (!isPlaying || pulses.length === 0 || !mapLoaded) return

    const animate = () => {
      const now = Date.now()

      // Continuously add new pings every 1.5 seconds
      if (pulses.length > 0 && Math.random() < 0.3) {
        const pulse = pulses[pulseIndexRef.current % pulses.length]
        const duration = 5000 + Math.random() * 3000 // 5-8 seconds

        const newPing = {
          id: `ping-${now}-${Math.random()}`,
          pulse,
          progress: 0,
          startTime: now,
          duration,
        }

        setAnimatedPings((prev) => [...prev, newPing])
        addPingToMap(newPing)
        pulseIndexRef.current++
      }

      // Update ping animations and remove completed ones
      setAnimatedPings((prev) => {
        const updated = prev
          .map((ping) => ({
            ...ping,
            progress: Math.min(1, (now - ping.startTime) / ping.duration),
          }))
          .filter((ping) => ping.progress < 1)

        // Update active pings count
        setStats((prevStats) => ({ ...prevStats, activePings: updated.length }))

        return updated
      })

      animationRef.current = requestAnimationFrame(animate)
    }

    animationRef.current = requestAnimationFrame(animate)
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [isPlaying, pulses, mapLoaded])

  const togglePlayback = () => {
    setIsPlaying(!isPlaying)
  }

  const resetAnimation = () => {
    setAnimatedPings([])
    pulseIndexRef.current = 0
    // Clear all pings from map
    pingsRef.current.forEach(({ polyline, marker }) => {
      if (mapRef.current) {
        mapRef.current.removeLayer(polyline)
        mapRef.current.removeLayer(marker)
      }
    })
    pingsRef.current = []
  }

  return (
    <div className="dark w-full min-h-screen bg-slate-950 text-white">
      {/* Professional Header */}
      <div className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-600 rounded-lg">
                  <Shield className="w-6 h-6" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">CyberThreat Intelligence Platform</h1>
                  <p className="text-sm text-slate-400">
                    Carte Interactive • Surveillance Globale des Menaces • AlienVault OTX
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2 px-3 py-1 bg-slate-800 rounded-full">
                {isConnected ? (
                  <>
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <Wifi className="w-4 h-4 text-green-500" />
                    <span className="text-xs text-green-400 font-medium">LIVE</span>
                  </>
                ) : (
                  <>
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <WifiOff className="w-4 h-4 text-red-500" />
                    <span className="text-xs text-red-400 font-medium">OFFLINE</span>
                  </>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-3">
              {lastUpdate && (
                <div className="flex items-center space-x-2 text-xs text-slate-400">
                  <Clock className="w-4 h-4" />
                  <span>Dernière MAJ: {lastUpdate.toLocaleTimeString()}</span>
                </div>
              )}
              <div className="flex space-x-2">
                <Button onClick={togglePlayback} variant="outline" size="sm" className="border-slate-600">
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  {isPlaying ? "Pause" : "Play"}
                </Button>
                <Button onClick={resetAnimation} variant="outline" size="sm" className="border-slate-600">
                  <RotateCcw className="w-4 h-4" />
                  Reset
                </Button>
                <Button
                  onClick={() => window.location.reload()}
                  variant="outline"
                  size="sm"
                  className="border-slate-600"
                >
                  <Activity className="w-4 h-4" />
                  Actualiser
                </Button>
              </div>
            </div>
          </div>

          {error && (
            <div className="mt-3 flex items-center space-x-2 text-red-400 text-sm bg-red-950/20 border border-red-900/30 rounded-lg px-3 py-2">
              <AlertTriangle className="w-4 h-4" />
              <span>{error}</span>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Enhanced Stats Dashboard */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
          <Card className="bg-slate-900 border-slate-700 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-600/20 rounded-lg">
                  <Globe className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">{stats.total}</div>
                  <div className="text-xs text-slate-400 font-medium">Total Menaces</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-slate-700 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-red-600/20 rounded-lg">
                  <AlertTriangle className="w-5 h-5 text-red-400" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-red-400">{stats.critical}</div>
                  <div className="text-xs text-slate-400 font-medium">Critique</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-slate-700 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-orange-600/20 rounded-lg">
                  <Target className="w-5 h-5 text-orange-400" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-orange-400">{stats.high}</div>
                  <div className="text-xs text-slate-400 font-medium">Élevé</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-slate-700 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-yellow-600/20 rounded-lg">
                  <Activity className="w-5 h-5 text-yellow-400" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-yellow-400">{stats.medium}</div>
                  <div className="text-xs text-slate-400 font-medium">Moyen</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-slate-700 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-600/20 rounded-lg">
                  <Shield className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-400">{stats.low}</div>
                  <div className="text-xs text-slate-400 font-medium">Faible</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-slate-700 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-600/20 rounded-lg">
                  <Users className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-400">{attackSources.length}</div>
                  <div className="text-xs text-slate-400 font-medium">Sources Actives</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-slate-700 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-600/20 rounded-lg">
                  <Shield className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-400">{stats.low}</div>
                  <div className="text-xs text-slate-400 font-medium">Faible</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-slate-700 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-600/20 rounded-lg">
                  <Activity className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-400">{stats.activePings}</div>
                  <div className="text-xs text-slate-400 font-medium">Pings Actifs</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-slate-700 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-cyan-600/20 rounded-lg">
                  <Users className="w-5 h-5 text-cyan-400" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-cyan-400">{stats.countries}</div>
                  <div className="text-xs text-slate-400 font-medium">Pays</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Interactive Leaflet Map */}
          <Card className="lg:col-span-3 bg-slate-900 border-slate-700 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold text-white flex items-center space-x-2">
                  <Globe className="w-5 h-5" />
                  <span>Carte Interactive des Menaces Mondiales</span>
                </CardTitle>
                <div className="flex items-center space-x-4 text-xs text-slate-400">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full shadow-lg shadow-green-500/30"></div>
                    <span>Honeypots ({honeypots.length})</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full shadow-lg shadow-red-500/30"></div>
                    <span>Sources d'Attaque</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Layers className="w-4 h-4" />
                    <span>Leaflet • OpenStreetMap</span>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="relative bg-slate-950 rounded-lg overflow-hidden" style={{ height: "600px" }}>
                <div id="threat-map" className="w-full h-full rounded-lg"></div>
                {!mapLoaded && (
                  <div className="absolute inset-0 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                      <p className="text-slate-400">Chargement de la carte interactive...</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Enhanced Threat Feed */}
          <Card className="bg-slate-900 border-slate-700 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-semibold text-white flex items-center space-x-2">
                <Activity className="w-5 h-5" />
                <span>Flux de Menaces en Direct</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-[500px] overflow-y-auto custom-scrollbar">
                {pulses.slice(0, 15).map((pulse) => {
                  const severityConfig: Record<string, { bgColor: string; textColor: string }> = {
                    Critical: { bgColor: "#dc2626", textColor: "#ffffff" },
                    High: { bgColor: "#ea580c", textColor: "#ffffff" },
                    Medium: { bgColor: "#d97706", textColor: "#ffffff" },
                    Low: { bgColor: "#16a34a", textColor: "#ffffff" },
                  }
                  const config = severityConfig[pulse.severity]

                  return (
                    <div
                      key={pulse.id}
                      className="p-4 bg-slate-900/60 rounded-lg border border-slate-700 hover:border-slate-600 transition-colors cursor-pointer"
                      onClick={() => setSelectedThreat(pulse)}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <Badge
                          className="text-xs font-medium text-white"
                          style={{
                            backgroundColor: config.bgColor,
                            color: config.textColor,
                          }}
                        >
                          {pulse.severity === "Critical"
                            ? "Critique"
                            : pulse.severity === "High"
                              ? "Élevé"
                              : pulse.severity === "Medium"
                                ? "Moyen"
                                : "Faible"}
                        </Badge>
                        <span className="text-xs text-gray-200">{pulse.timestamp.toLocaleTimeString()}</span>
                      </div>

                      <div className="text-sm font-medium mb-2 text-white line-clamp-2">{pulse.name}</div>
                      <div className="text-xs text-gray-200 mb-3 line-clamp-2">{pulse.description}</div>

                      <div className="flex items-center justify-between text-xs mb-2">
                        <div className="flex items-center space-x-1">
                          <span className="text-red-400 font-mono text-gray-300">
                            {pulse.source.city}, {pulse.source.country}
                          </span>
                          <span className="text-slate-500">→</span>
                          <span className="text-green-400 text-gray-200">
                            {pulse.target.city}, {pulse.target.country}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-300">{pulse.indicators} indicateurs</span>
                        <span className="text-gray-300">par {pulse.author}</span>
                      </div>

                      {pulse.adversary && pulse.adversary !== "Unknown" && (
                        <div className="text-xs text-orange-400 mt-2 font-medium">Adversaire: {pulse.adversary}</div>
                      )}

                      {pulse.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {pulse.tags.slice(0, 3).map((tag, index) => (
                            <span key={index} className="text-xs bg-slate-700 text-gray-100 px-2 py-1 rounded">
                              {tag}
                            </span>
                          ))}
                          {pulse.tags.length > 3 && <span className="text-xs text-gray-300">+{pulse.tags.length - 3}</span>}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Legend */}
        <Card className="bg-slate-900 border-slate-700 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex flex-wrap items-center justify-between gap-8">
              <div className="flex flex-wrap items-center gap-8">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-green-500 rounded-full shadow-lg shadow-green-500/30"></div>
                  <span className="text-sm font-medium text-white">Honeypots & Systèmes de Défense</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full shadow-lg shadow-red-500/30"></div>
                  <span className="text-sm font-medium text-white">Sources d'Attaque</span>
                </div>
                {Object.entries(SEVERITY_COLORS).map(([severity, color]) => (
                  <div key={severity} className="flex items-center space-x-2">
                    <div
                      className="w-3 h-3 rounded-full shadow-lg"
                      style={{
                        backgroundColor: color,
                        boxShadow: `0 0 10px ${color}30`,
                      }}
                    ></div>
                    <span className="text-sm font-medium text-white">
                      Menaces{" "}
                      {severity === "Critical"
                        ? "Critiques"
                        : severity === "High"
                          ? "Élevées"
                          : severity === "Medium"
                            ? "Moyennes"
                            : "Faibles"}
                    </span>
                  </div>
                ))}
              </div>
              <div className="text-xs text-gray-200 whitespace-nowrap">
                Propulsé par AlienVault OTX • Intelligence des Menaces en Temps Réel • Leaflet Maps
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #1e293b;
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #475569;
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #64748b;
        }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  )
}
