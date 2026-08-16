import database from '../config/database.js';

const email = process.argv[2]?.trim().toLowerCase();

if (!email) {
  console.error('Usage: npm run user:make-admin -- user@example.com');
  process.exitCode = 1;
} else {
  try {
    const [result] = await database.execute(
      "UPDATE users SET role = 'admin' WHERE email = ?",
      [email],
    );

    if (result.affectedRows === 0) {
      console.error(`No user account found for ${email}`);
      process.exitCode = 1;
    } else {
      console.log(`${email} is now an administrator.`);
    }
  } finally {
    await database.end();
  }
}
