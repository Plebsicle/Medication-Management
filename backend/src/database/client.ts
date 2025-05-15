import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

const envPath = path.resolve(process.cwd(), '.env');
console.log(`Checking for .env file at: ${envPath}`);

if (fs.existsSync(envPath)) {
  console.log('.env file exists, loading environment variables');
  dotenv.config({ path: envPath });
} else {
  console.error(`.env file not found at ${envPath}`);
}

const dbUrl = process.env.DATABASE_URL?.replace(/^["'](.*)["']$/, '$1');

if (!dbUrl) {
  console.error('DATABASE_URL environment variable is not set or is empty. Please check your .env file.');
} else {
  console.log(`Database URL found (first 15 chars): ${dbUrl.substring(0, 15)}...`);
}

let prisma: PrismaClient;

try {
  prisma = new PrismaClient({
    datasources: {
      db: {
        url: dbUrl
      }
    }
  });
  console.log('Prisma client initialized successfully');
} catch (error) {
  console.error('Failed to initialize Prisma client:', error);
  throw new Error('Failed to initialize database connection');
}

export default prisma; 