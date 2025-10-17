import pool from '../config/database.js';

export async function seedSampleData() {
  try {
    console.log('🌱 Seeding sample data...');

    // Insert sample departments
    const departments = Array.from({ length: 13 }, (_, idx) => {
      const gradeNumber = idx + 1;
      return {
        code: `G${gradeNumber}`,
        name: `Grade ${gradeNumber}`,
        description: `Department for Grade ${gradeNumber}`,
        head_of_department: null,
        contact_email: null
      };
    });

    const departmentIds = {};
    for (const dept of departments) {
      const result = await pool.query(
        'INSERT INTO departments (code, name, description, head_of_department, contact_email) VALUES ($1, $2, $3, $4, $5) ON CONFLICT (code) DO NOTHING RETURNING id',
        [dept.code, dept.name, dept.description, dept.head_of_department, dept.contact_email]
      );
      
      if (result.rows.length > 0) {
        departmentIds[dept.code] = result.rows[0].id;
        console.log(`✓ Added department: ${dept.name}`);
      } else {
        // Get existing department ID
        const existingDept = await pool.query('SELECT id FROM departments WHERE code = $1', [dept.code]);
        if (existingDept.rows.length > 0) {
          departmentIds[dept.code] = existingDept.rows[0].id;
        }
      }
    }

    // Core set of subjects to keep in the system
    const coreSubjects = [
      { code: 'MATH-CORE', name: 'Mathematics', description: 'Core mathematics curriculum', credits: 3, department_code: 'MATH' },
      { code: 'ENG-CORE', name: 'English', description: 'Core English curriculum', credits: 3, department_code: 'ENG' },
      { code: 'ICT-CORE', name: 'ICT', description: 'Information and Communication Technology', credits: 3, department_code: 'ICT' },
      { code: 'SCI-CORE', name: 'Science', description: 'Integrated science curriculum', credits: 3, department_code: 'SCI' },
      { code: 'HIST-CORE', name: 'History', description: 'World and regional history', credits: 3, department_code: 'HIST' },
      { code: 'ACC-CORE', name: 'Accounting', description: 'Financial accounting fundamentals', credits: 3, department_code: 'ACC' },
      { code: 'BUS-CORE', name: 'Business', description: 'Business studies and management', credits: 3, department_code: 'BUS' }
    ];

    const allowedSubjectNames = coreSubjects.map((subject) => subject.name);

    // Detach existing classes referencing subjects that will be removed
    if (allowedSubjectNames.length > 0) {
      const placeholders = allowedSubjectNames.map((_, idx) => `$${idx + 1}`).join(', ');
      await pool.query(
        `UPDATE classes
         SET subject_id = NULL, department_id = NULL
         WHERE subject_id IN (
           SELECT id FROM subjects WHERE name NOT IN (${placeholders})
         )`,
        allowedSubjectNames
      );

      await pool.query(
        `DELETE FROM subjects
         WHERE name NOT IN (${placeholders})`,
        allowedSubjectNames
      );
    } else {
      await pool.query('TRUNCATE TABLE subjects RESTART IDENTITY CASCADE');
    }

    for (const subject of coreSubjects) {
      const departmentId = departmentIds[subject.department_code];
      if (!departmentId) {
        console.warn(`⚠️ Department not found for subject ${subject.name}. Skipping.`);
        continue;
      }

      await pool.query(
        `
          INSERT INTO subjects (code, name, description, credits, department_id)
          VALUES ($1, $2, $3, $4, $5)
          ON CONFLICT (code) DO UPDATE
          SET name = EXCLUDED.name,
              description = EXCLUDED.description,
              credits = EXCLUDED.credits,
              department_id = EXCLUDED.department_id
        `,
        [subject.code, subject.name, subject.description, subject.credits, departmentId]
      );
      console.log(`✓ Ensured subject: ${subject.name}`);
    }

    console.log('✅ Sample data seeding completed successfully!');
  } catch (error) {
    console.error('❌ Error seeding sample data:', error);
    throw error;
  }
}

export default seedSampleData;
