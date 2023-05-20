import React, { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Vector3 } from 'three';

export default function Bullet ({ id, position, target, removeBullet, gameState }) {
  const speed = 0.1;
  const ref = useRef();
  const { scene } = useThree();

  const handleCollision = (bulletPosition) => {
    // Check for collision with agents
    for (let agent of gameState.agents) {
      const agentPosition = new Vector3(...agent.position);
      if (agentPosition.distanceTo(bulletPosition) < speed) {
        agent.life -= 25;  // Decrease life by 25
        agent.shake = true;
        setTimeout(() => agent.shake = false, 500);  // Stop shaking after 0.5 seconds
        return true;
      }
    }

    // Check for collision with targets
    for (let target of gameState.targets) {
      const targetPosition = new Vector3(...target.position);
      if (targetPosition.distanceTo(bulletPosition) < speed) {
        target.shake = true;
        setTimeout(() => target.shake = false, 500);  // Stop shaking after 0.5 seconds
        return true;
      }
    }

    return false;
  };

  useFrame(() => {
    if (ref.current) {
      const direction = new Vector3(...target).sub(ref.current.position).normalize();

      const nextPosition = ref.current.position.clone().add(direction.multiplyScalar(speed));

      if (nextPosition.distanceTo(new Vector3(...target)) < speed) {
        ref.current.position.set(...target);
        if (handleCollision(ref.current.position)) {
          // If there was a collision, remove the bullet
          removeBullet(id);
        }
      } else {
        ref.current.position.copy(nextPosition);
      }
    }
  });

  return (
    <mesh ref={ref} position={position}>
      <sphereBufferGeometry attach='geometry' args={[1, 16, 16]} />
      <meshStandardMaterial attach='material' color='yellow' />
    </mesh>
  );
};


