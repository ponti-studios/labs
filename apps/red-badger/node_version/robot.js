/**
 * @class RobotPlanet.Robot
 * @classdesc This class defines the model for a robot.
 * @param {string} top
 * @param {string} right
 * @param {string} orientation
 * @param {RobotPlanet} planet
 * @constructor
 */
module.exports = function(position, orientation, instructions, planet) {

  var robot = this;

  robot.coords = position;

  robot.orientation = orientation;

  robot.instructions = instructions;

  robot.orientations = ['N','E','S','W'];

  robot.planet = planet;

  robot.isAlive = true;

  robot.reportPosition = function() {
    var position = robot.coords.join(' ')+' '+robot.orientation;
    var isLost = robot.isAlive ? '' : ' LOST';
    return position + isLost;
  };

  /**
   * @desc Give robot actions to perform
   * @param {string} instructions
   */
  robot.takeInstructions = function(instructions) {
    if (instructions.length) {
      instructions.split('').forEach(function(instruction) {
        if (robot.isAlive){
          switch(instruction) {
            case 'F':
              if (robot.canMoveForward()) {
                robot.last_positon = robot.coords;
                robot.coords = robot.getNextPosition();
                if (!robot.isInBounds()) {
                  planet.addTombstone(robot);
                  robot.isAlive = false;
                  robot.coords = robot.last_positon;
                }
              }
              break;
            case 'L':
            case 'R':
              var new_index;
              var length = robot.orientations.length;
              var current_index = robot.orientations.indexOf(robot.orientation);

              if (instruction == 'L') {
                new_index = current_index === 0 ? length-1 : current_index-1;
              } else if (instruction === 'R') {
                new_index = current_index === length-1 ? 0 : current_index+1;
              }

              robot.orientation = robot.orientations[new_index];
              break;
          }
        }
      });
    }
  };

  /**
   * Move robot
   */
  robot.move = function() {
    if (robot.canMoveForward()) {
      robot.last_positon = robot.coords;
      robot.coords = robot.getNextPosition();
      if (!robot.isInBounds()) {
        planet.addTombstone(robot);
        robot.isAlive = false;
        robot.coords = robot.last_positon;
      }
    }
  };

  /**
   * Turn robot in a direction
   * @param {string} direction - Possible values: 'L' for left, 'R' for right
   */
  robot.turn = function(direction) {
    var new_index;
    var length = robot.orientations.length;
    var current_index = robot.orientations.indexOf(robot.orientation);

    if (direction == 'L') {
      new_index = current_index === 0 ? length-1 : current_index-1;
    } else if (direction === 'R') {
      new_index = current_index === length-1 ? 0 : current_index+1;
    }

    robot.orientation = robot.orientations[new_index];
  };

  robot.getNextPosition = function() {
    var next_position;

    switch(robot.orientation) {
      case 'N':
        next_position = [robot.coords[0], robot.coords[1]+1];
        break;
      case 'S':
        next_position = [robot.coords[0], robot.coords[1]-1];
        break;
      case 'E':
        next_position = [robot.coords[0]+1, robot.coords[1]];
        break;
      case 'W':
        next_position = [robot.coords[0]-1, robot.coords[1]];
        break;
    }

    return next_position;
  };

  robot.canMoveForward = function() {
    if (!robot.isAlive) return false;

    var next_position = robot.getNextPosition();
    var tombstones = robot.planet.tombstones;

    for (var i = 0; i < tombstones.length; i++) {
      if (tombstones[i].join('') == next_position.join('')) return false;
    }

    return true;
  };

  robot.isInBounds = function() {
    var top = robot.coords[0];
    var left = robot.coords[1];
    var bounds = planet.bounds;
    return ((top>=0) && (top<=bounds[0]) && (left>=0) && (left<=bounds[1]));
  };

};