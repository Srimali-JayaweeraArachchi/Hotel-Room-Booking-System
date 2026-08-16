import database from '../config/database.js';

const email = process.argv[2]?.trim().toLowerCase();

if (!email) {
  console.error('Usage: npm run user:make-staff -- user@example.com');
  process.exitCode = 1;
} else {
  try {
    const [result] = await database.execute(
      "UPDATE users SET role = 'staff' WHERE email = ?",
      [email],
    );
    if (result.affectedRows === 0) {
      console.error(`No user account found for ${email}`);
      process.exitCode = 1;
    } else {
      console.log(`${email} is now a hotel staff member.`);
    }
  } finally {
    await database.end();
  }
}
