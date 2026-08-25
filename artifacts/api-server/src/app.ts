import fs from "node:fs";
import path from "node:path";
import express, { type Express } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import pinoHttp from "pino-http";
import router from "./routes";
import { logger } from "./lib/logger";
import { attachUser } from "./lib/auth";

declare const __dirname: string;

const app: Express = express();

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);
const appUrl = (process.env.APP_URL ?? "https://inner.digital").replace(/\/$/, "");

function corsOrigins(canonical: string): string[] {
  const origins = new Set([
    canonical,
    "http://localhost:5173",
    "http://127.0.0.1:5173",
  ]);
  try {
    const u = new URL(canonical);
    if (u.hostname === "localhost" || u.hostname.startsWith("127.")) {
      return [...origins];
    }
    if (u.hostname.startsWith("www.")) {
      origins.add(`${u.protocol}//${u.hostname.slice(4)}`);
    } else {
      origins.add(`${u.protocol}//www.${u.hostname}`);
    }
  } catch {
    /* ignore malformed APP_URL */
  }
  return [...origins];
}

app.use(
  cors({
    origin: corsOrigins(appUrl),
    credentials: true,
  }),
);
// Vault binary upload — json parser'dan önce raw body
app.use((req, res, next) => {
  if (req.method === "PUT" && /^\/api\/vault\/\d+\/file$/.test(req.path)) {
    return express.raw({ type: () => true, limit: "12mb" })(req, res, next);
  }
  next();
});
app.use(express.json());
app.use(express.text({ type: "text/plain", limit: "16kb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(attachUser);

app.use("/api", router);

// Kısa NFC / kartvizit URL: /@handle → /u/handle
app.use((req, res, next) => {
  if (req.method !== "GET" && req.method !== "HEAD") return next();
  const m = /^\/@([a-zA-Z0-9_]{1,20})\/?$/.exec(req.path);
  if (!m) return next();
  const handle = m[1]!.toLowerCase();
  const qs = req.url.includes("?") ? req.url.slice(req.url.indexOf("?")) : "";
  res.redirect(302, `/u/${handle}${qs}`);
});

// Tek süreç hem API'yi hem de önceden derlenmiş inner-hub SPA'sını sunar
// (Hostinger'da ayrı bir statik site hosting'i yok, tek Node app var).
const frontendDist = path.resolve(
  path.join(__dirname, "..", "..", "inner-hub", "dist"),
);

function prerenderIndex(pathname: string): string | null {
  let decoded = pathname;
  try {
    decoded = decodeURIComponent(pathname);
  } catch {
    /* keep raw */
  }
  const segments = decoded.split("/").filter(Boolean);
  if (
    segments.length === 0 ||
    !segments.every((s) => s !== ".." && !s.includes("\0"))
  ) {
    return null;
  }
  const file = path.resolve(frontendDist, ...segments, "index.html");
  if (!file.startsWith(frontendDist + path.sep) || !fs.existsSync(file)) {
    return null;
  }
  return file;
}

// Slash’lı dizin URL → slash’sız (sitemap/canonical ile aynı)
app.use((req, res, next) => {
  if (req.method !== "GET" && req.method !== "HEAD") return next();
  if (req.path.length <= 1 || !req.path.endsWith("/")) return next();
  const bare = req.path.replace(/\/+$/, "") || "/";
  if (!prerenderIndex(bare)) return next();
  const qs = req.url.includes("?") ? req.url.slice(req.url.indexOf("?")) : "";
  return res.redirect(301, bare + qs);
});

// redirect:false — /haberler → /haberler/ 301 yapma (botları kuyrukta bırakıyordu)
app.use(express.static(frontendDist, { redirect: false }));

app.get(/^(?!\/api).*/, (req, res) => {
  const prerendered = prerenderIndex(req.path);
  if (prerendered) return res.sendFile(prerendered);
  res.sendFile(path.join(frontendDist, "index.html"));
});

export default app;
