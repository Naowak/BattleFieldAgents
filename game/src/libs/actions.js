import { BOARD_SIZE } from './constants';
import { computeSight } from './sight';

const handleMove = (direction, turn, agents, targets, obstacles, setAgents) => {

  // Create vector in the direction of the move
  let directionVector = [0, 0];
  if (direction === 'right') { directionVector[0] = 1; } 
  else if (direction === 'left') { directionVector[0] = -1; } 
  else if (direction === 'up') { directionVector[1] = -1; } 
  else if (direction === 'down') { directionVector[1] = 1; }
    
  // Find the agent in the gameState
  const agentIndex = agents.findIndex((agent) => agent.id === turn.agentId);
  if (agentIndex === -1) {
    return false;
  }

  // Calculate new position based on direction
  let newPosition = [...agents[agentIndex].position];
  newPosition[0] += directionVector[0];
  newPosition[1] += directionVector[1];

  // Check if new position is valid (not colliding with obstacles)
  const obstacleCollision = obstacles.some((obstacle) => {
    return JSON.stringify(obstacle.position) === JSON.stringify(newPosition);
  });

  // Check if new position is valid (not colliding with other agents)
  const agentCollision = agents.some((agent) => {
    // Check if agent is dead
    if (!turn.order.includes(agent.id)) {
      return false;
    }
    return JSON.stringify(agent.position) === JSON.stringify(newPosition);
  });

  // Check if new position is valid (not colliding with targets)
  const targetCollision = targets.some((target) => {
    return JSON.stringify(target.position) === JSON.stringify(newPosition);
  });

  // Check if new position is valid (not out of bounds)
  const outOfBounds = newPosition.some((coord) => {
    return Math.abs(coord) > BOARD_SIZE;
  });

  if (!obstacleCollision && !agentCollision && !targetCollision && !outOfBounds) {

    // Update agent
    let newAgents = [...agents];
    newAgents[agentIndex].position = newPosition;
    newAgents[agentIndex].sight = computeSight(newAgents[agentIndex], newAgents, targets, obstacles);
    setAgents(newAgents);
    return true;
  }
  
  return false;
};

const handleAttack = (turn, agents, setBullets) => {

  // Find the agent in the gameState
  const agentIndex = agents.findIndex((agent) => agent.id === turn.agentId);

  // If the agent is not found, return
  if (agentIndex === -1) {
    return false;
  }

  // Create a bullet with a random target
  let targetX = Math.floor(Math.random() * (2*BOARD_SIZE + 1)) - BOARD_SIZE; // Random cell in the range [-BOARD_SIZE, BOARD_SIZE]
  let targetY = Math.floor(Math.random() * (2*BOARD_SIZE + 1)) - BOARD_SIZE; 

  // Launch animation
  setBullets(prev => ([
    ...prev,
    {
      id: `${Date.now()}_${Math.random()}`,  // Unique id for the bullet
      initialPosition: agents[agentIndex].position,
      target: [targetX, targetY]
    }
  ]));

  return true;
};


export {
  handleMove,
  handleAttack
};