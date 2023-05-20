import React, { useRef } from 'react';
import { useSphere } from '@react-three/cannon';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const RADIUS = 0.3;
const TRANSLATE_Y = -0.2;

const Agent = ({ initialPosition, team, life, position }) => {
  const ref = useRef();  
  const speed = 0.1;  // Adjust this value for different movement speeds
  const precision = 3;  // Number of decimal places for position coordinates
  let upDown = 1;  // Used to animate the agent up and down

  useFrame(() => {

    if (ref.current) {

      // Calculate direction vector
      const direction = new THREE.Vector3(
        position[0] - ref.current.position.x,
        0,
        position[1] - ref.current.position.z
      ).normalize();

      
      // Apply up and down animation to the agent (depends on the speed animation)
      if (ref.current.position.y >= 0.05) { upDown = -1; }
      if (ref.current.position.y <= TRANSLATE_Y) { upDown = 1; }

      // Calculate next position
      const nextPosition = new THREE.Vector3(
        ref.current.position.x + direction.x * speed,
        ref.current.position.y + 0.05 * upDown,
        ref.current.position.z + direction.z * speed
      );

      // If nextPosition is close enough to the target position, just set it directly to the target position
      const targetPosition = new THREE.Vector3(position[0], TRANSLATE_Y, position[1]);
      if (nextPosition.distanceTo(targetPosition) < speed) {
        ref.current.position.set(targetPosition.x, targetPosition.y, targetPosition.z);
      } else {
        // Update position with rounded coordinates
        ref.current.position.set(
          +nextPosition.x.toFixed(precision),
          +nextPosition.y.toFixed(precision),
          +nextPosition.z.toFixed(precision)
        );
      }
    }
  });

  return (
    <mesh ref={ref} position={[initialPosition[0], TRANSLATE_Y, initialPosition[1]]}>
      <sphereBufferGeometry attach='geometry' args={[RADIUS, 32, 32]} />
      <meshStandardMaterial attach='material' color={team === 'red' ? 'red' : 'blue'} />
    </mesh>
  );
};

export default Agent;
