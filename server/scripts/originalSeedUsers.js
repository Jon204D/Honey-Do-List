#!/usr/bin/env node
// Idempotent user seeder for Honey-Do-List
// Usage:
//   node server/scripts/originalSeedUsers.js

require('dotenv').config();
const mongoose = require('mongoose');
const userQueries = require("../queries/userQueries");

async function main() {
  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    console.error('MONGO_URI is not set. Set it to your test database (do NOT use production).');
    process.exit(1);
  }

  const users = [
    {
      email: process.env.TESTUSER1EMAIL,
      username: process.env.TESTUSER1USERNAME,
      password: process.env.TESTUSER1PASSWORD
    },
    {
      email: process.env.TESTUSER2EMAIL,
      username: process.env.TESTUSER2USERNAME,
      password: process.env.TESTUSER2PASSWORD
    },
    {
      email: process.env.TESTUSER3EMAIL,
      username: process.env.TESTUSER3USERNAME,
      password: process.env.TESTUSER3PASSWORD
    },
    {
      email: process.env.TESTADMINEMAIL,
      username: process.env.TESTADMINUSERNAME,
      password: process.env.TESTADMINPASSWORD
    },
    {
      email: process.env.TESTDEMOEMAIL,
      username: process.env.TESTDEMOUSERNAME,
      password: process.env.TESTDEMOPASSWORD
    }
  ];

  try {
    await mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('Connected to', mongoUri);

    for (const u of users) {
      if (!u.email) {
        console.warn('Skipping user because email is missing for entry:', u);
        continue;
      }

      const existing = await userQueries.findUserByEmailQuery(u.email);
      if (existing) {
        console.log(`Skipped (already exists): ${u.email}`);
        continue;
      }

      // Create ensures model middleware (e.g. password hashing) runs
      await userQueries.createUser({
        email: u.email,
        username: u.username || u.email.split('@')[0],
        password: u.password || 'password123'
      });
      console.log(`Created: ${u.email}`);
    }

    console.log('Seeding complete.');
  } catch (err) {
    console.error('Seeder error:', err);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

main();