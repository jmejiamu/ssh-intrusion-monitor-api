import { z } from "zod";

export const securityEventSchema = z.object({
  type: z.string().min(1),
  severity: z.enum(["medium", "high"]),
  username: z.string().min(1),
  ip_address: z.ipv4(),
  attempt_count: z.number().int().min(1),
  timestamp: z.iso.datetime(),
});

export type SecurityEventInput = z.infer<typeof securityEventSchema>;
