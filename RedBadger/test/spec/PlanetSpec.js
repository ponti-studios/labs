/**
 * Tests for RobotPlanet.Planet
 */
describe('RobotPlanet.Planet', function() {

  var planet;

  beforeEach(function() {
    planet = new RobotPlanet({ name: 'FooPlanet'});
  });

  afterEach(function() {
    planet.destroy();
  });

  describe('init', function() {
    it('should have a name when initialized', function() {
      expect(planet.name).toEqual('FooPlanet');
    });
    it('should have an id', function() {
      expect(planet.id).toEqual(1);
    });
    it('should have an HTMLElement assigned to its el', function() {
      expect(planet.el instanceof HTMLElement).toEqual(true);
    });
    it('should be added to the DOM', function() {
      var body = document.querySelector('body');
      var last_child = body.children[body.children.length-1];
      expect(document.querySelectorAll('.planet').length).toEqual(1);
      expect(last_child.dataset.planetId).toEqual('1');
    });
  });

  describe('#destory', function() {
    it('should remove the planet from the DOM', function() {
      planet.destroy();
      var selector = '[data-planet-id="'+planet.id+'"]';
      var domPlanet = document.querySelector(selector);
      expect(domPlanet).toEqual(null);
    });
  });

  describe('#getPosition', function() {
    it('should return the ClientRect of the planet.el', function() {
      expect(planet.getPosition() instanceof ClientRect).toEqual(true);
    })
  });

  describe('#createRobot', function() {

    var robot;

    beforeEach(function() {
      robot = planet.createRobot('1 1 N');
    });

    afterEach(function() {
      robot = null;
    });

    it('should create new robot', function() {
      expect(robot instanceof RobotPlanet.Robot).toEqual(true);
    });

    it('should add robot to planet.robots', function() {
      expect(planet.robots.length).toEqual(1);
    });

  });

  describe('#addTombstone', function() {
    it('should add tombstone to planet element', function() {
      var robot = planet.createRobot('1 1 N');
      robot.el.style.top = '-50px';
      robot.el.style.left = '0px';
      robot.fireEvent(robot.events.death);
      expect(planet.tombstones.length).toEqual(1);
      expect(planet.tombstones[0]).toEqual([-50,0]);
    });
  });

});