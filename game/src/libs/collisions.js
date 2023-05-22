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
    // Check if the agent is close enough to the bullet
    if (agentPosition.distanceTo(bulletPosition) < BULLET_SPEED) {
      return { kind: 'agents', agent}
    }
  }

  // Check for collision with targets
  for (let target of targets) {
    const targetPosition = new THREE.Vector3(target.position[0], 0, target.position[1]);
    if (targetPosition.distanceTo(bulletPosition) < BULLET_SPEED) {
      return { kind: 'targets', target}
    }
  }

  // Check for collision with obstacles
  for (let obstacle of obstacles) {
    const obstaclePosition = new THREE.Vector3(obstacle.position[0], 0, obstacle.position[1]);
    if (obstaclePosition.distanceTo(bulletPosition) < BULLET_SPEED) {
      return { kind: 'obstacles', obstacle}
    }
  }

  return null
};

export { 
  bulletCollision 
};