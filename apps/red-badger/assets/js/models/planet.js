/**
 * @class RobotPlanet.Planet
 * @classdesc This class defines the model for a planet.
 * @constructor
 */
var RobotPlanet;
RobotPlanet = function(config) {

  var RP, isObject;

  isObject = function (value) {
    return !!(value instanceof Object && !(value instanceof Array));
  };

  RP = function (config) {
    var planet = this;
    var configKeys = Object.keys(config);

    /* Add id of planet */
    var planets = document.querySelectorAll('.planet');
    planet.id = planets.length+1;

    /** Array to hold robots */
    planet.robots = [];

    /** Array to hold coordinates of dead robots */
    planet.tombstones = [];

    /** Add config to planet */
    if (configKeys.length && isObject(config)) {
      configKeys.forEach(function(key) {
        planet[key] = config[key];
      });
    }

    /**
     * @desc Add robot to planet
     * @param config
     * @returns {RobotPlanet.Robot}
     */
    planet.createRobot = function(config) {
      var robot = new RobotPlanet.Robot(config || '1 1 S', planet);
      planet.el.appendChild(robot.el);
      planet.robotForm.hidden = true;
      return robot;
    };

    /**
     * @desc Remove planet from DOM
     */
    planet.destroy = function() {
      if (!planet.isDestroyed) {
        var parent = planet.el.parentElement;
        parent.removeChild(planet.el);
        planet.isDestroyed = true;
      }
    };

    /**
     * @desc Get ClientRect of planet element
     * @returns {ClientRect}
     */
    planet.getPosition = function() {
      return planet.el.getBoundingClientRect();
    };

    /**
     * @desc Add tombstone to planet
     * @param {number} top
     * @param {number} left
     */
    planet.addTombstone = function(event) {
      var top = event.target.style.top;
      var left = event.target.style.left;

      /** Construct tombstone element */
      var el = document.createElement('div');
      el.classList.add('tombstone');
      el.style.left = left;
      el.style.top = top;

      /** Remove robot's instructions input field */
      event.target.previousSibling.remove();

      /** Remove robot */
      event.target.remove();

      /** Add tombstone coordinates to planet.tombstones */
      planet.tombstones.push([parseInt(top), parseInt(left)]);

      /** Add tombstone element to planet element */
      planet.el.appendChild(el);

      planet.robotForm.hidden = false;

      return el;
    };

    /* Create Planet HTMLElement */
    if (!config.el || !(config.el instanceof HTMLElement)) {
      var el = document.createElement('div');
      el.classList.add('planet');
      el.dataset.planet = config.name || 'planet';

      /* Add planet-id attribute to planet element */
      el.dataset.planetId=planet.id;

      planet.el = el;

      /* Attach append planet element as child element of body */
      document.querySelector('body').appendChild(el);
    } else {
      planet.el = config.el;
    }

    planet.robotForm = document.querySelector('.robot-form');
    planet.robotConfigInput = document.querySelector('#robot-config');
    planet.robotButton = document.querySelector('#create-robot');

    planet.robotButton.onclick = function(e) {
      var config = planet.robotConfigInput.value;
      planet.robotConfigInput.value = '';
      planet.createRobot(config);
    };

  };

  return new RP(config || {});

};