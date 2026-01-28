import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    DATABASE_URL: z.string().url(),
  },
  client: {
    // Claude API key is stored client-side in localStorage
    // Not validated here since user provides it at runtime
  },
  runtimeEnv: {
    DATABASE_URL: process.env.DATABASE_URL,
  },
  // Skip validation during build in CI when env vars not available
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
});
