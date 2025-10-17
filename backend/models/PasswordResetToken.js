import crypto from 'crypto';
import pool from '../config/database.js';

export class PasswordResetToken {
  static hashToken(token) {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  static async createTable() {
    const query = `
      CREATE TABLE IF NOT EXISTS password_reset_tokens (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        token_hash VARCHAR(64) NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        used BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    await pool.query(query);
  }

  static async invalidateExistingTokens(userId) {
    await pool.query(
      `UPDATE password_reset_tokens
       SET used = true
       WHERE user_id = $1 AND used = false`,
      [userId]
    );
  }

  static async createToken(userId, token, expiresAt) {
    const tokenHash = this.hashToken(token);
    await pool.query(
      `INSERT INTO password_reset_tokens (user_id, token_hash, expires_at)
       VALUES ($1, $2, $3)`,
      [userId, tokenHash, expiresAt]
    );
  }

  static async findValidToken(token) {
    const tokenHash = this.hashToken(token);
    const result = await pool.query(
      `SELECT *
       FROM password_reset_tokens
       WHERE token_hash = $1
         AND used = false
         AND expires_at > NOW()
       LIMIT 1`,
      [tokenHash]
    );
    return result.rows[0] || null;
  }

  static async markTokenUsed(id) {
    await pool.query(
      `UPDATE password_reset_tokens
       SET used = true
       WHERE id = $1`,
      [id]
    );
  }
}
