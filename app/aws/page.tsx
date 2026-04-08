"use client";

import { useState, useRef, useEffect } from "react";

const CELLS_DOMAIN = process.env.NEXT_PUBLIC_CELLS_DOMAIN || "cells.oncell.ai";

const GOLDEN_PATHS = [
  { label: "Web App", prompt: "Create a production web app: CloudFront CDN, ECS Fargate with auto-scaling, Aurora Serverless Postgres, ElastiCache Redis, with monitoring and alarms" },
  { label: "REST API", prompt: "Create a serverless REST API: API Gateway HTTP, Lambda (Node.js), DynamoDB with GSI, Cognito auth, with X-Ray tracing" },
  { label: "Static Site", prompt: "Create a static site stack: S3 private bucket, CloudFront with OAC, custom domain with Route 53 and ACM cert, www redirect" },
  { label: "Data Pipeline", prompt: "Create a data pipeline: S3 landing zone, Lambda transform, S3 processed zone, Athena for queries, EventBridge schedule, with cost alerts" },
  { label: "Microservices", prompt: "Create a microservices platform: VPC with 2 AZs, ECS Fargate cluster, shared ALB, Service Connect, CloudWatch container insights, auto-scaling per service" },
];

interface WrittenFile {
  path: string;
  lines: number;
}

