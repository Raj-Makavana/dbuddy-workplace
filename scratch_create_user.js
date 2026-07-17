import pg from 'pg';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
dotenv.config();

const { Pool } = pg;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function main() {
  const email = process.argv[2];
  const password = process.argv[3];
  const name = process.argv[4] || 'Test User';

  if (!email || !password) {
    console.log('Usage: node scratch_create_user.js <email> <password> [name]');
    process.exit(1);
  }

  try {
    // Check if user already exists
    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      console.log(`User with email "${email}" already exists. Updating password...`);
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(password, saltRounds);
      await pool.query(
        'UPDATE users SET password_hash = $1, is_active = true, email_verified = true WHERE email = $2',
        [hashedPassword, email]
      );
      console.log('Password updated successfully!');
      return;
    }

    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const result = await pool.query(
      `INSERT INTO users (email, password_hash, name, is_active, email_verified) 
       VALUES ($1, $2, $3, true, true) 
       RETURNING id`,
      [email, hashedPassword, name]
    );

    console.log(`User created successfully with ID: ${result.rows[0].id}`);
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await pool.end();
  }
}

main();
