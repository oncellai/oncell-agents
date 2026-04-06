/**
 * Proxy to the agent running inside the oncell cell.
 * Supports all three agent response modes:
 *   - Sync/Async → JSON response (forwarded as-is)
 *   - Streaming → SSE (forwarded as-is)
 */

const ONCELL_API = process.env.ONCELL_API_URL || "https://api.oncell.ai";
const ONCELL_KEY = process.env.ONCELL_API_KEY || "";

export async function POST(req: Request) {
  const { instruction, projectId } = await req.json();

  if (!instruction || !projectId) {
    return Response.json({ error: "instruction and projectId required" }, { status: 400 });
  }

  const res = await fetch(`${ONCELL_API}/api/v1/agents/generate`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${ONCELL_KEY}`,
      "Content-Type": "application/json",
      "X-Customer-ID": projectId,
    },
    body: JSON.stringify({ instruction }),
  });

  // Forward the response as-is (JSON or SSE stream)
  return new Response(res.body, {
    status: res.status,
    headers: {
      "Content-Type": res.headers.get("content-type") || "application/json",
      "Cache-Control": "no-cache",
    },
  });
}
