import pool from '../config/database.js';

export const syncLabNamesTrigger = async () => {
  try {
    await pool.query(`
      CREATE OR REPLACE FUNCTION set_lab_name_from_subject()
      RETURNS trigger AS $$
      DECLARE
        subject_record RECORD;
      BEGIN
        IF NEW.subject_id IS NOT NULL THEN
          SELECT id, name, department_id INTO subject_record
          FROM subjects
          WHERE id = NEW.subject_id;

          IF subject_record IS NULL THEN
            RAISE EXCEPTION 'Subject % not found when syncing lab name', NEW.subject_id;
          END IF;

          NEW.name := subject_record.name;
          IF NEW.department_id IS NULL THEN
            NEW.department_id := subject_record.department_id;
          END IF;
        END IF;
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);

    await pool.query(`
      DROP TRIGGER IF EXISTS labs_set_name_trigger ON labs;
      CREATE TRIGGER labs_set_name_trigger
      BEFORE INSERT OR UPDATE OF subject_id
      ON labs
      FOR EACH ROW
      WHEN (NEW.subject_id IS NOT NULL)
      EXECUTE FUNCTION set_lab_name_from_subject();
    `);

    await pool.query(`
      UPDATE labs AS l
      SET name = s.name,
          department_id = COALESCE(l.department_id, s.department_id)
      FROM subjects AS s
      WHERE l.subject_id = s.id
        AND s.name IS NOT NULL
        AND s.name <> ''
        AND (l.name IS DISTINCT FROM s.name OR l.department_id IS NULL);
    `);

    console.log('✓ Lab name trigger synchronized with subject names');
  } catch (error) {
    console.error('Failed to synchronize lab name trigger:', error);
  }
};
