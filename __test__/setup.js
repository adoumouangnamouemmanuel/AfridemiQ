const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const jest = require("jest");

let mongoServer;

// Setup before all tests
beforeAll(async () => {
  // Use in-memory MongoDB for testing
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();

  await mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
});

// Cleanup after each test
afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany({});
  }
});

// Cleanup after all tests
afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongoServer.stop();
});

// Increase timeout for database operations
jest.setTimeout(30000);