var config = require('../../config/config.js');
var schedule = config.schedule;

var later = require('later');
var scheduler = module.exports = function() { };

scheduler.init = function init(tell, io) {

  this.tell = tell;
  this.io = io;

  schedule.forEach(function(value, id) {
    var sched = later.parse.cron(value.time);
    var timer = later.setInterval(function() {
      scheduler.changeState(value);
    }, sched);
  });
};

scheduler.changeState = function changeState(value) {
  var state = value.action == 1 ? 'turnOn' : 'turnOff';
  var query = "device/" + state + "?id=" + value.id;
  var devices = this.tell.getDevicesById();

  if (devices[value.id].type == 'group')
  {
    var group_devices = devices[value.id].devices.split(',');
    group_devices.forEach(function(device_id) {
      if (devices[device_id] !== undefined)
      {
        devices[device_id].state = value.action;
        io.sockets.emit('update', { state: value.action, device: device_id });
      }
    });
  }

  this.tell.doQuery(query, undefined, undefined, function() {
    this.io.sockets.emit('update', { state: value.action, device: value.id });
  }.bind(this));
};
