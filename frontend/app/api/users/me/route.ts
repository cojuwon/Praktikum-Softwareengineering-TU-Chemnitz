// /app/api/users/me/route.ts
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const cookies = request.headers.get("cookie");

  if (!cookies?.includes("my-app-auth=")) {
    return NextResponse.json(
      { error: "Not authenticated" },
      { status: 401 }
    );
  }

  // Fake User aus Cookie holen
  const fakeUserCookie = cookies
    .split("; ")
    .find((c) => c.startsWith("fake-user="));

  if (!fakeUserCookie) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const user = JSON.parse(decodeURIComponent(fakeUserCookie.split("=")[1]));

  return NextResponse.json(user);
}
