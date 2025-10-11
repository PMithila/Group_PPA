import pool from '../config/database.js';

/**
 * Migration to remove 'phone' column from users table
 */
const removePhoneColumnFromUsers = async () => {
  try {
    // Check if phone column exists before removing it
    const checkQuery = `
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name='users'
      AND column_name = 'phone';
    `;
    const result = await pool.query(checkQuery);

    if (result.rows.length > 0) {
      console.log('Removing "phone" column from users table...');
      await pool.query('ALTER TABLE users DROP COLUMN phone');
      console.log('✓ "phone" column removed successfully');
    } else {
      console.log('✓ "phone" column does not exist, no removal needed');
    }

    console.log('Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
};

// Run migration
removePhoneColumnFromUsers();
