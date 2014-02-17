var OAuth = require('oauth'),
    winston = require('winston');


var tell = module.exports = function() { };

var config = require('../../config/config.js');

var devicesByNames = {'Groups': [], 'Rest': []};
var devicesById = {};

var oauth = new OAuth.OAuth(
  'http://api.telldus.com/oauth/requestToken',
  'http://api.telldus.com/oauth/accessToken',
  config.tellstick.pubKey,
  config.tellstick.privKey,
  '1.0',
  null,
  'HMAC-SHA1'
  );


tell.getDevicesById = function getDevicesById() {
  return devicesById;
};

tell.getDevicesByName = function getDevicesByName() {
  return devicesByNames;
};

tell.getDevicesList =  function getDevicesList(callback) {
  var query = "devices/list?supportedMethods=1";
  tell.doQuery(query, undefined, undefined, function(response) {

    data = JSON.parse(response);
    if (data.device !== undefined)
    {
      devicesByNames = [];
      devicesById = [];

      data.device.forEach(function(device) {

        var split;

        if (device.type === 'group')
        {
          split = ['Groups', device.name];
        }
        else
        {
          split = device.name.split(' - ');
          if (split.length < 2)
          {
            split.unshift('Rest');
          }
        }

        device.short_name = split[1];
        if(devicesByNames[split[0]] === undefined)
        {
          devicesByNames[split[0]] = [];
        }
        devicesByNames[split[0]].push(device);
        devicesById[device.id] = device;
      });
    }
    // This really should pass err
    if(callback !== undefined)
    {
      callback();
    }
  });
};


tell.doQuery = function doQuery(query, req, res, callback) {

  var ip = 'internal';

  if (req !== undefined) {
    ip = req.headers['x-forwarded-for'] ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    req.connection.socket.remoteAddress;
  }

  var out = new Date() + ' - ' + ip + ' - ' + query;

  oauth.get(
    config.tellstick.basePath+query,
    config.tellstick.token,
    config.tellstick.secret,
    function(err, data, response) {
      if (err)
      {
        out = out + ' - ' + require('util').inspect(err)+"\n";
      }
      else
      {
        out = out + ' - ' + require('util').inspect(data)+"\n";
      }
      winston.debug(out);

      if (callback !== undefined)
      {
        callback(data, err);
      }

      if (res !== undefined) {
        done(res);
      }
    });
}


function done(res) {
  try {
    res.send('done');
  } catch(err) {

  }
}
