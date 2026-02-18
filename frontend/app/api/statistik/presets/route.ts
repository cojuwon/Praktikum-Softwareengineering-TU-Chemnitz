import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const cookies = request.headers.get("cookie");
  const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  try {
    // First, get current user info to determine preset ownership
    let currentUserId: number | null = null;
    try {
      const userResponse = await fetch(`${backendUrl}/api/auth/user/`, {
        headers: cookies ? { Cookie: cookies } : {},
      });
      if (userResponse.ok) {
        const userData = await userResponse.json();
        currentUserId = userData.konto_id;
      }
    } catch (e) {
      console.warn('Could not fetch current user for preset type determination:', e);
    }

    // Fetch presets from backend
    const response = await fetch(`${backendUrl}/api/presets/`, {
      headers: cookies ? { Cookie: cookies } : {},
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
      // Determine preset type based on ownership and sharing
      let preset_type = "user"; // Default to user's own preset
      
      // Check if current user is the creator
      const isCreator = currentUserId !== null && preset.ersteller === currentUserId;
      
      // If preset has berechtigte (shared with others), determine shared status
      // berechtigte is an array of user IDs
      if (preset.berechtigte && Array.isArray(preset.berechtigte) && preset.berechtigte.length > 0) {
        if (isCreator) {
          // Creator has shared this preset with others
          preset_type = "shared";
        } else if (currentUserId !== null && preset.berechtigte.includes(currentUserId)) {
          // This preset was shared with the current user (not the creator)
          preset_type = "shared";
        }
      }
      
      // TODO: Add logic to identify system presets
      // System presets could be identified by a specific flag or creator ID
      
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
