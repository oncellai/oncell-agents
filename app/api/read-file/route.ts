const ONCELL_API = process.env.ONCELL_API_URL || "https://api.oncell.ai";
const ONCELL_KEY = process.env.ONCELL_API_KEY || "";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const projectId = searchParams.get("projectId");
  const path = searchParams.get("path");

  if (!projectId || !path) {
    return Response.json({ error: "projectId and path required" }, { status: 400 });
  }

  const res = await fetch(`${ONCELL_API}/api/v1/agents/read_file`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${ONCELL_KEY}`,
      "Content-Type": "application/json",
      "X-Customer-ID": projectId,
    },
    body: JSON.stringify({ path }),
  });

  const data = await res.json();
  return Response.json(data);
}
