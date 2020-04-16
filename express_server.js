const express = require("express");
const cookieParser = require('cookie-parser');
const app = express();
const PORT = 8080; // default port 8080

app.set('view engine', 'ejs');
app.use(cookieParser());

const urlDatabase = {
  "b2xVn2": { longURL: "http://www.lighthouselabs.ca", userID: "123abc"},
  "9sm5xK": { longURL: "http://www.google.com", userID: "123abc"}
};

const users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  },
  "123abc": {
    id: "123abc",
    email: "akunrau@gmail.com",
    password: "123"
  }
}

// FUNCTIONS

// alphanumeric, 6 chars long
const generateRandomString = function() {
  const randomString = Math.random().toString(36).substring(6);
  return randomString;
};

const findEmailReturnUserID = function(object, searchEmail) {
  for (let key in object ) {
    if (users[key].email === searchEmail) {
      return key;
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
}


const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));


// REGISTER/LOG IN/OUT ROUTES
app.get("/register", (req, res) => { // QUESTION PENDING
  
  const user_id = req.cookies;
  let templateVars = {user: user_id, urls: urlDatabase }; // is this needed here???
  
  res.render('urls_register', templateVars);
});

app.post("/register", (req, res) => { // REVIEWED
  const email = req.body.email;
  const password = req.body.password;
 
  if (!email || !password) {
    res.status(400).send("You must enter an e-mail AND a password");
  } else if (findEmailReturnUserID(users, email)) {
    res.status(400).send("The email you entered is already in use");
  } else {
  const randomUserID = generateRandomString();
  // console.log(randomUserID, email, password);
  users[randomUserID] = {id: randomUserID, email, password};
  res.cookie("user_id", randomUserID);
  res.redirect("/urls");
  }
});


app.get("/login", (req, res) => {
  const users = req.cookies;
  let templateVars = { users, urls: urlDatabase };
  
  res.render('urls_login', templateVars);
});


app.post("/login", (req, res) => {
  const email = req.body.email;
  const passwordEntered = req.body.password;

  if (!findEmailReturnUserID(users, email)) {
    res.status(403).send("Cannot find email");
  } else if (users[findEmailReturnUserID(users, email)].password !== passwordEntered) { 
    res.status(403).send("Password does not match");
  } else {
    res.cookie("user_id", findEmailReturnUserID(users, email));
    res.redirect("/urls");
  }
});


app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/login");
});




// MAIN USER ROUTES

app.get("/", (req, res) => {
  res.send("Hello!");
});


app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL
  const longURL = urlDatabase[shortURL].longURL;
  res.redirect(longURL);
});


app.get("/urls", (req, res) => {
  const user_id = req.cookies["user_id"];
  const loggedInUser = users[`${user_id}`];
  
  if (!loggedInUser) {
    res.redirect("/login")
  };

  let templateVars = {usersObj: loggedInUser, userURLs: urlsForUser(loggedInUser) };
  res.render('urls_index', templateVars);


  // KEEP HERE UNTIL END JUST IN CASE FUNCTION DOESNT WORK PROPERLY. BELOW WORKED
  // let userURLs = {};
  // for (let shortURL in urlDatabase) {
  //   if (urlDatabase[shortURL].userID === loggedInUser.id) {
  //     console.log("YAY!!!", loggedInUser.id, urlDatabase[shortURL].userID)
  //     userURLs[shortURL] = urlDatabase[shortURL]; 
  //   }
  // }
  // let templateVars = {usersObj: loggedInUser, userURLs };
  
});


app.post("/urls", (req, res) => {
//  console.log(urlDatabase)
  // console.log(req.body)
  // console.log(req.cookies)
  const shortURL = generateRandomString();
  
  urlDatabase[shortURL] = {longURL: `${req.body.longURL}`, userID: `${req.cookies["user_id"]}`};
  // console.log(urlDatabase[shortURL])
  
  res.redirect(`/urls/${shortURL}`);
});


app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});


app.get("/urls/new", (req, res) => {
  
  const user_id = req.cookies["user_id"]
  let templateVars = { usersObj: users[`${user_id}`], urls: urlDatabase };
  if (!user_id) {
    res.redirect("/login")
  } else {
    res.render("urls_new", templateVars)
  }

  
});


app.get("/urls/:shortURL", (req, res) => {
  const user_id = req.cookies["user_id"]
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL].longURL;

  let templateVars = { usersObj: users[`${user_id}`], shortURL, longURL};
  res.render('urls_show', templateVars);
});


app.post("/urls/:shortURL/edit", (req, res) => { 
  const newLongURL = req.body.newLongURL;
  const shortURL = req.params.shortURL;
  const user_id = req.cookies["user_id"];
  const loggedInUser = users[`${user_id}`];
  
  if (!loggedInUser) {
    res.status(403).send("You do not have permission to edit/delet this URL")
  } else if (urlDatabase[shortURL] && urlDatabase[shortURL].userID === loggedInUser.id) {
    urlDatabase[shortURL].longURL = newLongURL;
    res.redirect("/urls");
  } else {
    res.status(403).send("You do not have permission to edit/delet this URL")
  }
  

  
});


app.post("/urls/:shortURL/delete", (req, res) => { 
  const shortURL = req.params.shortURL;
  const user_id = req.cookies["user_id"];
  const loggedInUser = users[`${user_id}`];

  if (!loggedInUser) {
    res.status(403).send("You do not have permission to edit/delet this URL")
  } else if (urlDatabase[shortURL] && urlDatabase[shortURL].userID === loggedInUser.id) {
    delete urlDatabase[shortURL];
    res.redirect("/urls");
  } else {
    res.status(403).send("You do not have permission to edit/delet this URL")
  }

});


app.use((req, res) => {
  res.status(404).send(404)
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
