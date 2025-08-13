import { connectDB, Admin } from './index';
import bcrypt from 'bcrypt';

async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
}

async function seedAdmins() {
  await connectDB();

  const admins = [
    {
      email: 'admin@chariot.com',
      name: 'Chirag',
      password: 'admin123',
      isSuperAdmin: true,
    },
    {
      email: 'admin2@chariot.com',
      name: 'Admin Two',
      password: 'admin123',
      isSuperAdmin: false,
    },
  ];

  for (const admin of admins) {
    const exists = await Admin.findOne({ email: admin.email });
    if (!exists) {
      const hashed = await hashPassword(admin.password);
      await Admin.create({
        email: admin.email,
        name: admin.name,
        password: hashed,
        isSuperAdmin: admin.isSuperAdmin,
        approvalStatus: 'approved',
        refreshToken: '',
      });
      console.log(`Created admin: ${admin.email}`);
    } else {
      console.log(`Admin already exists: ${admin.email}`);
    }
  }

  process.exit(0);
}

seedAdmins().catch((err) => {
  console.error(err);
  process.exit(1);
}); 