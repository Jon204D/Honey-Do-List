// server/tests/testSetup.js
// Jest setup to ensure tests run against a clean DB and to fail early if env vars are missing.

const mongoose = require('mongoose');

const requiredEnv = [
  'MONGO_URI',
];

const missing = requiredEnv.filter(k => !process.env[k] || process.env[k].trim() === '');
if (missing.length) {
  throw new Error(`CI: missing required env vars: ${missing.join(', ')}. Add them to workflow env or repo secrets.`);
}

beforeAll(async () => {
  // connect using MONGO_URI supplied by CI / local env
  await mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  // Drop the whole test DB once at the start (ensures a clean slate)
  await mongoose.connection.dropDatabase();
});

afterEach(async () => {
  // Remove all documents from every collection to avoid duplicate-key errors
  const collections = Object.keys(mongoose.connection.collections);
  for (const collName of collections) {
    const collection = mongoose.connection.collections[collName];
    try {
      await collection.deleteMany({});
    } catch (e) {
      // ignore if collection disappeared between tests
    }
  }
});

afterAll(async () => {
  await mongoose.disconnect();
});
