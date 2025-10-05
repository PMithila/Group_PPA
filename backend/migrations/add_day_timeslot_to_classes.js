import pool from '../config/database.js';

/**
 * Migration to add 'day' and 'time_slot' columns to classes table
 */
const addColumnsToClasses = async () => {
  try {
    // Check if columns exist before adding them
    const checkQuery = `
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name='classes' 
      AND column_name IN ('day', 'time_slot');
    `;
    const result = await pool.query(checkQuery);
    const existingColumns = result.rows.map(row => row.column_name);
    
    // Add 'day' column if it doesn't exist
    if (!existingColumns.includes('day')) {
      console.log('Adding "day" column to classes table...');
      await pool.query('ALTER TABLE classes ADD COLUMN day VARCHAR(50)');
      console.log('✓ "day" column added successfully');
    } else {
      console.log('✓ "day" column already exists');
    }
    
    // Add 'time_slot' column if it doesn't exist
    if (!existingColumns.includes('time_slot')) {
      console.log('Adding "time_slot" column to classes table...');
      await pool.query('ALTER TABLE classes ADD COLUMN time_slot VARCHAR(50)');
      console.log('✓ "time_slot" column added successfully');
    } else {
      console.log('✓ "time_slot" column already exists');
    }
    
    console.log('Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
};

// Run migration
addColumnsToClasses();
