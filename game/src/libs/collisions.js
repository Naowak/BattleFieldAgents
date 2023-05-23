import * as THREE from 'three';
import { BULLET_SPEED } from "./constants";

// Check for collision with agents and targets
const bulletCollision = (ref, initialPosition, turn, agents, targets, obstacles) => {
  
  // Get bullet position
  const bulletPosition = new THREE.Vector3(
    ref.current.position.x,
    0,
    ref.current.position.z
  );

  // Check for collision with agents
  for (let agent of agents) {
    // Check if the agent is dead
    if (!turn.order.includes(agent.id)) {
      continue;
    }
    // Get agent position
    const agentPosition = new THREE.Vector3(agent.position[0], 0, agent.position[1]);
    // Check if the agent is in the initial position : if so, ignore it (same agent that shot the bullet)
    if (agentPosition.distanceTo(new THREE.Vector3(initialPosition[0], 0, initialPosition[1])) < BULLET_SPEED) {
      continue;
    }
    // Check if the bullet is in the square of the agent
    if (agentPosition.x < bulletPosition.x + 0.5 && agentPosition.x > bulletPosition.x - 0.5 && 
      agentPosition.z < bulletPosition.z + 0.5 && agentPosition.z > bulletPosition.z - 0.5) {
      return { kind: 'argent', agent}
    }
  }

  // Check for collision with targets (is in square)
  for (let target of targets) {
    const targetPosition = new THREE.Vector3(target.position[0], 0, target.position[1]);
    if (targetPosition.x < bulletPosition.x + 0.5 && targetPosition.x > bulletPosition.x - 0.5 && 
      targetPosition.z < bulletPosition.z + 0.5 && targetPosition.z > bulletPosition.z - 0.5) {
      return { kind: 'targets', target}
    }
  }

  // Check for collision with obstacles (is in square)
  for (let obstacle of obstacles) {
    const obstaclePosition = new THREE.Vector3(obstacle.position[0], 0, obstacle.position[1]);
    if (obstaclePosition.x < bulletPosition.x + 0.5 && obstaclePosition.x > bulletPosition.x - 0.5 && 
      obstaclePosition.z < bulletPosition.z + 0.5 && obstaclePosition.z > bulletPosition.z - 0.5) {
      return { kind: 'obstacles', obstacle}
    }
  }

  return null
};

export { 
  bulletCollision 
};