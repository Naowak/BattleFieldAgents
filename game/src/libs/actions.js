import { BOARD_SIZE } from './constants';
import { aStar } from '../libs/aStar';


const handleMove = (targetCell, turn, agents, targets, obstacles, setAgents) => {
    
  // Find the agent in the gameState
  const agentIndex = agents.findIndex((agent) => agent.id === turn.agentId);
  if (agentIndex === -1) {
    return false;
  }

  // Get the current position of the agent
  const currentPosition = agents[agentIndex].position;

  // Calculate the path to the target cell
  const path = aStar(currentPosition, targetCell, obstacles, agents, targets);

  // Check if a path was found
  if (path.length === 0) {
    return false;
  }

  // Move the agent to the next cell in the path
  setAgents(prev => {
    const newAgents = prev.map((agent, index) => {
      if (index === agentIndex) {
        return {
          ...agent,
          position: path[0],  // Move to the next cell in the path
          path: path.slice(1),  // Store the remaining path
        }
      }
      return agent;
    });
    return newAgents;
  });

  return true;
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
          messages: [...agent.messages, { turn: turn.current, sender: currentAgent.id, position: currentAgent.position, message }],
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