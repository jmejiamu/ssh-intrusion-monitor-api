import dotenv from "dotenv";
import express from "express";
import type { Request, Response } from "express";
import mongoose from "mongoose";
import { createServer } from "http";
import { Server } from "socket.io";

import { securityEventSchema } from "./schema/securityEvent.ts";
import { SecurityEvent } from "./models/SecurityEvent.ts";

dotenv.config();

const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: "*",
  },
});

const PORT = Number(process.env.PORT) || 3000;
const MONGODB_URI = process.env.MONGODB_URI;

app.use(express.json());

io.on("connection", (socket) => {
  console.log(`Socket connected: ${socket.id}`);

  socket.on("disconnect", () => {
    console.log(`Socket disconnected: ${socket.id}`);
  });
});

app.get("/", (_req: Request, res: Response) => {
  return res.json({
    message: "SSH Monitor API is running",
  });
});

app.get("/api/events", async (req: Request, res: Response) => {
  try {
    const { severity, type, ip_address, limit } = req.query;

    const filter: Record<string, string> = {};

    if (typeof severity === "string") {
      filter.severity = severity;
    }

    if (typeof type === "string") {
      filter.type = type;
    }

    if (typeof ip_address === "string") {
      filter.ip_address = ip_address;
    }

    let parsedLimit = 50;

    if (typeof limit === "string") {
      const requestedLimit = Number(limit);

      if (
        Number.isInteger(requestedLimit) &&
        requestedLimit > 0 &&
        requestedLimit <= 100
      ) {
        parsedLimit = requestedLimit;
      }
    }

    const events = await SecurityEvent.find(filter)
      .sort({ timestamp: -1 })
      .limit(parsedLimit);

    return res.json(events);
  } catch (error) {
    console.error("Failed to fetch security events:", error);

    return res.status(500).json({
      error: "Failed to fetch security events",
    });
  }
});

app.post("/api/events", async (req: Request, res: Response) => {
  try {
    const result = securityEventSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        error: "Invalid security event",
        details: result.error.flatten(),
      });
    }

    const event = await SecurityEvent.create(result.data);

    console.log("Security event received:", event);

    io.emit("security_event", event);

    return res.status(201).json({
      message: "Security event received",
      event,
    });
  } catch (error) {
    console.error("Failed to save security event:", error);

    return res.status(500).json({
      error: "Failed to save security event",
    });
  }
});

async function startServer() {
  if (!MONGODB_URI) {
    console.error("MONGODB_URI is missing from .env");
    process.exit(1);
  }

  try {
    await mongoose.connect(MONGODB_URI);

    console.log("Connected to MongoDB");

    httpServer.listen(PORT, "0.0.0.0", () => {
      console.log(`SSH Monitor API listening on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error);
    process.exit(1);
  }
}

startServer();
