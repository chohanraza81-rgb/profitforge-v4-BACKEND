const { z } = require('zod');
require('dotenv').config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development','production','test']).default('development'),
  PORT: z.string().default('5000'),
  JWT_SECRET: z.string().min(32),
  API_KEY: z.string().min(1),
  MONGODB_URI: z.string().url(),
  REDIS_URL: z.string().url(),
  SERPAPI_KEY: z.string().min(1),
  RAPIDAPI_KEY: z.string().min(1),
  APIFY_API_TOKEN: z.string().min(1),
  SCRAPINGBEE_API_KEY: z.string().min(1),
  GROQ_API_KEY: z.string().min(1),
  CLOUDINARY_CLOUD_NAME: z.string().min(1),
  CLOUDINARY_API_KEY: z.string().min(1),
  CLOUDINARY_API_SECRET: z.string().min(1),
  EMAIL_HOST: z.string().min(1),
  EMAIL_PORT: z.string().transform(Number),
  EMAIL_USER: z.string().email(),
  EMAIL_PASS: z.string().min(1),
  EMAIL_FROM: z.string().email(),
});

const env = envSchema.safeParse(process.env);
if (!env.success) {
  console.error('❌ Invalid environment variables:', env.error.format());
  process.exit(1);
}
module.exports = env.data;
