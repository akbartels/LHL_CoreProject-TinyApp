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


const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));


app.post("/login", (req, res) => {
  console.log(req.body)
  const email = req.body.email;
  res.cookie("email", email);
  res.redirect("/urls");
});


app.post("/logout", (req, res) => {
  res.clearCookie("email");
  res.clearCookie("password");
  res.clearCookie("id");
  res.redirect("/urls");
});


app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;
  
  res.redirect(`/urls/${shortURL}`);
});


app.post("/register", (req, res) => {
  // console.log(req.body)
  const randomUserID = generateRandomString();
  const email = req.body.email;
  const password = req.body.password;
  // console.log(randomUserID, email, password);
  users[randomUserID] = {id: randomUserID, email, password};
  console.log(users);
  res.cookie("email", email);
  res.cookie("password", password);
  res.cookie("id", randomUserID);
  res.redirect("/urls")
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



app.get("/", (req, res) => {
  res.send("Hello!");
});


app.get("/register", (req, res) => {
  const users = req.cookies;
  let templateVars = { users, urls: urlDatabase };
  
  res.render('urls_register', templateVars);
});


app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});


app.get("/urls", (req, res) => {
  const users = req.cookies;
  let templateVars = { users, urls: urlDatabase };
  res.render('urls_index', templateVars);
});


app.get("/urls/new", (req, res) => {
  const users = req.cookies;
  let templateVars = { users, urls: urlDatabase };

  console.log(templateVars)
  res.render("urls_new", templateVars);
});


app.get("/urls/:shortURL", (req, res) => {
  const users = req.cookies;
  let shortURL = req.params.shortURL;
  let templateVars = { users, shortURL: shortURL, longURL: urlDatabase[shortURL]};
  res.render('urls_show', templateVars);
});


app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});


app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});


app.use((req, res) => {
  res.status(404).send(404)
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!` + urlDatabase);
});