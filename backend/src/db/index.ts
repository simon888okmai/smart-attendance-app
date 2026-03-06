import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';
import dns from 'node:dns';

// Force IPv4 - Docker resolves to IPv6 which Supabase doesn't support
dns.setDefaultResultOrder('ipv4first');

const connectionString = process.env.DATABASE_URL!;
const client = postgres(connectionString, { ssl: { rejectUnauthorized: false } });

export const db = drizzle(client, { schema });