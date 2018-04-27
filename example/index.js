'use strict';
const express = require('express');
const passport = require('passport');
const { Strategy } = require('passport-local');
const LocalStrategy = Strategy;
const { connect } = require('marpat');
const bodyParser = require('body-parser');
const { User } = require('./user');

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.json());
app.use(passport.initialize());

passport.serializeUser(User.serialize);
passport.deserializeUser(User.deserialize);
passport.use(
  new LocalStrategy(
    {
      usernameField: 'name',
      passwordField: 'password'
    },
    (name, password, done) => User.authenticate(name, password, done)
  )
);

app.post('/register', (req, res) => {
  User.register(req.body.name, req.body.password)
    .then(user => res.status(200).json(user))
    .catch(error => res.status(400).json(error));
});

app.post('/authenticate', (req, res, next) => {
  passport.authenticate('local', (error, user, info) => {
    error = error || info;
    if (error) return res.status(401).json({ message: error.message });
    if (!user)
      return res
        .status(401)
        .json({ message: 'There is no user for that token' });
    return res.status(200).json(user);
  })(req, res, next);
});

app.post('/reset', (req, res, next) => {
  User.resetPassword(req.body.current, req.body.new);
});

connect('nedb://memory').then(db =>
  app.listen(3000, () => console.log('Example app listening on port 3000!'))
);
