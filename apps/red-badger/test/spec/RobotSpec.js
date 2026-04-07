/**
 * Tests for RobotPlanet.Robot
 */
describe('RobotPlanet.Robot', function() {

  var planet, robot;

  beforeEach(function() {
    planet = new RobotPlanet({ name: 'FooPlanet' });
    spyOn(planet, 'addTombstone').and.callThrough();
    robot = planet.createRobot('1 1 N');
    spyOn(robot, 'isOnPlanet').and.callThrough();
  });

  afterEach(function() {
    planet.destroy();
    robot = null;
  });

  describe('init', function() {
    it('should have an orientaton', function() {
      expect(robot.orientation).toEqual('N');
    });
    it('should have an initial top position', function() {
      expect(robot.el.style.top).toEqual('0px');
    });
    it('should have an initial left position', function() {
      expect(robot.el.style.left).toEqual('0px');
    });
    it('should have an HTMLElement assigned to its el', function() {
      expect(robot.el instanceof HTMLElement).toEqual(true);
    });
    it('should be added to planet', function() {
      expect(planet.robots[0]).toBe(robot);
    });
    it('should appear in planet element', function() {
      var robotEl = planet.el.children.item('[data-robot-id="'+robot.id+'"]');
      expect(robotEl).not.toEqual(null);
      expect(robotEl instanceof HTMLElement).toEqual(true);
    });
    it('should have a class of robot', function() {
      expect(robot.el.classList.contains('robot')).toEqual(true);
    });
    it('should be positioned within planet element', function() {
      var robot_position = robot.el.getBoundingClientRect();
      var planet_position = planet.getPosition();
      expect(robot_position.top >= planet_position.top).toEqual(true);
      expect(robot_position.left >= planet_position.left).toEqual(true);
      expect(robot_position.right < planet_position.right).toEqual(true);
      expect(robot_position.bottom < planet_position.bottom).toEqual(true);
    });
  });

  describe('#turn', function() {
    it('should turn robot left', function() {
      robot.turn('L');
      expect(robot.orientation).toEqual('W');
      expect(robot.el.classList.contains('W')).toEqual(true);
      robot.turn('L');
      expect(robot.orientation).toEqual('S');
      expect(robot.el.classList.contains('S')).toEqual(true);
      robot.turn('L');
      expect(robot.orientation).toEqual('E');
      expect(robot.el.classList.contains('E')).toEqual(true);
      robot.turn('L');
      expect(robot.orientation).toEqual('N');
      expect(robot.el.classList.contains('N')).toEqual(true);
    });
    it('should turn robot right', function() {
      robot.turn('R');
      expect(robot.orientation).toEqual('E');
      expect(robot.el.classList.contains('E')).toEqual(true);
      robot.turn('R');
      expect(robot.orientation).toEqual('S');
      expect(robot.el.classList.contains('S')).toEqual(true);
      robot.turn('R');
      expect(robot.orientation).toEqual('W');
      expect(robot.el.classList.contains('W')).toEqual(true);
      robot.turn('R');
      expect(robot.orientation).toEqual('N');
      expect(robot.el.classList.contains('N')).toEqual(true);
    });
    it('should be able to switch between orientations', function() {
      robot.turn('L');
      expect(robot.orientation).toEqual('W');
      expect(robot.el.classList.contains('W')).toEqual(true);
      robot.turn('L');
      expect(robot.orientation).toEqual('S');
      expect(robot.el.classList.contains('S')).toEqual(true);
      robot.turn('R');
      expect(robot.orientation).toEqual('W');
      expect(robot.el.classList.contains('W')).toEqual(true);
      robot.turn('L');
      expect(robot.orientation).toEqual('S');
      expect(robot.el.classList.contains('S')).toEqual(true);
      robot.turn('L');
      expect(robot.orientation).toEqual('E');
      expect(robot.el.classList.contains('E')).toEqual(true);
    });
  });

  describe('#move', function() {

    var initial_position;

    beforeEach(function() {
      initial_position = Object.create(robot.getPosition());
    });

    afterEach(function() {
      initial_position = null;
    });

    it('should move robot left', function() {
      robot.move('L');
      var left_position = parseInt(initial_position.left)-50;
      expect(robot.getPosition().left).toEqual(left_position);
    });

    it('should move robot right', function() {
      robot.move('R');
      var left_position = parseInt(initial_position.left)+50;
      expect(robot.getPosition().left).toEqual(left_position);
    });

    it('should move robot forward', function() {
      robot.move('U');
      var top_position = parseInt(initial_position.top)-50;
      expect(robot.getPosition().top).toEqual(top_position);
    });

  });

  describe('#getPosition', function() {
    var robot_position,
        planet_position;

    beforeEach(function() {
      robot_position = robot.getPosition();
      planet_position = planet.getPosition();
    });

    afterEach(function() {
      robot_position = null;
      planet_position = null;
    });

    it('should return an object containing robot position', function() {
      expect(robot_position instanceof Object).toEqual(true);
      expect(typeof robot_position.left).toEqual('number');
      expect(typeof robot_position.top).toEqual('number');
    });

    it('should be able to return robot position', function() {
      expect(robot.getPosition().top).toEqual(0);
      expect(robot.getPosition().left).toEqual(0);
    });
  });

  describe('#takeInstructions', function() {

    var initial_position;

    beforeEach(function() {
      initial_position = Object.create(robot.getPosition());
    });

    afterEach(function() {
      initial_position = null;
    });

    it('should move forward when given an F', function() {
      robot.takeInstructions('F');
      var top_position = parseInt(initial_position.top)-50;
      expect(robot.el.style.top).toEqual(top_position+'px');
    });
    it('should turn right when given an R', function() {
      robot.takeInstructions('R');
      expect(robot.orientation).toEqual('E');
      expect(robot.el.classList.contains('N')).toEqual(false);
      expect(robot.el.classList.contains('E')).toEqual(true);
    });
    it('should turn left when given an L', function() {
      robot.takeInstructions('L');
      expect(robot.orientation).toEqual('W');
      expect(robot.el.classList.contains('N')).toEqual(false);
      expect(robot.el.classList.contains('W')).toEqual(true);
    });
  });

  describe('#isOnPlanet', function() {

    var planet_position, robot_height;

    beforeEach(function() {
      planet_position = planet.getPosition();
      robot_height = robot.el.getBoundingClientRect().height;
    });

    afterEach(function() {
      planet_position = null;
    });

    it('should return true if robot is on planet', function() {
      expect(robot.isOnPlanet()).toEqual(true);
    });
    it('should return false if robot below on planet', function(done) {
      robot.el.style.top = planet_position.bottom+'px';
      setTimeout(function() {
        expect(robot.isOnPlanet()).toEqual(false);
        done();
      }, 1000)
    });
    it('should return false if robot above on planet', function(done) {
      robot.el.style.top = -planet_position.top+'px';
      setTimeout(function() {
        expect(robot.isOnPlanet()).toEqual(false);
        done();
      }, 1000)
    });
    it('should return false if robot is to the left of planet', function(done) {
      robot.el.style.left = planet_position.right+'px';
      setTimeout(function() {
        expect(robot.isOnPlanet()).toEqual(false);
        done();
      }, 1000)
    });
    it('should return false if robot is to the right of planet', function(done) {
      robot.el.style.left = -planet_position.left+'px';
      setTimeout(function() {
        expect(robot.isOnPlanet()).toEqual(false);
        done();
      }, 1000)
    });
  });

  /** Test for robot 'move' event */
  // TODO Determine on to properly spy on isOnPlanet function
//  describe('*move', function() {
//    it('should trigger robot#isOnPlanet', function() {
//      robot.fireEvent(robot.events.moved);
//      expect(robot.isOnPlanet).toHaveBeenCalled();
//    });
//  });

  /** Test for robot 'death' event */
  describe('*death', function() {
    it('should trigger planet#addTombstone', function() {
      robot.fireEvent(robot.events.death);
      expect(planet.addTombstone).toHaveBeenCalled();
    });
  });

  describe('#canMoveForward', function() {
    var new_robot;

    beforeEach(function() {
      robot.el.style.top = '-50px';
      robot.el.style.left = '0px';
      robot.fireEvent(robot.events.death);
      new_robot = planet.createRobot('1 1 N');
    });

    afterEach(function() {
      new_robot = null;
    });

    it('should return true if tombstone is not in front of robot', function() {
      new_robot.takeInstructions('L');
      expect(new_robot.canMoveForward()).toEqual(true);
    });

    it('should return false if tombstone is in front of robot', function() {
      expect(new_robot.canMoveForward()).toEqual(false);
    });
  });

});