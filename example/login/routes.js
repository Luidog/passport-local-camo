var passport = require('passport');
var Account = require('./models/account');
var router = require('express').Router();

router.get('/', function(req, res) {
  res.render('index', {user: req.user});
});

router.get('/register', function(req, res) {
  res.render('register', {});
});

router.post('/register', async (req, res, next) => {
  console.log('registering user');
  let user = await Account.register(req.body.username, req.body.password);
  req.login(await user.dump(), (e) => {
    if (e) return next(e);
    return res.redirect('/');
  });
});

router.get('/login', function(req, res) {
  res.render('login', {user: req.user});
});

router.post('/login', function(req, res) {
  passport.authenticate('local', (e, user, info) => {
    if (e) return next(e);
    if (! user) return res.redirect('/');
    req.login(user, (e) => {
      if (e) return next(e);
      return res.redirect('/');
    });
  })(req, res, next);
});

router.get('/logout', function(req, res) {
  req.logout();
  res.redirect('/');
});

module.exports = router;