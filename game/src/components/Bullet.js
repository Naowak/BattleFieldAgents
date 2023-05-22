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

  const rmBullet = (id) => {
    removeBullet(id);
    ref.current = null;
  };

  useFrame(() => {
    // if bullet ref is not valid, return immediately
    if (!ref.current) {
      return;
    }

    const bulletPosition = [ref.current.position.x, ref.current.position.z];

    // if bullet has already reached the target, stop the animation and remove the bullet
    if (bulletPosition[0] === target[0] && bulletPosition[1] === target[1]) {
      rmBullet(id);
      return;
    }
    else {
      // Move the bullet and check for collisions
      bulletMovement(ref, target);
      bulletCollision(ref, id, initialPosition, turn, agents, targets, obstacles, setTurn, rmBullet, handleShake) 
    }

  });

  return (
    <mesh ref={ref} position={[initialPosition[0], BULLET_TRANSLATE_Y, initialPosition[1]]}>
      <sphereBufferGeometry attach='geometry' args={[BULLET_RADIUS, 32, 32]} />
      <meshStandardMaterial attach='material' color='#707070' />
    </mesh>
  );
};

