import express from "express";
import type { Request, Response } from "express";
const app = express();
const PORT = 3000;

app.use(express.json());

type SecurityEvent = {
  id: number;
  type: string;
  severity: string;
  username: string;
  ip_address: string;
  attempt_count: number;
  timestamp: string;
  received_at: string;
};

const events: SecurityEvent[] = [];

app.get("/", (_req: Request, res: Response) => {
  res.json({
    message: "SSH Monitor API is running",
  });
});

app.get("/api/events", (_req: Request, res: Response) => {
  res.json({
    count: events.length,
    events,
  });
});

app.post("/api/events", (req: Request, res: Response) => {
  const { type, severity, username, ip_address, attempt_count, timestamp } =
    req.body;

  if (
    !type ||
    !severity ||
    !username ||
    !ip_address ||
    attempt_count === undefined ||
    !timestamp
  ) {
    return res.status(400).json({
      error: "Missing required event fields",
    });
  }

  const event: SecurityEvent = {
    id: events.length + 1,
    type,
    severity,
    username,
    ip_address,
    attempt_count,
    timestamp,
    received_at: new Date().toISOString(),
  };

  events.push(event);

  console.log("Security event received:", event);

  return res.status(201).json({
    message: "Security event received",
    event,
  });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`SSH Monitor API listening on port ${PORT}`);
});
