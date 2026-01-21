import { apiFetch } from '@/lib/api';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const body = await request.json();
  const backendUrl =
    process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  try {
    const response = await apiFetch(
      `${backendUrl}/api/auth/registration/`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      }
    );

    const text = await response.text();

    let data;
    try {
      data = JSON.parse(text);
    } catch {
      console.error('Non-JSON response from backend:', text);
      return NextResponse.json(
        { error: 'Invalid backend response' },
        { status: 500 }
      );
    }

    return NextResponse.json(data, { status: response.status });

  } catch (error) {
    console.error('Register proxy error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}


/*import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const body = await request.json();
  const backendUrl =
    process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  try {
    const response = await fetch(`${backendUrl}/api/auth/registration/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const text = await response.text();

    let data;
    try {
      data = JSON.parse(text);
    } catch {
      console.error('Non-JSON response from backend:', text);
      return NextResponse.json(
        { error: 'Invalid backend response' },
        { status: 500 }
      );
    }

    return NextResponse.json(data, { status: response.status });

  } catch (error) {
    console.error('Register proxy error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

*/

/*import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const body = await request.json();
  const backendUrl =
    process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  try {
    const response = await fetch(`${backendUrl}/api/auth/register/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Register proxy error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}*/
