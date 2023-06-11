import { BOARD_SIZE } from './constants';

// Manhattan distance heuristic
function heuristic(nodeA, nodeB) {
  return Math.abs(nodeA[0] - nodeB[0]) + Math.abs(nodeA[1] - nodeB[1]);
}

// Get the neighbors of a node
function getNeighbors(node, forbidden_nodes = []) {
  const dirs = [[-1, 0], [1, 0], [0, -1], [0, 1]];
  const neighbors = [];
  for (let dir of dirs) {
    const newNode = [node[0] + dir[0], node[1] + dir[1]];
    const isInGrid = newNode[0] >= -BOARD_SIZE && newNode[0] <= BOARD_SIZE && newNode[1] >= -BOARD_SIZE && newNode[1] <= BOARD_SIZE;
    const isAllowed = !forbidden_nodes.some((n) => n[0] === newNode[0] && n[1] === newNode[1]);
    // Check if the new node is within the grid
    if (isInGrid && isAllowed) {
      neighbors.push(newNode);
    }
  }
  return neighbors;
}

// Reconstruct path from start to goal
function reconstructPath(cameFrom, current) {
  const totalPath = [current];
  while (cameFrom.has(current.toString())) {
    current = cameFrom.get(current.toString());
    totalPath.unshift(current);
  }
  return totalPath;
}

// A* search algorithm
function aStar(start, goal, forbidden_nodes = []) {
  const openSet = new Set([start]);
  const cameFrom = new Map();
  const gScore = new Map();
  gScore.set(start.toString(), 0);
  const fScore = new Map();
  fScore.set(start.toString(), heuristic(start, goal));

  while (openSet.size > 0) {
    let current = null;
    let lowestFScore = Infinity;

    // Find the node in openSet having the lowest fScore[] value
    for (let node of openSet) {
      const fScoreValue = fScore.has(node.toString()) ? fScore.get(node.toString()) : Infinity;
      if (fScoreValue < lowestFScore) {
        lowestFScore = fScoreValue;
        current = node;
      }
    }

    if (current.toString() === goal.toString()) {
      return reconstructPath(cameFrom, current);
    }

    openSet.delete(current);

    for (let neighbor of getNeighbors(current, forbidden_nodes)) {
      const tentativeGScore = gScore.get(current.toString()) + 1; // assuming each move costs 1
      const neighborKey = neighbor.toString();
      if (!gScore.has(neighborKey) || tentativeGScore < gScore.get(neighborKey)) {
        cameFrom.set(neighborKey, current);
        gScore.set(neighborKey, tentativeGScore);
        fScore.set(neighborKey, gScore.get(neighborKey) + heuristic(neighbor, goal));
        if (!openSet.has(neighbor)) {
          openSet.add(neighbor);
        }
      }
    }
  }

  // Fail, return empty array
  return [];
}

export {
  aStar,
};
