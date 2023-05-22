import React, { useRef, useContext } from 'react';
import { GameContext } from '../contexts/GameContext';
import { useFrame } from '@react-three/fiber';
import { BULLET_TRANSLATE_Y, BULLET_RADIUS, BULLET_DAMAGE } from '../libs/constants';
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
    removeBullet,
    setAnimationRunning,
  } = useContext(GameContext);


  const handleCollision = (collision) => {

    if (collision.kind === 'agents') {
      // Decrease life of the agent
      setAgents(prev => ({
        ...prev,
        agents: [...prev].map((agent) => {
          if (agent.id === collision.agent.id) {
            agent.life -= BULLET_DAMAGE;  // Decrease life by 25
          }
          return agent;
        })
      }));
      // Make him shake
      handleShakeItem(collision.agent.id, 'agents', agents, targets, setAgents, setTargets);
      // Remove agent if dead
      if (collision.agent.life <= 0) {
        setTurn(prev => ({  
          ...prev,
          order: [...prev.order].filter((id) => id !== collision.agent.id),
        }));
      }
    }

    else if (collision.kind === 'targets') {
      // Decrease life of the target
      setTargets(prev => ({
        ...prev,
        targets: [...prev].map((target) => {
          if (target.id === collision.target.id) {
            target.life -= BULLET_DAMAGE;  // Decrease life by 25
          }
          return target;
        })
      }));
      // Make him shake
      handleShakeItem(collision.target.id, 'targets', agents, targets, setAgents, setTargets);
    }

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
      const collision = bulletCollision(ref, initialPosition, turn, agents, targets, obstacles) 
      
      // If collision, handle it
      if (collision) {
        handleCollision(collision);
        rmBullet(id);
        return;
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

