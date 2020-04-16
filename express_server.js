const express = require("express");
const cookieParser = require('cookie-parser');
const app = express();
const PORT = 8080; // default port 8080

app.set('view engine', 'ejs');
app.use(cookieParser());

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
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
  }
}

// creates a random alphanumeric string 6 chars long
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
  console.log(req.cookies)
  const users = req.cookies;
  let templateVars = { users, urls: urlDatabase };
  
  res.render('urls_login', templateVars);
});


app.post("/login", (req, res) => {
  console.log(req.body)
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
  res.redirect("/urls");
});




// MAIN USER ROUTES

app.get("/", (req, res) => {
  res.send("Hello!");
});


app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});


app.get("/urls", (req, res) => {
  const user_id = req.cookies["user_id"];
  

  let templateVars = {usersObj: users[`${user_id}`] , urls: urlDatabase };

  console.log(templateVars)
  res.render('urls_index', templateVars);
});


app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;
  
  res.redirect(`/urls/${shortURL}`);
});


app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});


app.get("/urls/new", (req, res) => {
  const user_id = req.cookies["user_id"]
  let templateVars = { usersObj: users[`${user_id}`], urls: urlDatabase };

  console.log(templateVars)
  res.render("urls_new", templateVars);
});


app.get("/urls/:shortURL", (req, res) => {
  const user_id = req.cookies["user_id"]
  let shortURL = req.params.shortURL;
  let templateVars = { usersObj: users[`${user_id}`], shortURL: shortURL, longURL: urlDatabase[shortURL]};
  res.render('urls_show', templateVars);
});


app.post("/urls/:shortURL/edit", (req, res) => {
  const newLongURL = req.body.newLongURL;
  const shortURL = req.params.shortURL;
  if (urlDatabase[shortURL]) {
    urlDatabase[shortURL] = newLongURL;
  }
  res.redirect("/urls");
});


app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;
  if (urlDatabase[shortURL]) {
    delete urlDatabase[shortURL];
    res.redirect("/urls");
  }
});


app.use((req, res) => {
  res.status(404).send(404)
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}! \n${users}`);
});