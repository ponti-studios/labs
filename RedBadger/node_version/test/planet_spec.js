describe('Planet', function() {
  "use strict";

  var planet;
  var sinon = require('sinon');
  var EventEmitter = require('events').EventEmitter;
  var Planet = require('../planet');

  beforeEach(function() {
    planet = new Planet(['5','3']);
  });

  afterEach(function() {
    planet = null;
  });

  describe('&bounds', function() {
    it('should have bounds as array of config provided', function() {
      planet.bounds.join(',').should.equal([5,3].join(','));
    });
  });

  describe('&robots', function() {
    it('should be instantiated with a empty Array', function() {
      planet.robots.should.be.an.instanceOf(Array);
    });
  });

  describe('&coords', function() {
    it('should be instantiated with an array of all its coords', function() {
      planet.coords.should.be.an.instanceOf(Array);
      for (var i = 0; i < planet.coords.length; i++) {
        planet.coords[i].should.be.an.instanceOf(Array);
      }
      planet.coords.length.should.equal(24);
    });
  });

  describe('#createRobot', function() {
    it('should create new robot', function() {
      var robot = planet.createRobot('1 1 N', 'LRRFLLR');
      robot.coords.join(',').should.equal([1,1].join(','));
      robot.orientation.should.equal('N');
      robot.instructions.should.equal('LRRFLLR');
    });
  });

  describe('#addTombstone', function() {
    it('should add robot coords to &tombstones array', function() {
      var robot = planet.createRobot('1 1 N', 'LRRFLLR');
      planet.addTombstone(robot);
      planet.tombstones.length.should.equal(1);
      planet.tombstones[0].should.be.an.instanceOf(Array);
      planet.tombstones[0].join(',').should.equal(robot.coords.join(','));
    });
  });


});