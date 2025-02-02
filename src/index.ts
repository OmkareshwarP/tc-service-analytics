import * as dotenv from 'dotenv';
import express, { Request, Response } from "express";
import { logError, initializeAbly, loadEnv, ablySubscribe } from './utils/index.js';
import { initializeRedis } from './databases/redisUtil.js';
import path from 'path';

dotenv.config({ path: path.resolve('.env') });

await loadEnv();

const PORT = process.env.PORT || 3000;

initializeRedis();
initializeAbly();

ablySubscribe();


//fake server
const app = express();

app.get("/health", (_: Request, res: Response) => {
  res.status(200).json({ status: "ok" });
});

app.get("/sentry-check", (req: Request, res: Response) => {
  const sentryError = new Error("Check Sentry error!");
  logError('Sentry error sent', 'sentryCheck', 1, sentryError, req.body);
  res.status(200).json({ status: "success" });
});

app.get("/", (_: Request, res: Response) => {
  res.status(200).json({ status: "🚀 Background worker is running... ⚡🔥" });
});

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Fake server running on port ${PORT}`);
});

process.on('unhandledRejection', (reason) => {
  logError('unhandledRejection', 'unhandledRejection', 9, reason);
});

process.on('uncaughtException', (reason) => {
  logError('unhandledException', 'unhandledException', 9, reason);
});
