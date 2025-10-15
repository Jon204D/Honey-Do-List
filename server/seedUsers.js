// seedUsers.js - Create test users for UI automation

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const testUsers = [
  {
    email: 'roottest01@test.com',
    username: 'roottest01',
    password: 'TestPass123!',
  },
  {
    email: 'roottest02@test.com',
    username: 'roottest02',
    password: 'TestPass123!',
  },
  {
    email: 'roottest03@test.com',
    username: 'roottest03',
    password: 'TestPass123!',
  },
  {
    email: 'admintest@test.com',
    username: 'admintest',
    password: 'AdminPass123!',
  },
  {
    email: 'demouser@test.com',
    username: 'demouser',
    password: 'DemoPass123!',
  },
];

const seedUsers = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');

    // Clear existing test users (optional - comment out if you want to keep existing data)
    const testEmails = testUsers.map(u => u.email);
    await User.deleteMany({ email: { $in: testEmails } });
    console.log('🗑️  Cleared existing test users');

    // Create test users
    const createdUsers = await User.insertMany(testUsers);
    console.log(`\n✅ Successfully created ${createdUsers.length} test users:\n`);
    
    createdUsers.forEach(user => {
      const testUser = testUsers.find(u => u.email === user.email);
      console.log(`📧 Email:    ${user.email}`);
      console.log(`👤 Username: ${user.username}`);
      console.log(`🔑 Password: ${testUser.password}`);
      console.log(`🆔 User ID:  ${user._id}`);
      console.log('─'.repeat(50));
    });

    console.log('\n✨ Test users ready for UI automation!\n');

  } catch (error) {
    console.error('❌ Error seeding users:', error.message);
  } finally {
    // Close connection
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
};

// Run the seeder
seedUsers();