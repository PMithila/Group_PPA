import pool from '../config/database.js';

/**
 * Migration to add 'phone' and 'department' columns to users table
 */
const addColumnsToUsers = async () => {
  try {
    // Check if columns exist before adding them
    const checkQuery = `
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name='users'
      AND column_name IN ('phone', 'department');
    `;
    const result = await pool.query(checkQuery);
    const existingColumns = result.rows.map(row => row.column_name);

    // Add 'phone' column if it doesn't exist
    if (!existingColumns.includes('phone')) {
      console.log('Adding "phone" column to users table...');
      await pool.query('ALTER TABLE users ADD COLUMN phone VARCHAR(50)');
      console.log('✓ "phone" column added successfully');
    } else {
      console.log('✓ "phone" column already exists');
    }

    // Add 'department' column if it doesn't exist
    if (!existingColumns.includes('department')) {
      console.log('Adding "department" column to users table...');
      await pool.query('ALTER TABLE users ADD COLUMN department VARCHAR(255)');
      console.log('✓ "department" column added successfully');
    } else {
      console.log('✓ "department" column already exists');
    }

    console.log('Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
};

// Run migration
addColumnsToUsers();
