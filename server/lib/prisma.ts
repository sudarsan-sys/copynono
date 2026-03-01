import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
// FIX: Import from 'index.js', NOT 'client'. 
// This is the file Prisma generates inside your custom folder.
import { PrismaClient } from '../generated/prisma/index.js';

const connectionString = `${process.env.DATABASE_URL}`;

// 1. Init the driver adapter
const adapter = new PrismaPg({ connectionString });

// 2. Init the Prisma Client with the adapter
const prisma = new PrismaClient({ adapter });

export { prisma };