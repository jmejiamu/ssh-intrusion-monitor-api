import { z } from "zod";

export const securityEventSchema = z.object({
  type: z.enum(["ssh_failed_login", "possible_brute_force"]),

  severity: z.enum(["medium", "high"]),

  username: z.string().min(1),

  ip_address: z.ipv4(),

  attempt_count: z.number().int().min(1),

  timestamp: z.iso.datetime(),

  should_alert: z.boolean(),
});

export type SecurityEventInput = z.infer<typeof securityEventSchema>;
