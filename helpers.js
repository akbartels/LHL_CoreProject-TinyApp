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
  return undefined;
};


const urlsForUser = function(loggedInID, databaseUrls) {
  let userURLs = {};

  for (let shortURL in databaseUrls) {
    if (databaseUrls[shortURL].userID === loggedInID) {
      userURLs[shortURL] = databaseUrls[shortURL];
    }
  }
  return userURLs;
};



module.exports = {
  generateRandomString,
  getUserIdByEmail,
  urlsForUser
};