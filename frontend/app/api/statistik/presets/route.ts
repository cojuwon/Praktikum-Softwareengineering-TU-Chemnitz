import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const cookies = request.headers.get("cookie");
  const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  try {
    const response = await fetch(`${backendUrl}/api/presets/`, {
      headers: {
        Cookie: cookies || "",
      },
    });

    if (!response.ok) {
      console.error('Failed to fetch presets:', response.status);
      return NextResponse.json({ presets: [] }, { status: response.status });
    }

    const backendPresets = await response.json();
    
    // Map backend Preset model to frontend format
    // Backend fields: preset_id, preset_daten, preset_beschreibung, filterKriterien, ersteller, berechtigte
    // Frontend expects: id, name, preset_type, filters
    const presets = backendPresets.map((preset: any) => {
      // Determine preset type based on sharing
      let preset_type = "user"; // Default to user's own preset
      
      // If preset has berechtigte (shared with others), mark as shared
      if (preset.berechtigte && preset.berechtigte.length > 0) {
        preset_type = "shared";
      }
      
      // TODO: Add logic to identify system presets if needed
      // For now, system presets could be identified by a specific ersteller or flag
      
      return {
        id: preset.preset_id,
        name: preset.preset_beschreibung || `Preset ${preset.preset_id}`,
        preset_type: preset_type,
        filters: preset.filterKriterien || {}
      };
    });

    return NextResponse.json({ presets });
  } catch (error) {
    console.error('Presets proxy error:', error);
    return NextResponse.json({ presets: [] }, { status: 500 });
  }
}
