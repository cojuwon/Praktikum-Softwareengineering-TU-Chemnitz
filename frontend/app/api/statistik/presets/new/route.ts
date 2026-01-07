export async function POST(req: Request) {
  const body = await req.json();

  console.log("Preset gespeichert:", body);

  // Simuliere ein gespeichertes Preset
  return Response.json({
    id: Math.floor(Math.random() * 1000), // zufällige ID
    ...body
  });
}
