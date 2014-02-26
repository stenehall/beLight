var express = require('express'),
http = require('http'),
app = exports.app = express(),
server = http.createServer(app),
io = require('socket.io').listen(server, {log: false}),
winston = require('winston'),
passport = require('passport'),
FacebookStrategy = require('passport-facebook').Strategy,
auth = require('../auth'),
tell= require('../tell'),
schedule = require('../schedule'),
config = require('../../config/config.js');


io.configure('production', function () {
  io.enable('log');
  io.set('log level', 1); // reduce logging
  io.set("transports", ["xhr-polling"]);
  io.set("polling duration", 10);
});

app.configure('production', 'development', function() {
  var winstonStream = {
    write: function(message, encoding){
      winston.info(message.slice(0, -1));
    }
  };
  app.use(express.logger({stream:winstonStream}));
});

app.configure('development', function() {
  winston.setLevels(winston.config.syslog.levels);
});

app.configure(function() {
  app.use(express.static('public'));
  app.use(express.cookieParser());
  app.use(auth);
  app.use(app.router);

  app.set('views', __dirname + '/views');
  app.engine('html', require('ejs').renderFile);

  app.use("/media", express.static(__dirname + '/../../media'));
});

// Show the basic page. Iterate over devices
app.get('/', auth.ensureAuthenticated, function(req, res) {
  var devicesByName = tell.getDevicesByName();
  res.render('index.html', {devices: devicesByName, host: config.host});
});


// Update a device or a group
app.get('/update', auth.ensureAuthenticated, function(req, res) {

  // Make sure we have a state and a device
  if(req.query.state === undefined || req.query.device === undefined)
  {
    res.send(400);
    return;
  }

  var state = req.query.state == '1' ? 'turnOn' : 'turnOff';
  var query = "device/" + state + "?id=" + req.query.device;
  var devices = tell.getDevicesById();

  // Couldn't find the device
  if(devices[req.query.device] === undefined)
  {
    res.send(400);
    return;
  }

  devices[req.query.device].state = req.query.state;

  if (devices[req.query.device].type == 'group')
  {
    var group_devices = devices[req.query.device].devices.split(',');

    group_devices.forEach(function(device_id) {
      if (devices[device_id] !== undefined)
      {
        devices[device_id].state = req.query.state;
        io.sockets.emit('update', { state: req.query.state, device: device_id });
      }
    });
  }

  tell.doQuery(query, req, res, function() {
    io.sockets.emit('update', { state: req.query.state, device: req.query.device });
    res.send(200);
    return;
  });
});

if ( ! module.parent) // Is this nasty?
{
  // Are we spaming the api with this?
  setInterval(function() {
    tell.getDevicesList(function() {
      var devicesById = tell.getDevicesById();
      for (var i in devicesById)
      {
        io.sockets.emit('update', { state: devicesById[i].state, device: devicesById[i].id });
      }
    });
  }, 60000);


  // Init tellstick connection and start the schedule
  tell.getDevicesList(function() {
    io.sockets.on('connection', function (socket) {
      var devicesById = tell.getDevicesById();
      for (var i in devicesById)
      {
        socket.emit('update', { state: devicesById[i].state, device: devicesById[i].id });
      }
    });

    schedule.init(tell, io);
    server.listen(config.port);

    winston.info('Listening on port '+config.port);
  });
}
