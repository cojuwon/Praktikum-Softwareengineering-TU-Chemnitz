// fake endpoint zum testen vom Login

import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { email, password } = await request.json();

  let user = null;

  if (email === "friedakahlo@nextmail.com" && password === "123456") {
    user = {
      vorname_mb: "Frieda",
      nachname_mb: "Kahlo",
      mail_mb: email,
      rolle_mb: "Basis"
    };
  }

  if (email === "jenniferlawrence@nextmail.com" && password === "123456") {
    user = {
      vorname_mb: "Jennifer",
      nachname_mb: "Lawrence",
      mail_mb: email,
      rolle_mb: "Erweiterung"
    };
  }

  if (email === "mariecurie@nextmail.com" && password === "123456") {
    user = {
      vorname_mb: "Marie",
      nachname_mb: "Curie",
      mail_mb: email,
      rolle_mb: "Admin"
    };
  }

  if (!user) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  // Token simulieren
  const fakeToken = "test-token-" + Date.now();

  // Cookie setzen
  const response = NextResponse.json({
    detail: "Successfully logged in"
  });

  response.cookies.set("my-app-auth", fakeToken, {
    httpOnly: true,
    sameSite: "lax",
    secure: false,        // <-- WICHTIG LOKAL!
    path: "/"
    });



  // Zusätzlich speichern wir den User in einem dev-Fake-Cookie
  response.cookies.set("fake-user", JSON.stringify(user), {
    httpOnly: false, // muss nicht sicher sein – nur zum Testen
    path: "/"
  });

  return response;
}

