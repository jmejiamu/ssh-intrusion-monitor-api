import express from "express";
import type { Request, Response } from "express";

import { securityEventSchema } from "./schema/securityEvent.ts";
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
  const result = securityEventSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({
      error: "Invalid security event",
      details: result.error.flatten(),
    });
  }

  const event: SecurityEvent = {
    id: events.length + 1,
    ...result.data,
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
