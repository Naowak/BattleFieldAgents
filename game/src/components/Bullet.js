import React, { useRef, useContext } from 'react';
import { GameContext } from '../contexts/GameContext';
import { useFrame } from '@react-three/fiber';
import { BULLET_TRANSLATE_Y, BULLET_RADIUS } from '../libs/constants';
import { bulletMovement } from '../libs/movements';
import { bulletCollision } from '../libs/collisions';
import { handleShakeItem } from '../libs/animations';

export default function Bullet ({ id, initialPosition, target }) {
  
  // ref 
  const ref = useRef();

  // Context
  const { 
    turn,
    agents, 
    targets,
    obstacles,
    setTurn,
    setAgents,
    setTargets, 
    removeBullet 
  } = useContext(GameContext);

  const handleShake = (itemId, kind) => {
    handleShakeItem(itemId, kind, agents, targets, setAgents, setTargets);
  };

  console.log(id)

  useFrame(() => {
    // Move the bullet towards the target, and check for collisions
    if (ref.current) {
      bulletMovement(ref, target);
      bulletCollision(ref, id, initialPosition, turn, agents, targets, obstacles, setTurn, removeBullet, handleShake) 
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

