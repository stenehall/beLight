var express = require('express');
var app = module.exports = express();
var passport = require('passport'),
TwitterStrategy = require('passport-facebook').Strategy,
GitHubStrategy = require('passport-github').Strategy,
FacebookStrategy = require('passport-facebook').Strategy;

var config = require('../../config/config.js');

app.use(express.cookieParser(config.secret));
app.use(express.cookieSession({
  secret : config.secret,
  cookie : {
    maxAge: (365 * 24 * 60 * 60 * 1000)
  }
}));


app.set('views', __dirname + '/../main/views');
app.use(passport.initialize());
app.use(passport.session());


// No idea how to test this
passport.serializeUser(function(user, done) {
  var tmp = {id: String(user.id)}; // Make sure to always use a string
  done(null, tmp);
});

// No idea how to test this
passport.deserializeUser(function(obj, done) {
  done(null, obj);
});

passport.use(new FacebookStrategy( config.auth.facebook, function(accessToken, refreshToken, profile, done) { done(null, profile); } ));
passport.use(new GitHubStrategy( config.auth.github, function(accessToken, refreshToken, profile, done) { done(null, profile); } ));

// These need to be faked
app.get('/auth/facebook', passport.authenticate('facebook'));
app.get('/auth/github',   passport.authenticate('github'));

// This needs to check for valid return handling
app.get('/auth/facebook/callback',
  passport.authenticate('facebook', { failureRedirect: '/login' }),
  function(req, res) {
    res.redirect('/');
  });

// This needs to check for valid return handling
app.get('/auth/github/callback',
  passport.authenticate('github', { failureRedirect: '/login' }),
  function(req, res) {
    res.redirect('/');
  });

app.get('/login', function(req, res) {
  res.render('login.html', {host: false});
});

// Make sure session is purged
app.get('/logout', function(req, res){
  req.logout();
  res.redirect('/login');
});


// Make sure it handles facebook and github correctly
app.ensureAuthenticated = function ensureAuthenticated(req, res, next) {

  if (req.isAuthenticated())
  {
    // Make sure user is in facebook or twitter auth arrays
    if (config.auth.facebook.ids.indexOf(req.user.id) !== -1 ||
        config.auth.github.ids.indexOf(req.user.id) !== -1)
    {
      return next();
    }
  }
  res.redirect('/login');
};
