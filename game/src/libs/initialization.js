import { 
  BOARD_SIZE, 
  AGENT_LIFE, 
  TARGET_LIFE,
  NB_AGENTS_PER_TEAM,
  NB_OBSTACLES,
  SPAWN_RANGE
} from './constants';
import { computeSight } from './sight';

// Pick a random position on the board and remove it from the list of available positions
const pickRandomPosition = (positions) => {
  const randomIndex = Math.floor(Math.random() * positions.length);
  const position = positions[randomIndex];
  positions.splice(randomIndex, 1);
  return position;
};

const initGameState = () => {
  
  // Create a list of all the available positions on the board
  const positions = [];
  for (let x = -BOARD_SIZE; x <= BOARD_SIZE; x++) {
    for (let y = -BOARD_SIZE; y <= BOARD_SIZE; y++) {
      positions.push([x, y]);
    }
  }

  // Create one target per team
  const targets = [];
  for (let i = 0; i < 2; i++) {
    const position = pickRandomPosition(positions);
    targets.push({
      kind: 'targets',
      id: i,
      position,
      team: ['red', 'blue'][i],
      life: TARGET_LIFE,
      shaking: false,
    });
  }

  // Create 5 agents per team, with random positions around their target
  const agents = [];
  for (let i = 0; i < 2; i++) {
    // Select only a subset of the available positions (range of SPAWN_RANGE cells around the target)
    const availablePositions = positions.filter((position) => {
      return Math.abs(position[0] - targets[i].position[0]) <= SPAWN_RANGE && Math.abs(position[1] - targets[i].position[1]) <= SPAWN_RANGE;
    });
    // List of selected positions
    const selectedPositions = [];
    // Pick 5 random positions from the subset
    for (let j = 0; j < NB_AGENTS_PER_TEAM; j++) {
      const position = pickRandomPosition(availablePositions);
      agents.push({
        kind: 'agents',
        id: `${['red', 'blue'][i]}_${j}`,
        initialPosition: position,
        position,
        sight: [],
        team: ['red', 'blue'][i],
        life: AGENT_LIFE,
        shaking: false,
        thinking: false,
      });
      selectedPositions.push(position);
    }
    // Remove selected positions from the list of positions
    selectedPositions.forEach((position) => {
      const index = positions.findIndex((pos) => JSON.stringify(pos) === JSON.stringify(position));
      positions.splice(index, 1);
    });
  }

  // Create 50 obstacles
  const obstacles = [];
  for (let i = 0; i < NB_OBSTACLES; i++) {
    const position = pickRandomPosition(positions);
    obstacles.push({
      kind: 'obstacles',
      id: i,
      position,
    });
  }

  // Compute sight for each agent
  agents.forEach((agent) => {
    agent.sight = computeSight(agent, agents, obstacles, targets); 
  });

  // Create the order of the turns
  const order = []
  for (let i = 0; i < NB_AGENTS_PER_TEAM; i++) {
    order.push(`red_${i}`);
    order.push(`blue_${i}`);
  }

  return {
    turn: {
      current: 0,
      actions: 0,
      order: order,
      agentId: order[0],
    },
    targets,
    agents,
    obstacles,
    visibleCells: [],
    bullets: [],
    animationQueue: [],
    animationRunning: false,
  }

};

export {
  initGameState,
}
