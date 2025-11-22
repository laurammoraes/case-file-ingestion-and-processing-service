import 'dotenv/config';
import { defineConfig } from '@prisma/config';

if (!process.env.PG_DATABASE_URL) {
  console.error('Missing required environment variable: PG_DATABASE_URL');
  throw new Error('Missing required environment variable: PG_DATABASE_URL');
}

export default defineConfig({
  schema: './prisma/schema.prisma',
  datasource: {
    url: process.env.PG_DATABASE_URL,
  },
});
