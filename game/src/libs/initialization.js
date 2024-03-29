import { 
  BOARD_SIZE, 
  AGENT_LIFE, 
  TARGET_LIFE,
  NB_AGENTS_PER_TEAM,
  NB_OBSTACLES,
  SPAWN_RANGE
} from './constants';
import { computeSight, computeVisibleCells, computeLastPosSeen } from './sight';

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
  const targetsPosition = [[4, 1], [-4, -1]];
  for (let i = 0; i < 2; i++) {
    //const position = pickRandomPosition(positions);
    const position = targetsPosition[i];
    const index = positions.findIndex((pos) => JSON.stringify(pos) === JSON.stringify(position));
    positions.splice(index, 1);
    targets.push({
      kind: 'targets',
      id: ['target_red', 'target_blue'][i],
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
      return Math.abs(position[0] - targets[i].position[0]) + Math.abs(position[1] - targets[i].position[1]) <= SPAWN_RANGE;
    });
    // List of selected positions
    const selectedPositions = [];
    // Pick 5 random positions from the subset
    for (let j = 0; j < NB_AGENTS_PER_TEAM; j++) {
      const position = pickRandomPosition(availablePositions);
      agents.push({
        kind: 'agents',
        id: `${['agent_red', 'agent_blue'][i]}_${j}`,
        initialPosition: position,
        position,
        path: [],
        sight: [],
        team: ['red', 'blue'][i],
        life: AGENT_LIFE,
        shaking: false,
        thinking: false,
        historic: [],
        messages: [],
        lastPosSeen: {},
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
      id: `obstacle_${i}`,
      position,
    });
  }

  // Create the order of the turns
  const order = []
  for (let i = 0; i < NB_AGENTS_PER_TEAM; i++) {
    order.push(`agent_red_${i}`);
    order.push(`agent_blue_${i}`);
  }
  
  // Init visibleCells (usefull for the first turn: in debug mode to see fov)
  const visibleCells = computeVisibleCells(agents.find(a => a.id === order[0]), agents, obstacles, targets);
  
  // Create a random order of agents
  const turn = {
    current: 1,
    actions: 0,
    order: order,
    agentId: order[0],
  };
  
  // Compute sight and lastPosSeen for each agent
  agents.forEach((agent) => {
    agent.sight = computeSight(agent, agents, obstacles, targets); 
    agent.lastPosSeen = computeLastPosSeen(agent, turn);
  });


  return {
    turn,
    targets,
    agents,
    obstacles,
    visibleCells,
    connection: {
      cellFrom: null,
      cellTo: null,
    },
    bullets: [],
    animationQueue: [],
    animationRunning: false,
  }

};

export {
  initGameState,
}
