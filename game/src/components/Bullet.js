import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { BULLET_TRANSLATE_Y, BULLET_RADIUS } from '../libs/constants';
import { bulletMovement } from '../libs/movements';
import { bulletCollision } from '../libs/collisions';

export default function Bullet ({ id, initialPosition, target, removeBullet, gameState, handleShakeItem, killAgent, onAnimationEnd }) {
  
  const ref = useRef();

  useFrame(() => {
    // Move the bullet towards the target, and check for collisions
    if (ref.current) {
      bulletMovement(ref, target, onAnimationEnd);
      bulletCollision(ref, id, initialPosition, gameState, removeBullet, handleShakeItem, killAgent) 
    }
    // Check that the bullet is in target position, if so remove it
    if (ref.current) {
      const bulletPosition = [ref.current.position.x, ref.current.position.z];
      if (bulletPosition[0] === target[0] && bulletPosition[1] === target[1]) {
        removeBullet(id);
      }
    }
  });

  return (
    <mesh ref={ref} position={[initialPosition[0], BULLET_TRANSLATE_Y, initialPosition[1]]}>
      <sphereBufferGeometry attach='geometry' args={[BULLET_RADIUS, 32, 32]} />
      <meshStandardMaterial attach='material' color='#707070' />
    </mesh>
  );
};

