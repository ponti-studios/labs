// The third segment cannot be attached in any way to the other 2

function Point (x, y) {
  if (this instanceof Point) {
    this.x = x
    this.y = y
  } else {
    return new Point(x, y)
  }
}

function Segment (p1, p2) {
  if (this instanceof Segment) {
    this.p1 = p1
    this.p2 = p2
  } else {
    return new Segment(p1, p2)
  }
}

/*
 * Complete the function below.
 */
function testGraph (input) {
  var points = []

  for (var i = 0; i < input.length; i++) {
    var seg = input[i]
    var point1 = seg.p1.x + ',' + seg.p1.y
    var point2 = seg.p2.x + ',' + seg.p2.y

    if (points.length === 0) {
      // Add points from first segment of graph
      points.push(point1)
      points.push(point2)
    } else {
      // Return false if neither point exists on graph
      if (points.indexOf(point1) === -1 && points.indexOf(point2) === -1) {
        return false
      } else if (points.indexOf(point1) === -1) {
        points.push(point1)
      } else if (points.indexOf(point2) === -1) {
        points.push(point2)
      }
    }
  }

  return true
}

var inputA = [
  Segment(Point(1, 1), Point(2, 2)),
  Segment(Point(1, 1), Point(0, 0)),
  Segment(Point(2, 2), Point(2, 4)),
  Segment(Point(5, 5), Point(2, 4))
]

console.log(testGraph(inputA) === true) // eslint-disable-line

var inputB = [
  Segment(Point(1, 1), Point(2, 2)),
  Segment(Point(2, 2), Point(2, 4)),
  Segment(Point(5, 5), Point(3, 3))
]

console.log(testGraph(inputB) === false) // eslint-disable-line

module.exports = testGraph
