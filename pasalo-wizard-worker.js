// ============================================================
// Pasalo Cars PH — Wizard AI proxy Worker
// Deploy this on Cloudflare Workers (free tier).
// It keeps your Anthropic API key secret and forwards chat
// requests from the widget on your site to the Anthropic API.
// ============================================================

// EDIT THIS: your site's exact origin(s). Add more if you use
// a custom domain later. Do NOT use "*" in production — that
// lets any website call your key.
const ALLOWED_ORIGINS = [
  "https://pasalo-cars-ph.github.io",
];

// EDIT THIS if you want a different model.
// claude-sonnet-5   -> best quality, $2/$10 per million tokens (promo till Aug 31, 2026)
// claude-haiku-4-5-20251001 -> cheapest, $1/$5 per million tokens, still solid for FAQ-style chat
const MODEL = "claude-sonnet-5";

// Hard caps to prevent abuse from running up your bill
const MAX_MESSAGES = 20;        // max turns per request
const MAX_CHARS_PER_MSG = 1500; // max characters per message
const MAX_TOKENS = 500;         // max reply length

function corsHeaders(origin) {
  const allowed = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    "Access-Control-Allow-Origin": allowed,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get("Origin") || "";

    // Preflight
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders(origin) });
    }

    if (request.method !== "POST") {
      return new Response("Method not allowed", { status: 405, headers: corsHeaders(origin) });
    }

    // Reject requests from origins we don't recognize
    if (!ALLOWED_ORIGINS.includes(origin)) {
      return new Response(JSON.stringify({ error: "Origin not allowed" }), {
        status: 403,
        headers: { "Content-Type": "application/json", ...corsHeaders(origin) },
      });
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return new Response(JSON.stringify({ error: "Invalid JSON" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders(origin) },
      });
    }

    const { system, messages } = body;

    if (!Array.isArray(messages) || messages.length === 0) {
      return new Response(JSON.stringify({ error: "messages required" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders(origin) },
      });
    }

    // Basic abuse protection
    if (messages.length > MAX_MESSAGES) {
      return new Response(JSON.stringify({ error: "Too many messages in this conversation. Please refresh the chat." }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders(origin) },
      });
    }
    for (const m of messages) {
      if (typeof m.content !== "string" || m.content.length > MAX_CHARS_PER_MSG) {
        return new Response(JSON.stringify({ error: "Message too long" }), {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders(origin) },
        });
      }
    }

    // Forward to Anthropic with the real key, which lives only
    // in this Worker's environment — never sent to the browser.
    const anthropicRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: MAX_TOKENS,
        system: typeof system === "string" ? system.slice(0, 6000) : "",
        messages,
      }),
    });

    const data = await anthropicRes.text();

    return new Response(data, {
      status: anthropicRes.status,
      headers: { "Content-Type": "application/json", ...corsHeaders(origin) },
    });
  },
};
