// /app/api/users/me/route.ts
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const cookies = request.headers.get("cookie");
  const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  try {
    const response = await fetch(`${backendUrl}/api/auth/user/`, {
      headers: {
        Cookie: cookies || "",
      },
    });

    if (!response.ok) {
      return NextResponse.json({ error: "Not authenticated" }, { status: response.status });
    }

    const user = await response.json();
    return NextResponse.json(user);
  } catch (error) {
    console.error('User me proxy error:', error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
