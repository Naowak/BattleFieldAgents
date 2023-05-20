import * as THREE from 'three';
import { BULLET_SPEED } from "./constants";

// Check for collision with agents and targets
const bulletCollision = (ref, id, initialPosition, gameState, removeBullet) => {
  
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
      agent.life -= 25;  // Decrease life by 25
      agent.shake = true;
      setTimeout(() => agent.shake = false, 500);  // Stop shaking after 0.5 seconds
      console.log("agent touched", agent, ref.current.position)
      console.log("bullet touched", ref.current.position)
      removeBullet(id);
    }
  }

  // Check for collision with targets
  for (let target of gameState.targets) {
    const targetPosition = new THREE.Vector3(target.position[0], 0, target.position[1]);
    if (targetPosition.distanceTo(bulletPosition) < BULLET_SPEED) {
      target.shake = true;
      setTimeout(() => target.shake = false, 500);  // Stop shaking after 0.5 seconds
      removeBullet(id);
      console.log("target touched", target)
    }
  }
};

export { 
  bulletCollision 
};