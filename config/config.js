var kaskade = require("kaskade"),
    env = process.env;

// Load default config
var config = require('./default');

// Load envirement based config
if(env.NODE_ENV === undefined) throw new Error('Need to provide a NODE_ENV');
kaskade(config, require('./'+env.NODE_ENV));

module.exports = config;
