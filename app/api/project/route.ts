/**
 * Get project status from oncell cell.
 * Uses @oncell/sdk.
 */

import { OnCell } from "@oncell/sdk";

const oncell = new OnCell({
  apiKey: process.env.ONCELL_API_KEY,
  baseUrl: process.env.ONCELL_API_URL,
});

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const projectId = searchParams.get("id");

  if (!projectId) {
    return Response.json({ error: "id required" }, { status: 400 });
  }

  const res = await oncell.cells.agentRequest(projectId, "status", {});
  const data = await res.json();
  return Response.json(data);
}
