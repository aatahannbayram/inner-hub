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
const appUrl = process.env.APP_URL ?? "https://inner.digital";
app.use(
  cors({
    origin: [appUrl, "http://localhost:5173", "http://127.0.0.1:5173"],
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
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(attachUser);

app.use("/api", router);

// Tek süreç hem API'yi hem de önceden derlenmiş inner-hub SPA'sını sunar
// (Hostinger'da ayrı bir statik site hosting'i yok, tek Node app var).
const frontendDist = path.join(__dirname, "..", "..", "inner-hub", "dist");
app.use(express.static(frontendDist));
app.get(/^(?!\/api).*/, (_req, res) => {
  res.sendFile(path.join(frontendDist, "index.html"));
});

export default app;
