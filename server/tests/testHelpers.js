// tests/testHelpers.js - Helper utilities for test mocking

/**
 * Creates a chainable mock for Mongoose Model.find() that supports .populate().exec()
 * @param {*} returnValue - The value to return from exec()
 * @returns {Object} A chainable mock object
 */
function mockFindPopulate(returnValue) {
  const mockChain = {
    populate: jest.fn().mockReturnThis(),
    exec: jest.fn().mockResolvedValue(returnValue),
    sort: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    lean: jest.fn().mockReturnThis()
  };
  
  // Make the chain also thenable so it can be awaited directly
  mockChain.then = function(resolve, reject) {
    return mockChain.exec().then(resolve, reject);
  };
  
  return mockChain;
}

/**
 * Creates a chainable mock for Mongoose Model.findOne() that supports .populate().exec()
 * @param {*} returnValue - The value to return from exec()
 * @returns {Object} A chainable mock object
 */
function mockFindOnePopulate(returnValue) {
  return mockFindPopulate(returnValue);
}

/**
 * Creates a chainable mock for Mongoose Model.findById() that supports .populate().exec()
 * @param {*} returnValue - The value to return from exec()
 * @returns {Object} A chainable mock object
 */
function mockFindByIdPopulate(returnValue) {
  return mockFindPopulate(returnValue);
}

module.exports = {
  mockFindPopulate,
  mockFindOnePopulate,
  mockFindByIdPopulate
};
