import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

// ดึงลิงก์จาก .env
const connectionString = process.env.DATABASE_URL!;
const client = postgres(connectionString);

// สร้างตัวแปร db สำหรับเรียกใช้ใน App
export const db = drizzle(client, { schema });