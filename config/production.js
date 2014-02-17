var kaskade = require("kaskade"),
env = process.env;


var config = {
  secret: env.SESSION_SECRET,
  host: env.HOST,
  port: process.env.PORT
}

kaskade(config, {
  tellstick: {
    secret:         env.TELLSTICK_SECRET,
    token:          env.TELLSTICK_TOKEN,
    privKey:        env.TELLSTICK_PRIV_KEY,
    pubKey:         env.TELLSTICK_PUB_KEY,
  },
  auth: {
    facebook: {
      clientID:     env.FACEBOOK_CLIENT_ID,
      clientSecret: env.FACEBOOK_CLIENT_SECRET,
      ids:          env.FACEBOOK_IDS.split(','),
      callbackURL:  config.host+"/auth/facebook/callback",
    },
    github: {
      clientID:     env.GITHUB_CLIENT_ID,
      clientSecret: env.GITHUB_CLIENT_SECRET,
      ids:          env.GITHUB_IDS.split(','),
      callbackURL:  config.host+"/auth/github/callback",
    }
  }
});

module.exports = config;
