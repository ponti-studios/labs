var fs = require('fs');
var Robot = require('./robot');
var Planet = require('./planet');

fs.readFile(process.argv[2], function(err, data) {
	var lines = data.toString().split('\n');
  var planet_config = lines[0];
  var lines = lines.splice(1).filter(function(x) { return x != ''});
	var planet = new Planet(planet_config.split(' '));
  var config = -2;
  var instructions = -1;

  for (var i = 0; i < (lines.length/2); i++) {
    config+=2;
    instructions+=2;
    planet.createRobot(lines[config], lines[instructions]);
  }

  planet.robots.forEach(function(robot) {
    robot.takeInstructions(robot.instructions);
    console.log(robot.reportPosition());
  });

});