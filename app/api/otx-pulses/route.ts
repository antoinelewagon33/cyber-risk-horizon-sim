import { type NextRequest, NextResponse } from "next/server"

const OTX_API_BASE = "https://otx.alienvault.com/api/v1"

export async function GET(request: NextRequest) {
  try {
    const apiKey = process.env.OTX_API_KEY

    if (!apiKey) {
      return NextResponse.json({ error: "OTX API key not configured" }, { status: 500 })
    }

    // Fetch recent pulses from OTX
    const response = await fetch(`${OTX_API_BASE}/pulses/subscribed?limit=50&page=1`, {
      headers: {
        "X-OTX-API-KEY": apiKey,
        "Content-Type": "application/json",
      },
      next: { revalidate: 300 }, // Cache for 5 minutes
    })

    if (!response.ok) {
      throw new Error(`OTX API error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()

    // If no subscribed pulses, fall back to recent public pulses
    if (!data.results || data.results.length === 0) {
      const publicResponse = await fetch(`${OTX_API_BASE}/pulses/activity?limit=50`, {
        headers: {
          "X-OTX-API-KEY": apiKey,
          "Content-Type": "application/json",
        },
        next: { revalidate: 300 },
      })

      if (!publicResponse.ok) {
        throw new Error(`OTX API error: ${publicResponse.status} ${publicResponse.statusText}`)
      }

      const publicData = await publicResponse.json()
      return NextResponse.json(publicData)
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching OTX pulses:", error)

    // Return fallback data if API fails
    const fallbackData = {
      results: [
        {
          id: "fallback-1",
          name: "API Connection Error - Using Fallback Data",
          description: "Unable to connect to OTX API. Displaying sample threat data.",
          created: new Date().toISOString(),
          modified: new Date().toISOString(),
          author_name: "System",
          public: 1,
          adversary: "",
          targeted_countries: [],
          malware_families: ["connection-error"],
          attack_ids: [],
          industries: [],
          tags: ["system", "error"],
          references: [],
          indicators: [],
        },
      ],
    }

    return NextResponse.json(fallbackData, {
      status: 200,
      headers: {
        "X-Fallback-Data": "true",
      },
    })
  }
}
