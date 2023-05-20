import { BOARD_SIZE, AGENT_LIFE, TARGET_LIFE } from './constants';

// Helper function to generate a unique position for each entity
const generateUniquePosition = (occupiedPositions, boardSize) => {
  let position = [];
  do {
    position = [
      Math.floor(Math.random() * (2*boardSize + 1)) - boardSize, // Random cell in the range [-boardSize, boardSize]
      Math.floor(Math.random() * (2*boardSize + 1)) - boardSize, 
    ];
  } while (
    occupiedPositions.some(
      occupiedPosition =>
        JSON.stringify(occupiedPosition) === JSON.stringify(position)
    )
  );
  return position;
};

const initGameState = () => {
  // Initialize occupiedPositions with the default agent and target positions
  let occupiedPositions = [];

  // Generate positions for 50 obstacles
  const obstacles = [...Array(50)].map((_, index) => {
    const position = generateUniquePosition(occupiedPositions, BOARD_SIZE);
    occupiedPositions.push(position);
    return { id: index + 1, position };
  });

  // Generate positions for 1 target per team
  const targets = ['red', 'blue'].map((team, index) => {
    const position = generateUniquePosition(occupiedPositions, BOARD_SIZE);
    occupiedPositions.push(position);
    return { id: index + 1, team, position, life: TARGET_LIFE, shake: false };
  });

  // Generate positions for 5 agents per team, randomly around the target of its team
  const agents = ['red', 'blue'].flatMap((team, index) => {
    const targetPosition = targets.find(target => target.team === team).position;
    return [...Array(5)].map((_, agentIndex) => {
      const position = [
        targetPosition[0] + (Math.random() > 0.5 ? -1 : 1),
        targetPosition[1] + (Math.random() > 0.5 ? -1 : 1)
      ];
      occupiedPositions.push(position);
      return { id: index*5 + agentIndex + 1, team, life: AGENT_LIFE, initialPosition: position, position, shake: false };
    });
  });

  return { turn: 0, agents, targets, obstacles };
};

export {
  initGameState,
} 