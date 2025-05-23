import { connectDB, hello } from './index';

async function testConnection() {
  try {
    // Test the hello function
    console.log(hello());
    
    // Test database connection
    await connectDB();
    
    // If we get here, the connection was successful
    console.log('All tests passed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Test failed:', error);
    process.exit(1);
  }
}

testConnection(); 