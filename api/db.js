// api/db.js — shared storage using Upstash KV (Redis)
import { Redis } from "@upstash/redis";

export const runtime = "edge"; // fast and serverless

const redis = Redis.fromEnv();
const KEY = "letzview:db";

export default async function handler(req) {
  try {
    if (req.method === "GET") {
      const data = (await redis.get(KEY)) ?? { series: [] };
      return new Response(JSON.stringify(data), {
        status: 200,
        headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
      });
    }

    if (req.method === "POST") {
      const { password, data } = (await req.json().catch(() => ({}))) || {};
      const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin";
      if (password !== ADMIN_PASSWORD)
        return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
      if (!data || typeof data !== "object")
        return new Response(JSON.stringify({ error: "Invalid body" }), { status: 400 });
      await redis.set(KEY, data);
      return new Response(JSON.stringify({ ok: true }), { status: 200 });
    }

    return new Response("Method Not Allowed", {
      status: 405,
      headers: { Allow: "GET, POST" },
    });
  } catch (err) {
    console.error("Upstash handler error:", err);
    return new Response(JSON.stringify({ error: "Server error" }), { status: 500 });
  }
}
