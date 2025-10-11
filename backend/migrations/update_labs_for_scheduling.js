import pool from '../config/database.js';

async function updateLabsTable() {
  try {
    console.log('Starting labs table update for scheduling functionality...');
    
    // Check if columns already exist to avoid errors
    const checkColumnsQuery = `
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'labs' AND column_name = 'subject_id'
    `;
    
    const columnCheck = await pool.query(checkColumnsQuery);
    
    // Only add columns if they don't exist
    if (columnCheck.rows.length === 0) {
      const alterTableQuery = `
        ALTER TABLE labs
        ADD COLUMN subject_id INTEGER,
        ADD COLUMN department_id INTEGER,
        ADD COLUMN teacher INTEGER,
        ADD COLUMN room VARCHAR(50),
        ADD COLUMN day VARCHAR(20),
        ADD COLUMN time_slot VARCHAR(20),
        ADD COLUMN duration INTEGER,
        ADD COLUMN max_students INTEGER
      `;
      
      await pool.query(alterTableQuery);
      console.log('Labs table updated successfully with scheduling fields');
    } else {
      console.log('Scheduling columns already exist in labs table');
    }
    
  } catch (error) {
    console.error('Error updating labs table:', error);
  }
}

// Run the migration
updateLabsTable().then(() => {
  console.log('Labs table migration completed');
  process.exit(0);
}).catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});