import { createConnection } from 'mysql2/promise';
import bcrypt from 'bcrypt';

const connection = await createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'gestor_financeiro_ia',
});

// Hash the admin password
const adminPassword = 'Admin@123456';
const passwordHash = await bcrypt.hash(adminPassword, 10);

try {
  // Check if admin user already exists
  const [rows] = await connection.execute(
    'SELECT * FROM users WHERE username = ?',
    ['admin']
  );

  if (rows.length > 0) {
    console.log('Admin user already exists');
  } else {
    // Create admin user
    await connection.execute(
      'INSERT INTO users (username, passwordHash, name, role, isActive) VALUES (?, ?, ?, ?, ?)',
      ['admin', passwordHash, 'Administrator', 'admin', true]
    );
    console.log('Admin user created successfully');
    console.log('Username: admin');
    console.log('Password: Admin@123456');
  }
} catch (error) {
  console.error('Error seeding admin user:', error);
} finally {
  await connection.end();
}
