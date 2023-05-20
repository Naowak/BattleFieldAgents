import * as THREE from 'three';
import { BULLET_SPEED, BULLET_DAMAGE } from "./constants";

// Check for collision with agents and targets
const bulletCollision = (ref, id, initialPosition, gameState, removeBullet, handleShakeItem) => {
  
  // Get bullet position
  const bulletPosition = new THREE.Vector3(
    ref.current.position.x,
    0,
    ref.current.position.z
  );

  // Check for collision with agents
  for (let agent of gameState.agents) {
    const agentPosition = new THREE.Vector3(agent.position[0], 0, agent.position[1]);

    // Check if the agent is in the initial position : if so, ignore it (same agent that shot the bullet)
    if (agentPosition.distanceTo(new THREE.Vector3(initialPosition[0], 0, initialPosition[1])) < BULLET_SPEED) {
      continue;
    }
    
    // Check if the agent is close enough to the bullet
    if (agentPosition.distanceTo(bulletPosition) < BULLET_SPEED) {
      agent.life -= BULLET_DAMAGE;  // Decrease life by 25
      handleShakeItem(agent.id, 'agents');  // Shake the agent
      removeBullet(id);
    }
  }

  // Check for collision with targets
  for (let target of gameState.targets) {
    const targetPosition = new THREE.Vector3(target.position[0], 0, target.position[1]);
    if (targetPosition.distanceTo(bulletPosition) < BULLET_SPEED) {
      target.life -= BULLET_DAMAGE;  // Decrease life by 25
      handleShakeItem(target.id, 'targets');  // Shake the target
      removeBullet(id);
    }
  }
};

export { 
  bulletCollision 
};