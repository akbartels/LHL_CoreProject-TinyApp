const express = require("express");
const app = express();
const {
  urlDatabase,
  users
} = require("./database");

const {
  generateRandomString,
  getUserIdByEmail,
  urlsForUser
} = require("./helpers");

// const cookieParser = require('cookie-parser');
// app.use(cookieParser());

const cookieSession = require('cookie-session');

app.use(cookieSession({
  name: 'session',
  keys: ['sf98745hksg8'],

  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));

app.set('view engine', 'ejs');

const bcrypt = require('bcrypt');
const saltRounds = 10;

const PORT = 8080; // default port 8080

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));




// REGISTER/LOG IN/OUT ROUTES
app.get("/register", (req, res) => { // QUESTION PENDING
  
  // const userIdCookie = req.cookies;
  const userIdCookie = req.session.userIdCookie;

  let templateVars = {user: userIdCookie, urls: urlDatabase }; // is this needed here???
  
  res.render('urls_register', templateVars);
});

app.post("/register", (req, res) => {
  const email = req.body.email;
  const plainTextPassword = req.body.password;
  const hashedPassword = bcrypt.hashSync(plainTextPassword, saltRounds);
 
  if (!email || !plainTextPassword) {
    res.status(400).send("You must enter an e-mail AND a password");
  } else if (getUserIdByEmail(users, email)) {
    res.status(400).send("The email you entered is already in use");
  } else {
    const randomUserID = generateRandomString();
    // console.log(randomUserID, email, password);
    users[randomUserID] = {id: randomUserID, email, hashedPassword};
    console.log(users);
    // res.cookie("userIdCookie", randomUserID);
    req.session.userIdCookie = randomUserID;
    res.redirect("/urls");
  }
});


app.get("/login", (req, res) => {
  // const users = req.cookies;
  const userIdCookie = req.session.userIdCookie;
  let templateVars = { users, urls: urlDatabase };
  
  res.render('urls_login', templateVars);
});


app.post("/login", (req, res) => {
  const enteredEmail = req.body.email;
  const passwordEntered = req.body.password;
  
  if (!getUserIdByEmail(users, enteredEmail)) {
    res.status(403).send("Cannot find email");
  } else if (!passwordEntered) {
    res.status(403).send("You need to enter a password");
  }
  
  const usersHashedPassword = users[getUserIdByEmail(users, enteredEmail)].hashedPassword;
  const passwordCorrect = bcrypt.compareSync(passwordEntered, usersHashedPassword);
  
  if (passwordCorrect) {
    req.session.userIdCookie = getUserIdByEmail(users, enteredEmail); //*****//
    res.redirect("/urls");
  } else {
    res.status(403).send("The password you entered is not correct");
  }

});


app.post("/logout", (req, res) => {
  // res.clearCookie("userIdCookie"); //*****/
  req.session = null;
  res.redirect("/login");
});




// MAIN USER ROUTES

app.get("/", (req, res) => {
  res.send("Hello!");
});


app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL].longURL;
  res.redirect(longURL);
});


app.get("/urls", (req, res) => {
  // const userIdCookie = req.cookies["userIdCookie"];
  const userIdCookie = req.session.userIdCookie;
  const loggedInUser = users[`${userIdCookie}`];
  
  if (!loggedInUser) {
    res.redirect("/login");
  }

  let templateVars = {usersObj: loggedInUser, userURLs: urlsForUser(loggedInUser.id, urlDatabase) };
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
  
  urlDatabase[shortURL] = {longURL: `${req.body.longURL}`, userID: `${req.session.userIdCookie}`};
  // console.log(urlDatabase[shortURL])
  
  res.redirect(`/urls/${shortURL}`);
});


app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});


app.get("/urls/new", (req, res) => {
  
  // const userIdCookie = req.cookies["userIdCookie"]
  const userIdCookie = req.session.userIdCookie;
  let templateVars = { usersObj: users[`${userIdCookie}`], urls: urlDatabase };
  if (!userIdCookie) {
    res.redirect("/login");
  } else {
    res.render("urls_new", templateVars);
  }
});


app.get("/urls/:shortURL", (req, res) => {
  // const userIdCookie = req.cookies["userIdCookie"]
  const userIdCookie = req.session.userIdCookie;
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL].longURL;

  let templateVars = { usersObj: users[`${userIdCookie}`], shortURL, longURL};
  res.render('urls_show', templateVars);
});


app.post("/urls/:shortURL/edit", (req, res) => {
  const newLongURL = req.body.newLongURL;
  const shortURL = req.params.shortURL;
  // const userIdCookie = req.cookies["userIdCookie"];
  const userIdCookie = req.session.userIdCookie;
  const loggedInUser = users[`${userIdCookie}`];
  
  if (!loggedInUser) {
    res.status(403).send("You do not have permission to edit/delet this URL");
  } else if (urlDatabase[shortURL] && urlDatabase[shortURL].userID === loggedInUser.id) {
    urlDatabase[shortURL].longURL = newLongURL;
    res.redirect("/urls");
  } else {
    res.status(403).send("You do not have permission to edit/delet this URL");
  }
});


app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;
  // const userIdCookie = req.cookies["userIdCookie"];
  const userIdCookie = req.session.userIdCookie;
  const loggedInUser = users[`${userIdCookie}`];

  if (!loggedInUser) {
    res.status(403).send("You do not have permission to edit/delet this URL");
  } else if (urlDatabase[shortURL] && urlDatabase[shortURL].userID === loggedInUser.id) {
    delete urlDatabase[shortURL];
    res.redirect("/urls");
  } else {
    res.status(403).send("You do not have permission to edit/delet this URL");
  }

});


app.use((req, res) => {
  res.status(404).send(404);
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
