
class Graph {
  constructor () {
    this.tree = []
  }

  addPoint (point) {
    this.tree[[point.x, point.y]] = this.tree.length
    this.tree.push(point)
  }

  /**
   * @param {Point} a - This will be the root node
   * @param {Point} b - This will be connected to the root node
   */
  union (a, b) {
    this.tree[b] = this.tree[a]
  }

  connected (a, b) {
    return this.tree[b] === this.tree[a]
  }
}

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

const graph = new Graph()

const testData = [
  Segment(Point(1, 1), Point(2, 2)),
  Segment(Point(5, 5), Point(2, 4)),
  Segment(Point(1, 1), Point(0, 0)),
  Segment(Point(2, 2), Point(2, 4))
]

graph.addPoint(new Point(1, 2))
graph.addPoint(new Point(2, 2))
graph.addPoint(new Point(1, 3))

graph.union([1, 2], [3, 1])

console.log(graph.connected([1, 2], [2, 2]))
console.log(graph.connected([1, 2], [3, 1]))
