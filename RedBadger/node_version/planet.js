/**
 * @class RobotPlanet.Planet
 * @classdesc This class defines the model for a planet.
 * @constructor
 */
module.exports = function (config) {

  var RP, isObject;
  var Robot = require('./robot');

  isObject = function (value) {
    return !!(value instanceof Object && !(value instanceof Array));
  };

  RP = function (config) {
    var planet = this;

    /** Array to hold robots */
    planet.robots = [];

    /** Array to hold coordinates of dead robots */
    planet.tombstones = [];

    planet.bounds = [parseInt(config[0]),parseInt(config[1])];

    planet.coords = (function() {
      var array = [];
      var width = planet.bounds[0];
      var height = planet.bounds[1];

      while (height >= 0) {
        for (var i = width; i >= 0; i--) {
          array.push([i, height]);
        }
        height -=1
      }

      return array;
    })();

    /**
     * @desc Add robot to planet
     * @param config
     * @returns {RobotPlanet.Robot}
     */
    planet.createRobot = function(config, instructions) {
      var position = [parseInt(config[0]), parseInt(config[2])];
      var orientation = config[4];
      var robot = new Robot(position, orientation, instructions, planet);
      planet.robots.push(robot);
      return robot;
    };

    /**
     * @desc Add tombstone to planet
     * @param {number} top
     * @param {number} left
     */
    planet.addTombstone = function(robot) {
      planet.tombstones.push(robot.coords);
    };

  };

  return new RP(config || {});

};