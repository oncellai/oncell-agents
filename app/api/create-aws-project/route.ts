/**
 * Create an AWS infrastructure project — provisions an oncell cell with the AWS golden paths agent.
 */

import { OnCell } from "@oncell/sdk";

const oncell = new OnCell({
  apiKey: process.env.ONCELL_API_KEY,
  baseUrl: process.env.ONCELL_API_URL,
});

const AGENT_CODE = `
const SYSTEM_PROMPT = \`You are an expert AWS Solutions Architect and CDK developer. Generate production-ready AWS CDK v2 (TypeScript) infrastructure code.

GOLDEN PATHS — use these opinionated defaults unless the user says otherwise:

WEB APP:
  CloudFront → ALB → ECS Fargate (min 1, max 10, CPU target 70%)
  → Aurora Serverless v2 (0.5-8 ACU, auto-pause after 5 min)
  → ElastiCache Redis (cache.t4g.micro)
  → VPC with 2 AZs, no NAT (use VPC endpoints)

API:
  API Gateway HTTP → Lambda (ARM64, 256MB, 30s timeout)
  → DynamoDB (PAY_PER_REQUEST, point-in-time recovery)
  → Optional: SQS for async processing

STATIC SITE:
  S3 (private, versioned) → CloudFront (OAC, custom domain, redirect www)
  → Route 53 → ACM cert (us-east-1)

BACKGROUND JOBS:
  EventBridge rule → SQS (DLQ after 3 retries) → Lambda

DATA PIPELINE:
  S3 (landing zone) → Lambda (transform) → S3 (processed) → Athena (query)
  OR: Kinesis → Lambda → DynamoDB/S3

SECURITY (always apply):
  - KMS encryption at rest for ALL data stores
  - Secrets Manager for ALL credentials (never Parameter Store for secrets)
  - Private subnets for databases and internal services
  - WAF on CloudFront/ALB for public-facing
  - VPC Flow Logs to CloudWatch
  - IAM least-privilege (no Action: "*")
  - S3 Block Public Access on all buckets

COST OPTIMIZATION:
  - No NAT Gateway ($45/mo saved) — use S3/DynamoDB VPC Gateway endpoints
  - Aurora auto-pause for dev/staging
  - Fargate Spot for non-critical workloads
  - Reserved capacity for production (1yr, no upfront)
  - Add CloudWatch alarms for billing anomalies
  - Include CfnOutput with estimated monthly cost

MONITORING (always include):
  - CloudWatch dashboard with key metrics
  - Alarms: CPU > 80%, memory > 80%, 5xx > 1%, latency p99 > 1s
  - X-Ray tracing on Lambda and API Gateway
  - CloudWatch Logs with 30-day retention

CDK PATTERNS:
  - Use L2 constructs (not Cfn)
  - Stack per concern (NetworkStack, DataStack, ComputeStack, MonitoringStack)
  - Share via props, not Fn.importValue
  - Use cdk.Tags.of(this).add() for cost allocation tags
  - RemovalPolicy.RETAIN for production data stores
  - RemovalPolicy.DESTROY for dev/staging

RESPONSE FORMAT:
1. Architecture summary (3-5 sentences): what services, how they connect, estimated monthly cost
2. Each file with delimiters:

---FILE bin/app.ts---
#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
// ...
---ENDFILE---

---FILE lib/stacks/network.ts---
import * as cdk from 'aws-cdk-lib';
// ...
---ENDFILE---

3. Summary line: "Summary: Created N stacks — [list]. Estimated cost: $X-Y/mo"

CRITICAL:
- Output COMPLETE files — no placeholders, no "// ... rest of code", no truncation
- Every stack must compile standalone with proper imports
- Include package.json and cdk.json
- Include a README.md with deploy instructions and architecture diagram (ASCII)\`;

module.exports = {
  async generate(ctx, params) {
    const instruction = params.instruction;
    if (!instruction) return { error: "instruction required" };

    const OPENROUTER_KEY = process.env.OPENROUTER_KEY;
    const MODEL = process.env.MODEL || "google/gemini-2.5-flash";
    if (!OPENROUTER_KEY) return { error: "OPENROUTER_KEY not configured" };

    ctx.journal.step("start", "Designing AWS architecture: " + instruction);

    // Load existing files for iteration
    const existingFiles = ctx.store.list();
    let codeContext = "";
    for (const f of existingFiles.filter(f => f.endsWith(".ts") || f.endsWith(".json") || f.endsWith(".md")).slice(0, 15)) {
      const content = ctx.store.read(f);
      if (content && content.length < 8000) {
        codeContext += "\\n--- " + f + " ---\\n" + content + "\\n";
      }
    }

    const history = ctx.db.get("conversation") || [];
    const messages = [{ role: "system", content: SYSTEM_PROMPT }];
    for (const msg of history.slice(-4)) messages.push(msg);

    let userMsg = instruction;
    if (codeContext) userMsg = "Existing infrastructure:\\n" + codeContext + "\\n\\nNew requirement: " + instruction;
    messages.push({ role: "user", content: userMsg });

    ctx.stream({ status: "designing", instruction: instruction.substring(0, 100) });

    const https = require("https");
    const fullResponse = await new Promise((resolve, reject) => {
      let result = "";
      let buf = "";
      const payload = JSON.stringify({ model: MODEL, messages, temperature: 0.2, stream: true, max_tokens: 16000 });
      const req = https.request({
        hostname: "openrouter.ai",
        path: "/api/v1/chat/completions",
        method: "POST",
        headers: {
          "Authorization": "Bearer " + OPENROUTER_KEY,
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(payload),
        },
      }, (res) => {
        res.on("data", (chunk) => {
          buf += chunk.toString();
          const lines = buf.split("\\n");
          buf = lines.pop() || "";
          for (const line of lines) {
            if (!line.startsWith("data: ") || line.trim() === "data: [DONE]") continue;
            try {
              const parsed = JSON.parse(line.slice(6));
              const text = parsed.choices?.[0]?.delta?.content;
              if (text) { result += text; ctx.stream({ text }); }
            } catch {}
          }
        });
        res.on("end", () => resolve(result));
        res.on("error", reject);
      });
      req.on("error", reject);
      req.write(payload);
      req.end();
    });

    // Parse ---FILE/---ENDFILE blocks
    const fileRegex = /---FILE\\s+(.+?)---([\\s\\S]*?)---ENDFILE---/g;
    let match;
    const writtenFiles = [];

    while ((match = fileRegex.exec(fullResponse)) !== null) {
      const path = match[1].trim();
      const content = match[2].trim();
      if (path && content) {
        ctx.store.write(path, content);
        writtenFiles.push({ path, lines: content.split("\\n").length });
        ctx.stream({ event: "file-written", path, lines: content.split("\\n").length });
        ctx.journal.step("write", "Wrote " + path);
      }
    }

    // Extract architecture summary (text before first ---FILE)
    const summary = fullResponse.split("---FILE")[0].trim();

    // Generate preview page
    const stacks = writtenFiles.filter(f => f.path.includes("lib/stacks/")).map(f => f.path.split("/").pop()?.replace(".ts", "")).filter(Boolean);
    const previewHtml = generatePreview(summary, writtenFiles, stacks);
    ctx.store.write("index.html", previewHtml);

    // Save conversation
    history.push({ role: "user", content: instruction });
    history.push({ role: "assistant", content: summary });
    ctx.db.set("conversation", history);

    // Track stats
    const stats = ctx.db.get("stats") || { totalGenerations: 0, totalFiles: 0, stacks: [] };
    stats.totalGenerations++;
    stats.totalFiles += writtenFiles.length;
    stats.stacks = [...new Set([...stats.stacks, ...stacks])];
    ctx.db.set("stats", stats);

    ctx.journal.step("done", "Generated " + writtenFiles.length + " files, " + stacks.length + " stacks");
    return { files: writtenFiles, stacks, summary, count: writtenFiles.length };
  },

  async getFiles(ctx) {
    const files = ctx.store.list();
    const result = {};
    for (const f of files) {
      if (f !== "index.html") {
        result[f] = ctx.store.read(f);
      }
    }
    return { files: result };
  },

  async getStats(ctx) {
    return ctx.db.get("stats") || { totalGenerations: 0, totalFiles: 0, stacks: [] };
  },
};

function generatePreview(summary, files, stacks) {
  const fileRows = files.map(f => '<tr class="border-b border-zinc-800"><td class="py-2 px-3 font-mono text-sm text-emerald-400">' + f.path + '</td><td class="py-2 px-3 text-right text-zinc-500 text-sm">' + f.lines + ' lines</td></tr>').join("");
  const stackBadges = stacks.map(s => '<span class="px-2 py-1 bg-orange-500/10 text-orange-400 rounded text-xs font-mono">' + s + '</span>').join(" ");

  return \`<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>AWS Infrastructure — OnCell</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-zinc-950 text-zinc-100 min-h-screen">
  <div class="max-w-4xl mx-auto px-6 py-12">
    <div class="flex items-center gap-3 mb-8">
      <div class="w-10 h-10 bg-gradient-to-br from-orange-500 to-amber-600 rounded-lg flex items-center justify-center">
        <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/>
        </svg>
      </div>
      <div>
        <h1 class="text-2xl font-bold">AWS Infrastructure</h1>
        <p class="text-zinc-500 text-sm">Generated by OnCell</p>
      </div>
    </div>

    <div class="bg-zinc-900 rounded-xl border border-zinc-800 p-6 mb-6">
      <h2 class="text-lg font-semibold mb-3">Architecture</h2>
      <p class="text-zinc-400 leading-relaxed whitespace-pre-line">\${summary || "Infrastructure generated"}</p>
    </div>

    <div class="flex gap-2 mb-6 flex-wrap">\${stackBadges}</div>

    <div class="bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden mb-6">
      <div class="px-4 py-3 border-b border-zinc-800 flex items-center justify-between">
        <h2 class="font-semibold">Generated Files</h2>
        <span class="text-zinc-500 text-sm">\${files.length} files</span>
      </div>
      <table class="w-full">\${fileRows}</table>
    </div>

    <div class="bg-blue-950/30 border border-blue-800/30 rounded-xl p-5">
      <h3 class="font-semibold text-blue-300 mb-2">Deploy</h3>
      <div class="space-y-2 text-sm font-mono text-blue-200">
        <p>npm install</p>
        <p>npx cdk bootstrap  <span class="text-blue-400/50"># first time only</span></p>
        <p>npx cdk deploy --all</p>
      </div>
    </div>

    <p class="mt-8 text-zinc-600 text-xs text-center">Generated by OnCell AWS Infrastructure Agent — oncell.ai</p>
  </div>
</body>
</html>\`;
}
`;

export async function POST(req: Request) {
  const { projectId } = await req.json();
  if (!projectId) return Response.json({ error: "projectId required" }, { status: 400 });

  const cell = await oncell.cells.create({
    customerId: projectId,
    tier: "starter",
    agent: AGENT_CODE,
    secrets: {
      OPENROUTER_KEY: process.env.OPENROUTER_API_KEY || "",
      MODEL: process.env.MODEL || "google/gemini-2.5-flash",
    },
  });

  return Response.json({
    cellId: cell.id,
    status: cell.status,
    previewUrl: cell.previewUrl,
  });
}
