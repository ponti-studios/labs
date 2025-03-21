/**
 * @class RobotPlanet.Robot
 * @classdesc This class defines the model for a robot.
 * @param {string} config - Example: '1 1 E'
 * @param {RobotPlanet} planet
 * @constructor
 */
RobotPlanet.Robot = function(config, planet) {

  var robot = this;

  /** Robot Events */
  robot.events = {
    moved: new CustomEvent('moved'),
    death: new CustomEvent('death')
  };

  /* Split config string to get position and orientation */
  robot.initial_config = config.split(' ');

  /* Number of pixels robot will move per instruction */
  robot.num_steps = 50;

  robot.planet = planet;

  robot.id = planet.robots.length+1;

  robot.orientation = robot.initial_config[2];

  robot.orientations = ['N','E','S','W'];

  /**
   * @desc Give robot actions to perform
   * @param {string} instructions
   */
  robot.takeInstructions = function(instructions) {
    var isString = typeof instructions == 'string';
    if (isString && instructions.length && robot.el.parentElement) {
      instructions.split('').forEach(function(instruction) {
        switch(instruction) {
          case 'F':
            robot.move();
            break;
          case 'L':
          case 'R':
            robot.turn(instruction);
            break;
        }
      });
    }
  };

  /**
   * Move robot
   * @param {string} direction - Direction to move robot. Possible values:
   * 'U','N','D','S','L','W','R','E'
   */
  robot.move = function(direction) {
    if (robot.el.parentElement && robot.canMoveForward()) {
      var position = robot.getPosition();
      var pixels = robot.num_steps;

      var getNewPosition = function(position, steps) {
        return Math.floor(parseInt(position))+steps+'px';
      };

      switch (direction || robot.orientation) {
        case 'U':
        case 'N':
          robot.el.style.top = getNewPosition(position.top, -pixels);
          break;
        case 'D':
        case 'S':
          robot.el.style.top = getNewPosition(position.top, pixels);
          break;
        case 'L':
        case 'W':
          robot.el.style.left = getNewPosition(position.left, -pixels);
          break;
        case 'R':
        case 'E':
          robot.el.style.left = getNewPosition(position.left, pixels);
          break;
      }

      robot.fireEvent(robot.events.moved);
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

    robot.el.classList.remove(robot.orientation);
    robot.orientation = robot.orientations[new_index];
    robot.el.classList.add(robot.orientation);
  };

  /**
   * @desc Get robot's position within planet
   */
  robot.getPosition = function() {
    return {
      top: parseInt(robot.el.style.top),
      left: parseInt(robot.el.style.left)
    };
  };

  /**
   * @desc Determine if robot is still inside of parent element
   */
  robot.isOnPlanet = function() {
    var planet_position = robot.planet.getPosition();
    var robot_position = robot.el.getBoundingClientRect();

    /* Compare positions */
    var isToTheLeft = robot_position.left >= planet_position.left;
    var isToTheRight = robot_position.right <= planet_position.right;
    var isBelowTop = robot_position.top >= planet_position.top;
    var isAboveBottom =robot_position.bottom <= planet_position.bottom;

    var isOnPlanet = (isToTheLeft&&isBelowTop&&isAboveBottom&&isToTheRight);

    if (!isOnPlanet) {
      robot.fireEvent(robot.events.death);
    }

    return isOnPlanet;
  };

  /**
   * Add event listener to robot element
   * @param {string} event
   * @param {function} action
   */
  robot.on = function(event, action) {
    robot.el.addEventListener(event, action);
  };

  /**
   * @desc Fire event from robot element
   * @param {CustomEvent} event
   */
  robot.fireEvent = function(event) {
    robot.el.dispatchEvent(event);
  };

  robot.canMoveForward = function() {
    var next_position;
    var robot_pos = robot.getPosition();
    var tombstones = robot.planet.tombstones;

    switch(robot.orientation) {
      case 'N':
        next_position = [robot_pos.top-50, robot_pos.left];
        break;
      case 'S':
        next_position = [robot_pos.top+50, robot_pos.left];
        break;
      case 'E':
        next_position = [robot_pos.top, robot_pos.left+50];
        break;
      case 'W':
        next_position = [robot_pos.top, robot_pos.left-50];
        break;
    }

    for (var i = 0; i < tombstones.length; i++) {
      if (tombstones[i].join('') == next_position.join('')) return false;
    }

    return true;
  };

  planet.robots.push(this);

  (function() {
    var el = document.createElement('div');
    el.classList.add('robot');

    /** Set class of orientation to robot element */
    el.classList.add(robot.orientation);

    /** Define data-robot-id for robot element */
    el.dataset.robotId = robot.id;

    /** Set robot position in planet */
    el.style.top = ((robot.initial_config[0]-1) * 50)+'px';
    el.style.left = ((robot.initial_config[1]-1) * 50)+'px';

    robot.elSelector = '[data-robotId='+robot.id+']';

    /** Assign el to robot */
    robot.el = el ? el : null;

    /** Make input field for robot */
    var input = document.createElement('input');
    input.type = 'text';
    input.dataset.robotId = robot.id;
    input.placeholder = 'Robot '+robot.id+' Instructions';
    input.style.position = 'absolute';
    input.style.top = '450px';
    input.style.width = '100%';
    input.style.fontSize = '1.3rem';
    input.onkeyup = function(e) {
      if (e.keyCode === 13) {
        robot.takeInstructions(e.target.value);
      }
    };

    robot.planet.el.appendChild(input);

    /** Attach events */
    robot.on('moved', robot.isOnPlanet);
    robot.on('death', robot.planet.addTombstone);
  })();

};