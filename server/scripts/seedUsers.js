// server/scripts/seedUsers.js

// this is for dummy data to test
// run the following line    -->   node scripts/seedUsers.js

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('../models/User');

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Connected to MongoDB for seeding...'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
});

// const users = [
//     { email: 'jon@example.com', username: 'Jon204D', password: '123'},
//     { email: 'kodie@example.com', username: 'kodie', password: '456'},
//     { email: 'bunny@example.com', username: 'tee', password: '789'},
//     { email: 'aiyaz@example.com', username: 'aiyaz', password: '000'}
// ];

const users = [
  {
    email: process.env.TESTUSER1EMAIL,
    username: process.env.TESTUSER1USERNAME,
    password: process.env.TESTUSER1PASSWORD,
  },
  {
    email: process.env.TESTUSER2EMAIL,
    username: process.env.TESTUSER2USERNAME,
    password: process.env.TESTUSER2PASSWORD,
  },
  {
    email: process.env.TESTUSER3EMAIL,
    username: process.env.TESTUSER3USERNAME,
    password: process.env.TESTUSER3PASSWORD,
  },
  {
    email: process.env.TESTADMINEMAIL,
    username: process.env.TESTADMINUSERNAME,
    password: process.env.TESTADMINPASSWORD,
  },
  {
    email: process.env.TESTDEMOEMAIL,
    username: process.env.TESTDEMOUSERNAME,
    password: process.env.TESTDEMOPASSWORD,
  },
];


const seedUsers = async () => {
  try {
    console.log('Clearing previous data');
    await User.deleteMany({}); // remove all existing users

    console.log('Hashing passwords for the data');
    const hashedUsers = await Promise.all(
      users.map(async (user) => {
        const hashedPassword = await bcrypt.hash(user.password, 10);
        return { ...user, password: hashedPassword };
      })
    );

    console.log('Inserting dummy data');
    await User.insertMany(hashedUsers);

    console.log('We have struck gold, dummy users added');
  } catch (err) {
    console.error('Something went wrong:', err);
  } finally {
    mongoose.connection.close();
    console.log('MongoDB is out yo');
  }
};

seedUsers();