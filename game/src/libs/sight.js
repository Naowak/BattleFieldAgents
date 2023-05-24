import {
  SIGHT_RANGE,
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

// Compute all the objects visible by an agent
const computeSight = (agent, agents, obstacles, targets) => {
  
  // Define the field of view (manhattan distance)
  const sight = [];
  const visibleObjects = [...agents.filter(a => a.id !== agent.id), ...targets, ...obstacles].filter(
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
  computeSight,
  sightToText,
}