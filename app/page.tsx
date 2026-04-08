import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Coding Agents — Generate code, infra, and APIs with AI | coding.oncell.ai",
  description: "Free AI coding agents that generate HTML apps, React components, AWS CDK infrastructure, REST APIs, and code reviews. No signup required. Powered by OnCell isolated compute.",
  openGraph: {
    title: "AI Coding Agents — coding.oncell.ai",
    description: "Free AI agents that write production code. HTML, React, AWS CDK, APIs, code review. No signup.",
    url: "https://coding.oncell.ai",
    siteName: "OnCell Coding Agents",
    type: "website",
  },
};

const agents = [
  {
    slug: "html",
    name: "HTML Generator",
    tagline: "Single-page apps from a sentence",
    description: "Describe any web page — landing page, dashboard, calculator, game — and get complete HTML with Tailwind CSS and JavaScript. Iterate with follow-up instructions.",
    color: "from-blue-500 to-cyan-500",
    icon: "M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4",
    examples: ["Build a pomodoro timer", "Create a kanban board", "Design a pricing page with 3 tiers"],
    badge: "Most Popular",
  },
  {
    slug: "aws",
    name: "AWS Infrastructure",
    tagline: "Production CDK from a description",
    description: "Generate complete AWS CDK TypeScript stacks with golden path best practices. VPC, ECS, RDS, CloudFront, Lambda — with monitoring, encryption, and cost optimization baked in.",
    color: "from-orange-500 to-amber-500",
    icon: "M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10",
    examples: ["Web app with Fargate and Aurora", "Serverless API with DynamoDB", "Data pipeline with S3 and Athena"],
    badge: "New",
  },
  {
    slug: "react",
    name: "React App Generator",
    tagline: "Multi-file Next.js apps",
    description: "Generate full Next.js applications with multiple pages, components, and routing. Uses the oncell nextjs cell image for instant hot-reload preview.",
    color: "from-violet-500 to-purple-500",
    icon: "M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zm0 8a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zm12 0a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z",
    examples: ["Dashboard with charts and sidebar", "Blog with markdown support", "E-commerce product page"],
    badge: "Coming Soon",
  },
  {
    slug: "review",
    name: "Code Reviewer",
    tagline: "AI code review with scoring",
    description: "Paste code or a GitHub URL. Get a detailed review covering bugs, security vulnerabilities, performance issues, and best practices. Scored 0-100 with actionable fixes.",
    color: "from-emerald-500 to-green-500",
    icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
    examples: ["Review my Express.js middleware", "Check this React hook for bugs", "Audit this SQL query for injection"],
    badge: "Coming Soon",
  },
  {
    slug: "api",
    name: "API Builder",
    tagline: "REST APIs from descriptions",
    description: "Describe your data model and get a complete REST API with CRUD endpoints, validation schemas, sample data, and auto-generated documentation.",
    color: "from-pink-500 to-rose-500",
    icon: "M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
    examples: ["Todo API with tags and priorities", "User management API with roles", "Inventory system with categories"],
    badge: "Coming Soon",
  },
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-zinc-900/50 to-zinc-950" />
        <div className="relative max-w-5xl mx-auto px-6 pt-16 pb-20 text-center">
          <div className="flex items-center justify-center gap-2 mb-6">
            <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <rect x="4" y="4" width="16" height="16" rx="4" strokeWidth={2} />
                <circle cx="12" cy="12" r="2.5" fill="currentColor" />
              </svg>
            </div>
            <span className="text-sm font-mono text-zinc-500">coding.oncell.ai</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">
            AI Coding Agents
          </h1>
          <p className="text-lg text-zinc-400 max-w-2xl mx-auto mb-2">
            Free AI agents that write production code. HTML apps, React components, AWS infrastructure, REST APIs, and code reviews.
          </p>
          <p className="text-sm text-zinc-600">
            No signup required. Each agent runs in an isolated{" "}
            <a href="https://oncell.ai" className="text-amber-500 hover:text-amber-400 transition-colors">OnCell</a>{" "}
            compute cell.
          </p>
        </div>
      </section>

      {/* Agent Grid */}
      <section className="max-w-5xl mx-auto px-6 pb-20">
        <div className="grid gap-6 md:grid-cols-2">
          {agents.map((agent) => {
            const isLive = !agent.badge?.includes("Coming Soon");
            const Wrapper = isLive ? Link : "div";
            const wrapperProps = isLive ? { href: `/${agent.slug}` } : {};

            return (
              <Wrapper
                key={agent.slug}
                {...(wrapperProps as any)}
                className={`group block p-6 bg-zinc-900 border border-zinc-800 rounded-2xl transition-all duration-300 ${
                  isLive ? "hover:border-zinc-700 hover:bg-zinc-900/80 cursor-pointer" : "opacity-60"
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${agent.color} flex items-center justify-center`}>
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={agent.icon} />
                    </svg>
                  </div>
                  {agent.badge && (
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                      agent.badge === "New" ? "bg-orange-500/10 text-orange-400 border border-orange-500/20" :
                      agent.badge === "Most Popular" ? "bg-blue-500/10 text-blue-400 border border-blue-500/20" :
                      "bg-zinc-800 text-zinc-500 border border-zinc-700"
                    }`}>
                      {agent.badge}
                    </span>
                  )}
                </div>

                <h2 className="text-xl font-semibold mb-1">{agent.name}</h2>
                <p className="text-sm text-zinc-500 mb-3">{agent.tagline}</p>
                <p className="text-sm text-zinc-400 leading-relaxed mb-4">{agent.description}</p>

                <div className="space-y-1.5">
                  <p className="text-xs text-zinc-600 font-medium uppercase tracking-wide">Try it:</p>
                  {agent.examples.map((ex, i) => (
                    <p key={i} className="text-xs text-zinc-500 pl-3 border-l border-zinc-800">
                      &ldquo;{ex}&rdquo;
                    </p>
                  ))}
                </div>

                {isLive && (
                  <div className="mt-4 flex items-center gap-1 text-sm text-zinc-500 group-hover:text-amber-500 transition-colors">
                    <span>Try now</span>
                    <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                )}
              </Wrapper>
            );
          })}
        </div>
      </section>

      {/* How it works */}
      <section className="border-t border-zinc-800 py-16">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-2xl font-bold text-center mb-10">How it works</h2>
          <div className="space-y-6">
            {[
              { step: "1", title: "Describe what you want", desc: "Type a natural language instruction — \"build a dashboard\" or \"create a serverless API\"" },
              { step: "2", title: "Agent generates code in a cell", desc: "An isolated OnCell compute environment spins up. The agent calls an LLM, writes files, streams results back in real-time." },
              { step: "3", title: "Preview instantly, iterate", desc: "See the result in a live preview. Send follow-up instructions to modify, add features, or fix issues." },
            ].map((item) => (
              <div key={item.step} className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-zinc-800 rounded-full flex items-center justify-center text-sm font-bold text-zinc-400">
                  {item.step}
                </div>
                <div>
                  <h3 className="font-semibold mb-1">{item.title}</h3>
                  <p className="text-sm text-zinc-500">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-zinc-800 py-16 text-center">
        <div className="max-w-2xl mx-auto px-6">
          <h2 className="text-2xl font-bold mb-3">Build your own coding agent</h2>
          <p className="text-zinc-500 mb-6">
            Each agent above runs on OnCell — isolated compute with storage, database, and search built in.
            Build your own agent in 50 lines of code.
          </p>
          <div className="flex items-center justify-center gap-3">
            <a
              href="https://oncell.ai/docs"
              className="px-5 py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-medium rounded-xl transition-colors"
            >
              Read the docs
            </a>
            <a
              href="https://github.com/oncellai/oncell-demo-agent"
              className="px-5 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-medium rounded-xl transition-colors"
            >
              View on GitHub
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-800 py-8 text-center text-xs text-zinc-600">
        <p>Powered by <a href="https://oncell.ai" className="text-amber-500 hover:text-amber-400">oncell.ai</a> — per-customer isolated compute for AI agents</p>
      </footer>

      {/* Structured data for AEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": "OnCell AI Coding Agents",
            "url": "https://coding.oncell.ai",
            "description": "Free AI coding agents that generate HTML apps, React components, AWS CDK infrastructure, REST APIs, and code reviews.",
            "applicationCategory": "DeveloperApplication",
            "operatingSystem": "Web",
            "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" },
            "author": { "@type": "Organization", "name": "OnCell", "url": "https://oncell.ai" },
          }),
        }}
      />
    </main>
  );
}
