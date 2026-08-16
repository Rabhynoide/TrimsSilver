import { z } from "zod";

export const syncSkillSchema = z.object({
  key: z.string().min(1).max(100),
  level: z.number().int().min(0).max(120),
});

export const syncPayloadSchema = z.object({
  character: z.object({
    name: z.string().min(1).max(64),
  }),
  skills: z.array(syncSkillSchema).max(200),
});

export type SyncPayload = z.infer<typeof syncPayloadSchema>;
