import React, { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { BULLET_TRANSLATE_Y, BULLET_RADIUS } from '../libs/constants';
import { bulletMovement } from '../libs/movements';
import { bulletCollision } from '../libs/collisions';

export default function Bullet ({ id, initialPosition, target, removeBullet, gameState, handleShake }) {
  
  const ref = useRef();

  // Move the bullet towards the target
  useFrame(() => {
    if (ref.current) {
      bulletMovement(ref, target);
      bulletCollision(ref, id, initialPosition, gameState, removeBullet, handleShake) 
    }
  });

  return (
    <mesh ref={ref} position={[initialPosition[0], BULLET_TRANSLATE_Y, initialPosition[1]]}>
      <sphereBufferGeometry attach='geometry' args={[BULLET_RADIUS, 32, 32]} />
      <meshStandardMaterial attach='material' color='#707070' />
    </mesh>
  );
};

