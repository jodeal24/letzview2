// api/db.js — Vercel KV shared database
import { kv } from '@vercel/kv';

export const runtime = 'edge'; // fast Edge function

const KEY = 'letzview:db';

export default async function handler(req) {
  try {
    if (req.method === 'GET') {
      const data = (await kv.get(KEY)) || { series: [] };
      return new Response(JSON.stringify(data), {
        status: 200,
        headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
      });
    }

    if (req.method === 'POST') {
      const body = await req.json().catch(() => ({}));
      const { password, data } = body || {};
      const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin';

      if (password !== ADMIN_PASSWORD) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
      }

      if (!data || typeof data !== 'object') {
        return new Response(JSON.stringify({ error: 'Invalid body' }), { status: 400 });
      }

      await kv.set(KEY, data);
      return new Response(JSON.stringify({ ok: true }), { status: 200 });
    }

    return new Response('Method Not Allowed', { status: 405, headers: { Allow: 'GET, POST' } });
  } catch (err) {
    console.error('KV handler error:', err);
    return new Response(JSON.stringify({ error: 'Server error' }), { status: 500 });
  }
}
