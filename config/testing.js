module.exports = {
  tellstick: {
    SECRET: '123',
    TOKEN: '456',
    PRIV_KEY: '123',
    PUB_KEY: '456',
    basePath: 'http://api.telldus.com/json/'
  },
  auth: {
    facebook: {
      clientID : '123',
      clientSecret : '456',
      callbackURL : "http://127.0.0.1:5000/auth/facebook/callback",
      ids : ['123', '456']
    },
    github: {
      clientID : '123',
      clientSecret : '456',
      callbackURL : "http://127.0.0.1:5000/auth/github/callback",
      ids : [123, 456]
    }
  },

  secret: 'fake',
  host: 'http://127.0.0.1',
  port: 5000
};