export default function AWSPage() {
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [streamText, setStreamText] = useState("");
  const [files, setFiles] = useState<WrittenFile[]>([]);
  const [summary, setSummary] = useState("");
  const [projectId, setProjectId] = useState("");
  const [cellId, setCellId] = useState("");
  const [cellReady, setCellReady] = useState(false);
  const [creating, setCreating] = useState(false);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [fileContent, setFileContent] = useState("");
  const [tab, setTab] = useState<"stream" | "preview" | "files">("stream");
  const streamRef = useRef<HTMLDivElement>(null);

  const previewUrl = cellId ? `https://${cellId}.${CELLS_DOMAIN}` : "";

  useEffect(() => {
    if (streaming && streamRef.current) {
      streamRef.current.scrollTop = streamRef.current.scrollHeight;
    }
  }, [streamText, streaming]);

  async function ensureCell(): Promise<boolean> {
    if (cellReady) return true;
    setCreating(true);
    const id = projectId || `aws-${Date.now().toString(36)}`;
    setProjectId(id);
    try {
      const res = await fetch("/api/create-aws-project", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId: id }),
      });
      const data = await res.json();
      if (data.cellId) {
        setCellId(data.cellId);
        setCellReady(true);
        setCreating(false);
        return true;
      }
    } catch (err) {
      console.error("Failed to create cell:", err);
    }
    setCreating(false);
    return false;
  }

  async function handleGenerate(prompt?: string) {
    const instruction = prompt || input;
    if (!instruction.trim()) return;

    const ready = await ensureCell();
    if (!ready) return;

    setStreaming(true);
    setStreamText("");
    setFiles([]);
    setSummary("");
    setTab("stream");
    if (!prompt) setInput("");

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ instruction, projectId }),
      });

      if (!res.body) throw new Error("No response body");
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buf = "";
      let fullText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });
        const lines = buf.split("\n");
        buf = lines.pop() || "";

        for (const line of lines) {
          if (!line.trim()) continue;
          try {
            const data = JSON.parse(line);
            if (data.text) {
              fullText += data.text;
              setStreamText(fullText);
            }
            if (data.event === "file-written") {
              setFiles(prev => [...prev, { path: data.path, lines: data.lines }]);
            }
          } catch {}
        }
      }

      // Extract summary
      const summaryMatch = fullText.split("---FILE")[0]?.trim();
      if (summaryMatch) setSummary(summaryMatch);

      // Switch to preview after generation
      if (cellId) setTab("preview");

    } catch (err: any) {
      setStreamText(prev => prev + "\n\nError: " + err.message);
    }
    setStreaming(false);
  }

  async function viewFile(path: string) {
    setSelectedFile(path);
    try {
      const res = await fetch("/api/read-file", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId, path }),
      });
      const data = await res.json();
      setFileContent(data.content || "// File not found");
    } catch {
      setFileContent("// Failed to load file");
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      {/* Header */}
      <header className="border-b border-zinc-800 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-amber-600 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/>
              </svg>
            </div>
            <div>
              <h1 className="text-lg font-semibold">AWS Infrastructure Generator</h1>
              <p className="text-xs text-zinc-500">Powered by OnCell — production CDK in seconds</p>
            </div>
          </div>
          <a href="/" className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors">&larr; All Demos</a>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Golden Path Buttons */}
        <div className="mb-6">
          <p className="text-sm text-zinc-500 mb-3">Golden Paths — click to generate:</p>
          <div className="flex flex-wrap gap-2">
            {GOLDEN_PATHS.map((gp) => (
              <button
                key={gp.label}
                onClick={() => handleGenerate(gp.prompt)}
                disabled={streaming || creating}
                className="px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-sm text-zinc-300 hover:border-orange-500/50 hover:text-orange-300 transition-all disabled:opacity-50"
              >
                {gp.label}
              </button>
            ))}
          </div>
        </div>

        {/* Input */}
        <form onSubmit={(e) => { e.preventDefault(); handleGenerate(); }} className="mb-6">
          <div className="flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Describe your AWS infrastructure..."
              className="flex-1 px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-orange-500/50"
              disabled={streaming}
            />
            <button
              type="submit"
              disabled={streaming || !input.trim()}
              className="px-6 py-3 bg-orange-600 hover:bg-orange-500 disabled:bg-zinc-800 disabled:text-zinc-600 text-white font-medium rounded-xl transition-all"
            >
              {creating ? "Creating cell..." : streaming ? "Generating..." : "Generate"}
            </button>
          </div>
        </form>

        {/* Tabs */}
        <div className="flex gap-1 mb-4">
          {(["stream", "preview", "files"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                tab === t ? "bg-zinc-800 text-zinc-100" : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              {t === "stream" ? "Output" : t === "preview" ? "Preview" : `Files (${files.length})`}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden" style={{ minHeight: "500px" }}>
          {tab === "stream" && (
            <div ref={streamRef} className="p-6 overflow-auto font-mono text-sm whitespace-pre-wrap text-zinc-300" style={{ maxHeight: "600px" }}>
              {streamText || (
                <div className="text-zinc-600 text-center py-20">
                  <p className="text-lg mb-2">Describe your infrastructure</p>
                  <p className="text-sm">Or click a golden path above to start</p>
                </div>
              )}
              {streaming && <span className="inline-block w-2 h-4 bg-orange-500 animate-pulse ml-1" />}
            </div>
          )}

          {tab === "preview" && previewUrl && (
            <iframe
              src={previewUrl}
              className="w-full border-0"
              style={{ height: "600px" }}
              title="Architecture Preview"
            />
          )}

          {tab === "preview" && !previewUrl && (
            <div className="flex items-center justify-center h-96 text-zinc-600">
              Generate infrastructure first
            </div>
          )}

          {tab === "files" && (
            <div className="flex" style={{ height: "600px" }}>
              {/* File list */}
              <div className="w-64 border-r border-zinc-800 overflow-y-auto">
                {files.length === 0 ? (
                  <div className="p-4 text-zinc-600 text-sm">No files yet</div>
                ) : (
                  files.map((f) => (
                    <button
                      key={f.path}
                      onClick={() => viewFile(f.path)}
                      className={`w-full text-left px-3 py-2 text-sm border-b border-zinc-800/50 transition-colors ${
                        selectedFile === f.path ? "bg-zinc-800 text-orange-300" : "text-zinc-400 hover:bg-zinc-800/50"
                      }`}
                    >
                      <div className="font-mono truncate">{f.path}</div>
                      <div className="text-xs text-zinc-600">{f.lines} lines</div>
                    </button>
                  ))
                )}
              </div>
              {/* File content */}
              <div className="flex-1 overflow-auto p-4">
                <pre className="font-mono text-sm text-zinc-300 whitespace-pre-wrap">
                  {selectedFile ? fileContent : "← Select a file"}
                </pre>
              </div>
            </div>
          )}
        </div>

        {/* Summary */}
        {summary && !streaming && (
          <div className="mt-4 p-4 bg-zinc-900 border border-zinc-800 rounded-xl">
            <p className="text-sm text-zinc-400">{summary}</p>
          </div>
        )}
      </div>
    </div>
  );
}
