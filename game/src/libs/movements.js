import * as THREE from 'three';
import { 
  AGENT_TRANSLATE_Y, 
  AGENT_SPEED, 
  BULLET_TRANSLATE_Y,
  BULLET_SPEED,
  PRECISION,
} from "./constants";


// Move an agent to a 2D position
const agentMovement = (ref, position, upDown) => {

  // Calculate direction vector
  const direction = new THREE.Vector3(
    position[0] - ref.current.position.x,
    0,
    position[1] - ref.current.position.z
  ).normalize();

  // Calculate next position
  const nextPosition = new THREE.Vector3(
    ref.current.position.x + direction.x * AGENT_SPEED,
    ref.current.position.y + 0.05 * upDown,
    ref.current.position.z + direction.z * AGENT_SPEED
  );

  // If nextPosition is close enough to the target position, just set it directly to the target position
  const targetPosition = new THREE.Vector3(position[0], AGENT_TRANSLATE_Y, position[1]);
  if (nextPosition.distanceTo(targetPosition) < AGENT_SPEED) {
    ref.current.position.set(targetPosition.x, targetPosition.y, targetPosition.z);
  } else {
    // Update position with rounded coordinates
    ref.current.position.set(
      +nextPosition.x.toFixed(PRECISION),
      +nextPosition.y.toFixed(PRECISION),
      +nextPosition.z.toFixed(PRECISION)
    );
  }
}

// Move a bullet to a 2D position
const bulletMovement = (ref, position) => {

  // Calculate direction vector
  const direction = new THREE.Vector3(
    position[0] - ref.current.position.x,
    0,
    position[1] - ref.current.position.z
  ).normalize();

  // Calculate next position
  const nextPosition = new THREE.Vector3(
    ref.current.position.x + direction.x * BULLET_SPEED,
    ref.current.position.y,
    ref.current.position.z + direction.z * BULLET_SPEED
  );

  // If nextPosition is close enough to the target position, just set it directly to the target position
  const targetPosition = new THREE.Vector3(position[0], BULLET_TRANSLATE_Y, position[1]);
  if (nextPosition.distanceTo(targetPosition) < BULLET_SPEED) {
    ref.current.position.set(targetPosition.x, targetPosition.y, targetPosition.z);
  } else {
    // Update position with rounded coordinates
    ref.current.position.set(
      +nextPosition.x.toFixed(PRECISION),
      +nextPosition.y.toFixed(PRECISION),
      +nextPosition.z.toFixed(PRECISION)
    );
  }
}


export {
  agentMovement,
  bulletMovement,
}