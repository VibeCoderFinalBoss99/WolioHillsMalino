import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";
import { clientRecordToDbRow, mergeExistingBooking, type BookingDbRow, type ClientBookingRecord } from "../lib/mapBookingRow";
import { assertSupabaseServiceRoleKey } from "../lib/serviceRoleKey";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || "";
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  if (!url || !key) {
    return res.status(503).json({ error: "SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY belum diatur" });
  }
  try {
    assertSupabaseServiceRoleKey(key);
  } catch (e) {
    return res.status(503).json({ error: e instanceof Error ? e.message : "SUPABASE_SERVICE_ROLE_KEY tidak valid" });
  }

  const body = req.body as { record?: ClientBookingRecord };
  const rec = body.record;
  if (!rec?.order_id) return res.status(400).json({ error: "record.order_id wajib" });

  let row = clientRecordToDbRow(rec);
  const supabase = createClient(url, key);
  const { data: existing } = await supabase.from("bookings").select("*").eq("order_id", row.order_id).maybeSingle();
  if (existing) {
    row = mergeExistingBooking(existing as BookingDbRow, row);
  }
  const { error } = await supabase.from("bookings").upsert(row, { onConflict: "order_id" });
  if (error) return res.status(500).json({ error: error.message });
  return res.status(200).json({ ok: true });
}
