/**
 * Read a file from an oncell cell.
 * Uses @oncell/sdk.
 */

import { OnCell } from "@oncell/sdk";

const oncell = new OnCell({
  apiKey: process.env.ONCELL_API_KEY,
  baseUrl: process.env.ONCELL_API_URL,
});

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const projectId = searchParams.get("projectId");
  const path = searchParams.get("path");

  if (!projectId || !path) {
    return Response.json({ error: "projectId and path required" }, { status: 400 });
  }

  // Use agentRequest to read file via the cell's agent runtime
  const res = await oncell.cells.agentRequest(projectId, "read_file", { path });
  const data = await res.json();
  return Response.json(data);
}
