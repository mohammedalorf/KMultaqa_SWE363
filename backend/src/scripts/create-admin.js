import { closeDatabaseConnection, connectToDatabase } from '../config/db.js';
import Admin from '../../models/Admin.js';
import { hashPassword } from '../utils/password.js';

function getArg(name) {
  const prefix = `--${name}=`;
  const arg = process.argv.find((item) => item.startsWith(prefix));
  return arg ? arg.slice(prefix.length).trim() : '';
}

function requiredValue(value, name) {
  if (!value) {
    throw new Error(`${name} is required`);
  }

  return value;
}

async function createAdmin() {
  const fullName = requiredValue(
    getArg('name') || process.env.ADMIN_FULL_NAME,
    'Admin full name'
  );
  const email = requiredValue(
    (getArg('email') || process.env.ADMIN_EMAIL).toLowerCase(),
    'Admin email'
  );
  const password = requiredValue(
    getArg('password') || process.env.ADMIN_PASSWORD,
    'Admin password'
  );

  if (password.length < 8) {
    throw new Error('Admin password must be at least 8 characters');
  }

  await connectToDatabase();

  const existingAdmin = await Admin.findOne({ email });

  if (existingAdmin) {
    throw new Error('An admin with this email already exists');
  }

  await Admin.create({
    fullName,
    email,
    passwordHash: await hashPassword(password),
  });

  console.log(`Created admin account for ${email}`);
}

createAdmin()
  .catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await closeDatabaseConnection();
  });
