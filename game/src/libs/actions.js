import { BOARD_SIZE } from './constants';

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
    setAgents(prev => {
      const newAgents = prev.map((agent, index) => {
        if (index === agentIndex) {
          return {
            ...agent,
            position: newPosition,
          }
        }
        return agent;
      });
      return newAgents;
    });
    
    return true;
  }
  
  return false;
};

const handleAttack = (position, turn, agents, setBullets) => {

  // Find the agent in the gameState
  const agentIndex = agents.findIndex((agent) => agent.id === turn.agentId);

  // If the agent is not found, return
  if (agentIndex === -1) {
    return false;
  }

  let targetX, targetY;

  if (position) {
    // Create a bullet with a target on the position
    targetX = position[0];
    targetY = position[1];
  } else {
    // Create a bullet with a random target
    targetX = Math.floor(Math.random() * (2*BOARD_SIZE + 1)) - BOARD_SIZE; // Random cell in the range [-BOARD_SIZE, BOARD_SIZE]
    targetY = Math.floor(Math.random() * (2*BOARD_SIZE + 1)) - BOARD_SIZE;
  }
    

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

const handleSpeak = (cell, message, turn, agents, setAgents, setConnection) => {

  // Find the agent in the gameState
  const currentAgent = agents.find((agent) => agent.id === turn.agentId);

  // If the agent is not found, return
  if (!currentAgent) {
    return false;
  }

  // Find target agent
  const targetAgent = agents.find((agent) => {
    return JSON.stringify(agent.position) === JSON.stringify(cell);
  });

  // If the target agent is not found, return
  if (!targetAgent) {
    return false;
  }

  // Launch animation
  setConnection({
    cellFrom: currentAgent.position,
    cellTo: targetAgent.position,
  });

  // Update agent : add message to its messages
  setAgents(prev => {
    const newAgents = prev.map((agent) => {
      if (agent.id === targetAgent.id) {
        return {
          ...agent,
          messages: [...agent.messages, { turn: turn.current, sender: agent.id, position: agent.position, message }],
        }
      }
      return agent;
    });
    return newAgents;
  })


};


export {
  handleMove,
  handleAttack,
  handleSpeak,
};