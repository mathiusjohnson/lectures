const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const uuid = require('uuid/v4');
const cookieSession = require("cookie-session");

const app = express();
const port = 1234;
const users = [];

app.set('view engine', 'ejs');

app.use(
  cookieSession({
    name: "lecture",
    keys: ["key1", "key2"]
  })
);
app.use(morgan('dev'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static('public'));

app.get('/login', (req, res) => {
  res.render('login');
});

app.get('/register', (req, res) => {
  res.render('register');
});

app.get('*', (req, res) => {
  if (!req.session.userId) {
    return res.redirect('/login');
  }
  const { userId } = req.session;
  const user = users.find((user) => user.id === userId);
  if (!user) {
    return res.redirect('/login');
  }
  console.log(users);
  res.render('protected', { user });
});

app.post('/login', (req, res) => {
  const { email, password } = req.body;
  const user = users.find((user) => user.email === email);
  if (!user) {
    return res.status(401).send('No user with that email found');
  }
  if (user.password !== password) {
    return res.status(401).send('Password incorrect');
  }
  req.session.userId = user.id;
  res.redirect('/protected');
});

app.post('/register', (req, res) => {
  const { email, password } = req.body;
  if (users.some((user) => user.email === email)) {
    return res.status(403).send('User with that email already exists');
  }
  const userId = uuid().split('-')[0];
  users.push({
    id: userId,
    email,
    password
  });
  req.session.userId = userId;
  res.redirect('/protected');
});

app.post('/logout', (req, res) => {
  req.session = null;
  res.redirect('/login');
});

app.listen(port, () => {
  console.log(`App is listening on ${port}`);
});
