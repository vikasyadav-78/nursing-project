import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config({ path: './.env' });

async function fixUsersTable() {
  const dbUrl = process.env.DATABASE_URL || 'mysql://root@localhost:3306/nursing_db';
  console.log('Connecting to database:', dbUrl);

  const connection = await mysql.createConnection(dbUrl);

  const alterColumns = [
    `ALTER TABLE users ADD COLUMN IF NOT EXISTS mobile VARCHAR(20);`,
    `ALTER TABLE users ADD COLUMN IF NOT EXISTS location VARCHAR(150);`,
    `ALTER TABLE users ADD COLUMN IF NOT EXISTS education_level VARCHAR(100);`,
    `ALTER TABLE users ADD COLUMN IF NOT EXISTS course_preferences JSON;`,
    `ALTER TABLE users ADD COLUMN IF NOT EXISTS exam_preferences JSON;`,
    `ALTER TABLE users ADD COLUMN IF NOT EXISTS budget VARCHAR(100);`,
    `ALTER TABLE users ADD COLUMN IF NOT EXISTS career_interests JSON;`,
  ];

  for (const sqlQuery of alterColumns) {
    try {
      await connection.query(sqlQuery);
      console.log('Successfully altered users table.');
    } catch (err) {
      // IF NOT EXISTS syntax might differ in older mysql, try simple ADD COLUMN
      try {
        const colName = sqlQuery.split('ADD COLUMN IF NOT EXISTS ')[1].split(' ')[0];
        const colType = sqlQuery.split(colName)[1].replace(';', '');
        await connection.query(`ALTER TABLE users ADD COLUMN ${colName} ${colType}`);
        console.log(`Added column ${colName}`);
      } catch (e) {
        console.log(`Notice for query (${sqlQuery}):`, e.message);
      }
    }
  }

  await connection.end();
  console.log('Users table fix completed.');
}

fixUsersTable().catch(console.error);
