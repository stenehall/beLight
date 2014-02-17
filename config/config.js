var kaskade = require("kaskade"),
    env = process.env;

// Load default config
var config = require('./default');

// Load envirement based config
kaskade(config, require('./'+env.NODE_ENV));

module.exports = config;
