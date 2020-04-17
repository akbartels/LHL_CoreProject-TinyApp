const {
  generateRandomString,
  getUserIdByEmail,
  urlsForUser
} = require("../helpers");

const { assert } = require('chai');

// const { getUserIdByEmail } = require('../helpers.js');

const testUsers = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

const urlDatabaseTest = {
  "b2xVn2": { longURL: "http://www.lighthouselabs.ca", userID: "userRandomID"},
  "9sm5xK": { longURL: "http://www.google.com", userID: "userRandomID"}
};

describe('getUserIdByEmail', function() {
  it('should return a user with valid email', function() {
    const user = getUserIdByEmail(testUsers, "user@example.com");
    const expectedOutput = "userRandomID";
    // Write your assert statement here
    assert.equal(user, expectedOutput);
  });
  it('should return undefined if email does not exist in database', function() {
    const user = getUserIdByEmail(testUsers, "notthere@example.com");
    const expectedOutput = undefined;
    // Write your assert statement here
    assert.equal(user, expectedOutput);
  });
  it('should return undefined if email is not passed in', function() {
    const user = getUserIdByEmail(testUsers, "");
    const expectedOutput = undefined;
    // Write your assert statement here
    assert.equal(user, expectedOutput);
  });
});



describe('urlsForUser', function() {
  it('should return a list of short URL objects assigned to the logged in user that include longURL and userID keys', function() {
    const userURLs = urlsForUser(testUsers.userRandomID.id, urlDatabaseTest);
    const expectedOutput = {
      'b2xVn2': { longURL: 'http://www.lighthouselabs.ca', userID: 'userRandomID' },
      '9sm5xK': { longURL: 'http://www.google.com', userID: 'userRandomID' }
    };
    // Write your assert statement here
    assert.deepEqual(userURLs, expectedOutput);
  });
  it('should return an empty object if a user has not created any urls', function() {
    const userURLs = urlsForUser(testUsers.user2RandomID.id, urlDatabaseTest);
    const expectedOutput = {};
    // Write your assert statement here
    assert.deepEqual(userURLs, expectedOutput);
  });
  
});