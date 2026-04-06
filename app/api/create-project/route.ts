/**
 * Create a new project — provisions an oncell cell.
 * POST /api/create-project { projectId }
 *   → POST api.oncell.ai/api/v1/cells { customer_id }
 *   → Returns cell_id for preview URL
 */

const ONCELL_API = process.env.ONCELL_API_URL || "https://api.oncell.ai";
const ONCELL_KEY = process.env.ONCELL_API_KEY || "";

export async function POST(req: Request) {
  const { projectId } = await req.json();

  if (!projectId) {
    return Response.json({ error: "projectId required" }, { status: 400 });
  }

  const res = await fetch(`${ONCELL_API}/api/v1/cells`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${ONCELL_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ customer_id: projectId }),
  });

  const cell = await res.json();

  return Response.json({
    cellId: cell.cell_id,
    status: cell.status,
    previewUrl: cell.cell_id ? `https://${cell.cell_id}.cells.oncell.ai` : null,
  });
}
