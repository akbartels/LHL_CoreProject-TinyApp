const {
  urlDatabase,
  users
} = require('./database');



// HELPER FUNCTIONS

// alphanumeric, 6 chars long
const generateRandomString = function() {
  const randomString = Math.random().toString(36).substring(6);
  return randomString;
};

const getUserIdByEmail = function(database, searchEmail) {
  for (let user in database) {
    if (users[user].email === searchEmail) {
      return user;
    }
  }
  return false;
};

const urlsForUser = function(loggedInID) {
  let userURLs = {};

  for (let shortURL in urlDatabase) {
    if (urlDatabase[shortURL].userID === loggedInID.id) {
      userURLs[shortURL] = urlDatabase[shortURL];
    }
  }
  return userURLs;
};

module.exports = {
  generateRandomString,
  getUserIdByEmail,
  urlsForUser
};