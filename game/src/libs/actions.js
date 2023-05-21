import { BOARD_SIZE } from './constants';

// Update the gameState after each action
const updateTurn = (gameState, setGameState) => {
  let newGameState = { ...gameState };
  newGameState.turn.actions += 1;

  if (newGameState.turn.actions % 4 === 0) { // if 4 actions completed, next turn (agent)
    newGameState.turn.actions = 0;
    newGameState.turn.current = newGameState.turn.current + 1;
    newGameState.turn.agentId = gameState.turn.order[gameState.turn.current % gameState.turn.order.length]
  }
  
  setGameState(newGameState);
};

const handleMove = (direction, gameState, setGameState) => {


  // Create vector in the direction of the move
  let directionVector = [0, 0];
  if (direction === 'right') { directionVector[0] = 1; } 
  else if (direction === 'left') { directionVector[0] = -1; } 
  else if (direction === 'up') { directionVector[1] = -1; } 
  else if (direction === 'down') { directionVector[1] = 1; }
    
  // Find the agent in the gameState
  const agentId = gameState.turn.agentId;
  const agentIndex = gameState.agents.findIndex((agent) => agent.id === agentId);

  if (agentIndex === -1) {
    return
  }

  // Calculate new position based on direction
  let newPosition = [...gameState.agents[agentIndex].position];
  newPosition[0] += directionVector[0];
  newPosition[1] += directionVector[1];

  // Check if new position is valid (not colliding with obstacles)
  const obstacleCollision = gameState.obstacles.some((obstacle) => {
    return JSON.stringify(obstacle.position) === JSON.stringify(newPosition);
  });

  // Check if new position is valid (not colliding with other agents)
  const agentCollision = gameState.agents.some((agent) => {
    // Check if agent is dead
    if (!gameState.turn.order.includes(agent.id)) {
      return false;
    }
    return JSON.stringify(agent.position) === JSON.stringify(newPosition);
  });

  // Check if new position is valid (not colliding with targets)
  const targetCollision = gameState.targets.some((target) => {
    return JSON.stringify(target.position) === JSON.stringify(newPosition);
  });

  // Check if new position is valid (not out of bounds)
  const outOfBounds = newPosition.some((coord) => {
    return Math.abs(coord) > BOARD_SIZE;
  });

  if (!obstacleCollision && !agentCollision && !targetCollision && !outOfBounds) {

    // Update gameState => launch animation
    let newGameState = { ...gameState };
    newGameState.isAnimation = true;
    newGameState.agents[agentIndex].position = newPosition;
    setGameState(newGameState);

    // Update turn
    updateTurn(gameState, setGameState);
  }
};

const handleAttack = (gameState, setGameState, setBullets) => {

  // Find the agent in the gameState
  const agentId = gameState.turn.agentId;
  const agentIndex = gameState.agents.findIndex((agent) => agent.id === agentId);

  // If the agent is not found, return
  if (agentIndex === -1) {
    return
  }

  // Create a bullet with a random target
  let targetX = Math.floor(Math.random() * (2*BOARD_SIZE + 1)) - BOARD_SIZE; // Random cell in the range [-BOARD_SIZE, BOARD_SIZE]
  let targetY = Math.floor(Math.random() * (2*BOARD_SIZE + 1)) - BOARD_SIZE; 

  // Launch animation
  let newGameState = { ...gameState };
  newGameState.isAnimation = true;
  setGameState(newGameState);

  setBullets(prevBullets => ([
    ...prevBullets, 
    { 
      id: Date.now(),  // Unique id for the bullet
      initialPosition: gameState.agents[agentIndex].position, 
      target: [targetX, targetY] 
    }
  ]));

  updateTurn(gameState, setGameState);
};


export {
  handleMove,
  handleAttack
};