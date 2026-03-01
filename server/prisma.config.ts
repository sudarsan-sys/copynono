import 'dotenv/config';
import { defineConfig } from 'prisma/config';

export default defineConfig({
  // Points to your schema file location
  schema: 'prisma/schema.prisma',

  // Defines the database connection
  datasource: {
    provider: 'postgresql',
    url: process.env.DATABASE_URL,
  },
});