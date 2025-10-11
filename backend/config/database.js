// ./config/database.js
import 'dotenv/config';
import pg from 'pg';
const { Pool } = pg;

// PostgreSQL configuration
const connectionString = process.env.DATABASE_URL?.trim();
if (!connectionString) {
  throw new Error('Missing DATABASE_URL in environment');
}

// Log connection info (remove in production)
try {
  const host = new URL(connectionString).host;
  console.log('[DB] Using PostgreSQL host:', host);
} catch {
  console.warn('[DB] DATABASE_URL is not a valid URL');
}

const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false }, // Required for Supabase
});

// Test the connection
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('[DB] Connection error:', err);
  } else {
    console.log('[DB] Connected to PostgreSQL successfully');
  }
});

export default pool;
