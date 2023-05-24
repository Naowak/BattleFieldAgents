import {
  SIGHT_RANGE,
} from './constants.js';

// Compute all the positions that are in the field of view of an agent
const computeSight = (agent, agents, obstacles, targets) => {
  const sight = [];
  for (let x = -SIGHT_RANGE; x <= SIGHT_RANGE; x++) {
    for (let y = -SIGHT_RANGE; y <= SIGHT_RANGE; y++) {
      
      // Define start and end of the ray
      const start = agent.position;
      const end = [agent.position[0] + x, agent.position[1] + y];

      // Check for intersections with other agents and obstacles
      const intersectsAgent = agents.some(otherAgent => intersects(start, end, otherAgent));
      const intersectsObstacle = obstacles.some(obstacle => intersects(start, end, obstacle));
      const intersectsTarget = targets.some(target => intersects(start, end, target));

      // If the ray does not intersect any agents or obstacles or targets, add the end position of the ray to the field of view
      if (!intersectsAgent && !intersectsObstacle && !intersectsTarget) {
        sight.push(end);
      }
    }
  }

  // Store the updated field of view in the agent's state
  agent.sight = sight;
};

// Check if a ray intersects an object
const intersects = (start, end, object) => {

  // Ignore if the object is at the end or at the start of the ray
  if (isInObject(end, object) || isInObject(start, object)) {
    return false;
  }

  // Compute the direction of the ray
  const STEP_SIZE = 0.1;
  const direction = [end[0] - start[0], end[1] - start[1]];
  const length = Math.sqrt(direction[0] * direction[0] + direction[1] * direction[1]);
  const unitDirection = [direction[0] / length, direction[1] / length];
  const stepDirection = [unitDirection[0] * STEP_SIZE, unitDirection[1] * STEP_SIZE];

  // Check if the ray intersects the object
  let pos = [...start];
  while (!isInObject(pos, object) && pos[0] !== end[0] && pos[1] !== end[1]) {
    pos[0] += stepDirection[0];
    pos[1] += stepDirection[1];
  }
  if (isInObject(pos, object)) {
    return true;
  }
  return false;
};

const isInObject = (position, object) => {
  return position[0] < object.position.x + 0.5 
    && position[0] > object.position.x - 0.5 
    && position[1] < object.position.y + 0.5 
    && position[1] > object.position.y - 0.5
}


export {
  computeSight,
}