import { defineConfig, loadEnv, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

function splitName(full: string): { first_name: string; last_name: string } {
  const parts = full.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return { first_name: "Tamu", last_name: "-" };
  if (parts.length === 1) return { first_name: parts[0], last_name: "-" };
  return { first_name: parts[0], last_name: parts.slice(1).join(" ") };
}

async function readRequestBody(req: AsyncIterable<Uint8Array | Buffer>): Promise<string> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return Buffer.concat(chunks).toString("utf8");
}

function midtransSnapPlugin(serverKey: string, production: boolean): Plugin {
  const base = production ? "https://app.midtrans.com" : "https://app.sandbox.midtrans.com";

  const handler = async (req: unknown, res: unknown, next: () => void) => {
    const r = req as { method?: string; url?: string };
    if (r.url !== "/api/midtrans/snap" || r.method !== "POST") {
      return next();
    }

    const resp = res as {
      statusCode: number;
      setHeader: (k: string, v: string) => void;
      end: (b: string) => void;
    };

    if (!serverKey) {
      resp.statusCode = 503;
      resp.setHeader("Content-Type", "application/json");
      resp.end(JSON.stringify({ error: "MIDTRANS_SERVER_KEY belum diatur di .env" }));
      return;
    }

    try {
      const raw = await readRequestBody(req as AsyncIterable<Uint8Array | Buffer>);
      const body = JSON.parse(raw || "{}") as {
        orderId?: string;
        grossAmount?: number;
        booking?: {
          guestName?: string;
          guestEmail?: string;
          guestPhone?: string;
        };
        itemName?: string;
      };

      const gross = Math.round(Number(body.grossAmount));
      if (!body.orderId || !Number.isFinite(gross) || gross < 1) {
        resp.statusCode = 400;
        resp.setHeader("Content-Type", "application/json");
        resp.end(JSON.stringify({ error: "Payload tidak valid" }));
        return;
      }

      const { first_name, last_name } = splitName(String(body.booking?.guestName));

      const snapBody = {
        transaction_details: {
          order_id: body.orderId,
          gross_amount: gross,
        },
        item_details: [
          {
            id: "BOOKING",
            name: body.itemName || "Wolio Hills — Menginap",
            price: gross,
            quantity: 1,
          },
        ],
        customer_details: {
          first_name,
          last_name,
          email: body.booking?.guestEmail || "guest@example.com",
          phone: (body.booking?.guestPhone || "").replace(/\D/g, "").slice(0, 20) || "0812345678",
        },
        credit_card: { secure: true },
      };

      const auth = Buffer.from(`${serverKey}:`).toString("base64");
      const snapRes = await fetch(`${base}/snap/v1/transactions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Basic ${auth}`,
        },
        body: JSON.stringify(snapBody),
      });

      const snapJson = (await snapRes.json()) as { token?: string; error_messages?: string[]; status_message?: string };

      if (!snapRes.ok || !snapJson.token) {
        const msg = snapJson.error_messages?.join(", ") || snapJson.status_message || "Midtrans error";
        resp.statusCode = 502;
        resp.setHeader("Content-Type", "application/json");
        resp.end(JSON.stringify({ error: msg }));
        return;
      }

      resp.statusCode = 200;
      resp.setHeader("Content-Type", "application/json");
      resp.end(JSON.stringify({ token: snapJson.token }));
    } catch (e) {
      resp.statusCode = 500;
      resp.setHeader("Content-Type", "application/json");
      resp.end(JSON.stringify({ error: e instanceof Error ? e.message : "Server error" }));
    }
  };

  return {
    name: "midtrans-snap-proxy",
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        void handler(req, res, next);
      });
    },
    configurePreviewServer(server) {
      server.middlewares.use((req, res, next) => {
        void handler(req, res, next);
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const serverKey = env.MIDTRANS_SERVER_KEY ?? "";
  const production = env.VITE_MIDTRANS_PRODUCTION === "true";

  const plugins = [react(), tailwindcss()];
  if (serverKey) {
    plugins.push(midtransSnapPlugin(serverKey, production));
  }

  return {
    plugins,
    server: {
      port: 3001,
      host: "0.0.0.0",
    },
  };
});
