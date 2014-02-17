var assert = require('chai').assert,
request = require('supertest'),
nock = require('nock'),
config = require('../../../config/config.js');

var app;

describe('Make sure config works', function() {
  it("should have all needed settings in config");
});


describe('Main unauthorized', function(){

  beforeEach(function() {
    // Since we're adding things to our app we need to make sure we have an uncache version
    delete require.cache[require.resolve('../index')];
    app = require('../index').app;
  });

  it("should redirect to /login if not authorized when trying to access /", function() {
    request(app)
    .get('/')
    .expect(302)
    .end(function(err, res){
      if (err) throw err;
    });
  });

  it("should redirect to /login if not authorized when trying to access /update", function() {
    request(app)
    .get('/update')
    .expect(302)
    .end(function(err, res){
      if (err) throw err;
    });
  });

  it("should redirect you to /login even if you're authorized as long as you're not in the auth ids array", function() {
    app.stack.unshift({ // First middleware
      route: '',
      handle: function (req, res, next) {
        req.user = {id: 123456};
        req.isAuthenticated = function () {
          return true;
        };
        next();
      }
    });

    request(app)
    .get('/')
    .expect(302)
    .end(function(err, res){
      if (err) throw err;
    });
  });
});

describe('Main authorized', function(){

  beforeEach(function() {
    delete require.cache[require.resolve('../index')];
    app = require('../index').app;

    app.stack.unshift({ // First middleware
      route: '',
      handle: function (req, res, next) {
        req.user = {id: config.auth.github.ids[0]};

        req.isAuthenticated = function () {
          return true;
        };

        next();
      }
    });
  });

  it("should let you view / if authorized with the correct ids", function() {
    request(app)
    .get('/')
    .expect(200)
    .end(function(err, res){
      if (err) throw err;
    });
  });

  it("should give you a 400 when trying to update with the wrong params", function() {
    request(app)
    .get('/update')
    .expect(400)
    .end(function(err, res){
      if (err) throw err;
    });
  });

  it("should return 400 when trying to update with the right params but the device is missing", function() {
    request(app)
    .get('/update?state=1&device=1')
    .expect(400)
    .end(function(err, res){
      if (err) throw err;
    });
  });

  it("should return 200 when trying to update with the right params for a device existing", function(done) {
    var tell= require('../../tell');
    var devicesById = tell.getDevicesById();

    // Time to mock!
    nock('http://api.telldus.com')
    .get('/json/device/turnOn?id=1')
    .reply(200, '{status:"success?!?!"}');

    devicesById[1] = {state: 0};

    request(app)
    .get('/update?state=1&device=1')
    .expect(200)
    .end(function(err, res){
      if (err) throw err;
      done();
    });
  });

  it("should update state of device", function(done) {
    var tell= require('../../tell');
    var devicesById = tell.getDevicesById();

    // Time to mock!
    nock('http://api.telldus.com')
    .get('/json/device/turnOn?id=1')
    .reply(200, '{status:"success?!?!"}');

    devicesById[1] = {state: 0};

    request(app)
    .get('/update?state=1&device=1')
    .expect(200)
    .end(function(err, res){
      assert.equal(devicesById[1].state, 1);
      if (err) throw err;
      done();
    });
  });

});
