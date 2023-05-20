import React, { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Vector3 } from 'three';
import { BULLET_TRANSLATE_Y, BULLET_RADIUS } from '../libs/constants';
import { bulletMovement } from '../libs/movements';

export default function Bullet ({ id, initialPosition, target, removeBullet, gameState }) {
  
  const ref = useRef();

  // Check for collision with agents and targets
  // const handleCollision = (bulletPosition) => {
  //   // Check for collision with agents
  //   for (let agent of gameState.agents) {
  //     const agentPosition = new Vector3(...agent.position);
  //     if (agentPosition.distanceTo(bulletPosition) < speed) {
  //       agent.life -= 25;  // Decrease life by 25
  //       agent.shake = true;
  //       setTimeout(() => agent.shake = false, 500);  // Stop shaking after 0.5 seconds
  //       return true;
  //     }
  //   }

  //   // Check for collision with targets
  //   for (let target of gameState.targets) {
  //     const targetPosition = new Vector3(...target.position);
  //     if (targetPosition.distanceTo(bulletPosition) < speed) {
  //       target.shake = true;
  //       setTimeout(() => target.shake = false, 500);  // Stop shaking after 0.5 seconds
  //       return true;
  //     }
  //   }

  //   return false;
  // };


  // Move the bullet towards the target
  useFrame(() => {
    if (ref.current) {
      
      bulletMovement(ref, target);
      
      
      // const target3D = new Vector3(target[0], BULLET_TRANSLATE_Y, target[1]);
      // const direction = target3D.sub(ref.current.position).normalize();

      // const nextPosition = ref.current.position.clone().add(direction.multiplyScalar(speed));

      // if (nextPosition.distanceTo(target3D) < speed) {
      //   ref.current.position.set(target3D.x, target3D.y, target3D.z);
      //   if (handleCollision(ref.current.position)) {
      //     // If there was a collision, remove the bullet
      //     removeBullet(id);
      //   }
      // } else {
      //   ref.current.position.copy(nextPosition);
      // }
    }
  });

  return (
    <mesh ref={ref} position={[initialPosition[0], BULLET_TRANSLATE_Y, initialPosition[1]]}>
      <sphereBufferGeometry attach='geometry' args={[BULLET_RADIUS, 32, 32]} />
      <meshStandardMaterial attach='material' color='#707070' />
    </mesh>
  );
};


