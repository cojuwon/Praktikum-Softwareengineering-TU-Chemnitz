// fake endpoint zum testen vom Login

import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { email, password } = await request.json();

  const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  try {
    const response = await fetch(`${backendUrl}/api/auth/login/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    const res = NextResponse.json(data, { status: 200 });

    // Forward cookies from backend to client
    const setCookieHeader = response.headers.get('set-cookie');
    if (setCookieHeader) {
      // Split multiple cookies if necessary, though usually fetch merges them or we handle the string
      // Next.js NextResponse headers.set('set-cookie', ...) might overwrite.
      // A safe way is to parse and set individually, but for a simple proxy:
      res.headers.set('set-cookie', setCookieHeader);
    }

    return res;
  } catch (error) {
    console.error('Login proxy error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

