import { connectDB, Admin } from './index';

async function updateAdminApproval() {
  await connectDB();

  try {
    const result = await Admin.updateMany(
      { email: { $in: ['admin@chariot.com', 'admin2@chariot.com'] } },
      { approvalStatus: 'approved' }
    );
    
    console.log(`Updated ${result.modifiedCount} admin(s) to approved status`);
    
    // Verify the update
    const admins = await Admin.find({ email: { $in: ['admin@chariot.com', 'admin2@chariot.com'] } });
    admins.forEach(admin => {
      console.log(`Admin ${admin.email}: approvalStatus = ${admin.approvalStatus}`);
    });
    
  } catch (error) {
    console.error('Error updating admin approval status:', error);
  }

  process.exit(0);
}

updateAdminApproval().catch((err) => {
  console.error(err);
  process.exit(1);
}); 