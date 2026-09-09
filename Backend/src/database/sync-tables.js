import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config({ path: './.env' });

async function syncTables() {
  const dbUrl = process.env.DATABASE_URL || 'mysql://root@localhost:3306/nursing_db';
  console.log('Connecting to MySQL database:', dbUrl);

  const connection = await mysql.createConnection(dbUrl);

  const queries = [
    `CREATE TABLE IF NOT EXISTS universities (
      id VARCHAR(36) PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      type VARCHAR(100),
      location VARCHAR(255),
      established_year INT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX univ_name_idx (name)
    );`,

    `CREATE TABLE IF NOT EXISTS states (
      id VARCHAR(36) PRIMARY KEY,
      name VARCHAR(100) NOT NULL UNIQUE,
      INDEX state_name_idx (name)
    );`,

    `CREATE TABLE IF NOT EXISTS cities (
      id VARCHAR(36) PRIMARY KEY,
      state_id VARCHAR(36) NOT NULL,
      name VARCHAR(100) NOT NULL,
      INDEX city_state_idx (state_id),
      INDEX city_name_idx (name)
    );`,

    `CREATE TABLE IF NOT EXISTS placements (
      id VARCHAR(36) PRIMARY KEY,
      college_id VARCHAR(36) NOT NULL,
      year INT NOT NULL,
      highest_package VARCHAR(50),
      average_package VARCHAR(50),
      top_recruiters JSON,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX placement_college_idx (college_id)
    );`,

    `CREATE TABLE IF NOT EXISTS reviews (
      id VARCHAR(36) PRIMARY KEY,
      college_id VARCHAR(36) NOT NULL,
      user_id VARCHAR(36),
      user_name VARCHAR(150),
      rating FLOAT NOT NULL,
      comment TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX review_college_idx (college_id)
    );`,

    `CREATE TABLE IF NOT EXISTS scholarships (
      id VARCHAR(36) PRIMARY KEY,
      college_id VARCHAR(36) NOT NULL,
      name VARCHAR(255) NOT NULL,
      amount VARCHAR(100),
      eligibility TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX scholarship_college_idx (college_id)
    );`,

    `CREATE TABLE IF NOT EXISTS college_courses (
      id VARCHAR(36) PRIMARY KEY,
      college_id VARCHAR(36) NOT NULL,
      course_id VARCHAR(36) NOT NULL,
      total_fees VARCHAR(100),
      seats INT,
      cutoff VARCHAR(100),
      INDEX cc_college_idx (college_id),
      INDEX cc_course_idx (course_id)
    );`,

    `CREATE TABLE IF NOT EXISTS course_exams (
      id VARCHAR(36) PRIMARY KEY,
      course_id VARCHAR(36) NOT NULL,
      exam_id VARCHAR(36) NOT NULL,
      is_mandatory BOOLEAN DEFAULT TRUE,
      INDEX ce_course_idx (course_id),
      INDEX ce_exam_idx (exam_id)
    );`,

    `CREATE TABLE IF NOT EXISTS exam_colleges (
      id VARCHAR(36) PRIMARY KEY,
      exam_id VARCHAR(36) NOT NULL,
      college_id VARCHAR(36) NOT NULL,
      accepting_status VARCHAR(100) DEFAULT 'Accepted',
      INDEX ec_exam_idx (exam_id),
      INDEX ec_college_idx (college_id)
    );`
  ];

  for (const query of queries) {
    try {
      await connection.query(query);
      console.log('✅ Executed table sync query successfully');
    } catch (err) {
      console.error('⚠️ Query error:', err.message);
    }
  }

  await connection.end();
  console.log('🎉 All ER diagram tables created/verified successfully!');
}

syncTables();
