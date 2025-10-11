import pool from '../config/database.js';

export async function seedSampleData() {
  try {
    console.log('🌱 Seeding sample data...');

    // Insert sample departments
    const departments = [
      { code: 'CS', name: 'Computer Science', description: 'Computer Science and Engineering Department', head_of_department: 'Dr. John Smith', contact_email: 'cs@university.edu' },
      { code: 'EE', name: 'Electrical Engineering', description: 'Electrical and Electronics Engineering Department', head_of_department: 'Dr. Sarah Johnson', contact_email: 'ee@university.edu' },
      { code: 'ME', name: 'Mechanical Engineering', description: 'Mechanical Engineering Department', head_of_department: 'Dr. Michael Brown', contact_email: 'me@university.edu' },
      { code: 'MATH', name: 'Mathematics', description: 'Mathematics and Statistics Department', head_of_department: 'Dr. Emily Davis', contact_email: 'math@university.edu' },
      { code: 'PHYSICS', name: 'Physics', description: 'Physics Department', head_of_department: 'Dr. Robert Wilson', contact_email: 'physics@university.edu' },
      { code: 'CHEM', name: 'Chemistry', description: 'Chemistry Department', head_of_department: 'Dr. Lisa Anderson', contact_email: 'chem@university.edu' }
    ];

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

    // Insert sample subjects
    const subjects = [
      // Computer Science subjects
      { code: 'CS101', name: 'Introduction to Computer Science', description: 'Basic concepts of computer science and programming', credits: 3, department_code: 'CS' },
      { code: 'CS102', name: 'Data Structures', description: 'Fundamental data structures and algorithms', credits: 3, department_code: 'CS' },
      { code: 'CS201', name: 'Object-Oriented Programming', description: 'Advanced programming concepts and OOP principles', credits: 3, department_code: 'CS' },
      { code: 'CS301', name: 'Database Systems', description: 'Database design and management', credits: 3, department_code: 'CS' },
      { code: 'CS401', name: 'Software Engineering', description: 'Software development methodologies and practices', credits: 3, department_code: 'CS' },
      
      // Electrical Engineering subjects
      { code: 'EE101', name: 'Circuit Analysis', description: 'Basic electrical circuit analysis', credits: 3, department_code: 'EE' },
      { code: 'EE201', name: 'Digital Electronics', description: 'Digital circuits and logic design', credits: 3, department_code: 'EE' },
      { code: 'EE301', name: 'Power Systems', description: 'Electrical power generation and distribution', credits: 3, department_code: 'EE' },
      
      // Mechanical Engineering subjects
      { code: 'ME101', name: 'Engineering Mechanics', description: 'Statics and dynamics', credits: 3, department_code: 'ME' },
      { code: 'ME201', name: 'Thermodynamics', description: 'Heat and energy transfer', credits: 3, department_code: 'ME' },
      { code: 'ME301', name: 'Machine Design', description: 'Mechanical component design', credits: 3, department_code: 'ME' },
      
      // Mathematics subjects
      { code: 'MATH101', name: 'Calculus I', description: 'Differential and integral calculus', credits: 3, department_code: 'MATH' },
      { code: 'MATH201', name: 'Linear Algebra', description: 'Vector spaces and linear transformations', credits: 3, department_code: 'MATH' },
      { code: 'MATH301', name: 'Probability and Statistics', description: 'Statistical analysis and probability theory', credits: 3, department_code: 'MATH' },
      
      // Physics subjects
      { code: 'PHYS101', name: 'General Physics I', description: 'Mechanics and thermodynamics', credits: 3, department_code: 'PHYSICS' },
      { code: 'PHYS201', name: 'General Physics II', description: 'Electricity, magnetism, and waves', credits: 3, department_code: 'PHYSICS' },
      
      // Chemistry subjects
      { code: 'CHEM101', name: 'General Chemistry I', description: 'Basic chemical principles', credits: 3, department_code: 'CHEM' },
      { code: 'CHEM201', name: 'Organic Chemistry', description: 'Carbon-based compounds and reactions', credits: 3, department_code: 'CHEM' }
    ];

    for (const subject of subjects) {
      const departmentId = departmentIds[subject.department_code];
      if (departmentId) {
        const result = await pool.query(
          'INSERT INTO subjects (code, name, description, credits, department_id) VALUES ($1, $2, $3, $4, $5) ON CONFLICT (code) DO NOTHING',
          [subject.code, subject.name, subject.description, subject.credits, departmentId]
        );
        
        if (result.rowCount > 0) {
          console.log(`✓ Added subject: ${subject.name}`);
        }
      }
    }

    console.log('✅ Sample data seeding completed successfully!');
  } catch (error) {
    console.error('❌ Error seeding sample data:', error);
    throw error;
  }
}

export default seedSampleData;
