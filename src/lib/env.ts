import { z } from "zod";

const envSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  OPENAI_API_KEY: z.string().startsWith("sk-"),
  GOOGLE_PLACES_API_KEY: z.string().min(1),
  OCM_API_KEY: z.string().min(1),
  NOBIL_API_KEY: z.string().min(1).optional(),
  OSRM_BASE_URL: z
    .string()
    .url()
    .default("https://router.project-osrm.org"),
});

export type Env = z.infer<typeof envSchema>;

function getEnv(): Env {
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    console.error("Invalid environment variables:", parsed.error.flatten().fieldErrors);
    throw new Error("Invalid environment variables");
  }
  return parsed.data;
}

export const env = getEnv();
