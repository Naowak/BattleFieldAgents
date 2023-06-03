import {
  SIGHT_RANGE,
  BOARD_SIZE,
} from './constants.js';


const isInBox = (position, boxPosition, boxRange) => {
  return position[0] <= boxPosition[0] + boxRange
  && position[0] >= boxPosition[0] - boxRange
  && position[1] <= boxPosition[1] + boxRange
  && position[1] >= boxPosition[1] - boxRange
};

// Check if a ray intersects a cell (position)
const intersection = (start, end, position) => {

  // Compute the direction of the ray
  const STEP_SIZE = 0.1;
  const direction = [end[0] - start[0], end[1] - start[1]];
  const length = Math.sqrt(direction[0] * direction[0] + direction[1] * direction[1]);
  const unitDirection = [direction[0] / length, direction[1] / length];
  const stepDirection = [unitDirection[0] * STEP_SIZE, unitDirection[1] * STEP_SIZE];

  // Check if the ray intersects the object
  let pos = [...start];
  while (!isInBox(pos, position, 0.5) && !isInBox(pos, end, 0.5)) {
    pos[0] += stepDirection[0];
    pos[1] += stepDirection[1];
  }
  if (isInBox(pos, position, 0.5)) {
    return true;
  }
  return false;
};

const computeVisibleCells = (agent, agents, obstacles, targets) => {
  const hidders = [...agents.filter(a => a.id != agent.id), ...obstacles, ...targets];
  const visibleCells = [];
  // For each cell, check if it is hidden by another object, if not, add it to the sight
  for (let i = -BOARD_SIZE; i <= BOARD_SIZE; i++) {
    for (let j = -BOARD_SIZE; j <= BOARD_SIZE; j++) {
      
      // Check if the cell is in sight range
      if ((agent.position[0] - i) * (agent.position[0] - i) + (agent.position[1] - j) * (agent.position[1] - j) > SIGHT_RANGE * SIGHT_RANGE) {
        continue;
      }

      // Check if the cell is hidden by another object
      const intersects = hidders.some(h => intersection(agent.position, [i, j], h.position));
      if (!intersects) {
        visibleCells.push([i, j]);
      }
    }
  }
  return visibleCells;
};

// Compute all the objects visible by an agent
const computeSight = (agent, agents, obstacles, targets) => {
  
  // Define the field of view (manhattan distance)
  const sight = [];
  const validAgents = agents.filter(a => a.id !== agent.id && a.life > 0);
  const visibleObjects = [...validAgents, ...targets, ...obstacles].filter(
    o => Math.abs(agent.position[0] - o.position[0]) + Math.abs(agent.position[1] - o.position[1]) < SIGHT_RANGE
  )

  // For each visible object, check if it is hidden by another object, if not, add it to the sight
  visibleObjects.forEach(object => {
    const hidders = visibleObjects.filter(o => o.id !== object.id);
    const intersects = hidders.some(h => intersection(agent.position, object.position, h.position));
    if (!intersects) {
      sight.push(object);
    }
  });

  return sight;
};

const sightToText = (agent) => {
  let text = '';
  const friends = agent.sight.filter(o => o.kind === 'agents' && o.team === agent.team);
  const ennemies = agent.sight.filter(o => o.kind === 'agents' && o.team !== agent.team);
  const friendTargets = agent.sight.filter(o => o.kind === 'targets' && o.team === agent.team);
  const ennemyTargets = agent.sight.filter(o => o.kind === 'targets' && o.team !== agent.team);
  const obstacles = agent.sight.filter(o => o.kind === 'obstacles');
  text += `Friends: ${friends.map(f => `[${f.position[0]}, ${f.position[1]}]`).join(', ')}\n`;
  text += `Ennemies: ${ennemies.map(e => `[${e.position[0]}, ${e.position[1]}]`).join(', ')}\n`;
  text += `Friend targets: ${friendTargets.map(f => `[${f.position[0]}, ${f.position[1]}]`).join(', ')}\n`;
  text += `Ennemy targets: ${ennemyTargets.map(e => `[${e.position[0]}, ${e.position[1]}]`).join(', ')}\n`;
  text += `Obstacles: ${obstacles.map(o => `[${o.position[0]}, ${o.position[1]}]`).join(', ')}`;
  return text;
};


export {
  computeVisibleCells,
  computeSight,
  sightToText,
}