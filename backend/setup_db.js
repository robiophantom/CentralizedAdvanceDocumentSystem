
const fs = require('fs');
const path = require('path');
const { query, pool } = require('./src/config/database');

const setupDatabase = async () => {
  try {
    const schemaPath = path.join(__dirname, '..', 'database', 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    await query(schema);
    console.log('Database schema created successfully.');
  } catch (error) {
    console.error('Error setting up database schema:', error);
  } finally {
    await pool.end();
  }
};

setupDatabase();
