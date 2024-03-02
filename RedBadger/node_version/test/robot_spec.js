describe('Robot', function() {

  var robot, planet;
  var Planet = require('../planet');
  var Robot = require('../robot');

  beforeEach(function() {
    planet = new Planet(['5', '3']);
    robot = new Robot([3,2], 'N', 'FRRFLLFFRRFLL', planet);
  });

  afterEach(function() {
    robot = null;
    planet = null;
  });

  describe('init', function() {
    it('should have coords', function() {
      robot.coords.join(',').should.equal([3,2].join(','));
    });
    it('shoul have an orientation', function() {
      robot.orientation.should.equal('N');
    });
    it('should have instructions', function() {
      robot.instructions.should.equal('FRRFLLFFRRFLL');
    });
    it('should be assigned to planet', function() {
      robot.planet.bounds.join(',').should.equal(planet.bounds.join(','));
    });
    it('should be alive', function() {
      robot.isAlive.should.equal(true);
    });
  });

  describe('#reportPosition', function() {
    it('should return current position and orientation of robot', function() {
      robot.reportPosition().should.equal('3 2 N');
    });
    it('should say LOST if robot is not alive', function() {
      robot.isAlive = false;
      robot.reportPosition().should.equal('3 2 N LOST');
    });
  });

  describe('#getNextPosition', function() {
    it('should return next grid point in orientation direction', function() {
      robot.getNextPosition().join(',').should.equal([3,3].join(','));
    });
  });

  describe('#isInBounds', function() {
    it('should return true if robot is in bounds', function() {
      robot.isInBounds().should.equal(true);
    });
    it('should return false if robot is out of bounds', function() {
      robot.coords = [5,4];
      robot.isInBounds().should.equal(false);
    });
  });

  describe('#canMoveForward', function() {
    it('should return true robot can move forward', function() {
      robot.canMoveForward().should.equal(true);
    });
    it('should return false robot cannot move forward', function() {
      robot.coords = [3,3];
      planet.tombstones = [[3,4]];
      robot.canMoveForward().should.equal(false);
    });
  });

  describe('#move', function() {
    it('should move robot forward one space in correct direction', function() {
      robot.move();
      robot.coords.join(',').should.equal([3,3].join(','));
    });
  });

  describe('#takeInstructions', function() {
    it('should move robot to the correct position', function() {
      robot.takeInstructions(robot.instructions);
      robot.reportPosition().should.equal('3 3 N LOST');
    });
  });

});