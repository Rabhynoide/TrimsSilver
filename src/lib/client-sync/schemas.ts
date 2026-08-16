import { z } from "zod";

export const syncSkillSchema = z.object({
  key: z.string().min(1).max(100),
  fame: z.number().int().nonnegative(),
});

export const syncPayloadSchema = z.object({
  character: z.object({
    name: z.string().min(1).max(64),
  }),
  skills: z.array(syncSkillSchema).max(200),
});

export type SyncPayload = z.infer<typeof syncPayloadSchema>;
