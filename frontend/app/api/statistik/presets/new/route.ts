import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json();
  const cookies = req.headers.get("cookie");
  const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  try {
    // Map frontend format to backend Preset model fields
    // Frontend sends: { name, preset_type, filters }
    // Backend expects: { preset_beschreibung, filterKriterien, preset_daten }
    const backendPayload = {
      preset_beschreibung: body.name,
      filterKriterien: body.filters || {},
      preset_daten: {} // Can be empty or contain additional data fields selection
    };

    const response = await fetch(`${backendUrl}/api/presets/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: cookies || "",
      },
      body: JSON.stringify(backendPayload),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Failed to create preset:', response.status, errorData);
      return NextResponse.json({ error: "Failed to create preset", details: errorData }, { status: response.status });
    }

    const savedPreset = await response.json();
    
    // Map backend response back to frontend format
    return NextResponse.json({
      id: savedPreset.preset_id,
      name: savedPreset.preset_beschreibung,
      preset_type: body.preset_type, // Use the requested type from frontend
      filters: savedPreset.filterKriterien
    });
  } catch (error) {
    console.error('Preset creation proxy error:', error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
