import React, { useRef } from 'react';
import { useSphere } from '@react-three/cannon';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const Agent = ({ initialPosition, team, life, position }) => {
  const ref = useRef();  // Use useRef instead of useSphere
  const speed = 0.1;  // Adjust this value for different movement speeds
  const precision = 3;  // Number of decimal places for position coordinates

  useFrame(() => {
    if (ref.current) {

      // Calculate direction vector
      const direction = new THREE.Vector3(
        position[0] - ref.current.position.x,
        position[1] - ref.current.position.y,
        position[2] - ref.current.position.z
      ).normalize();

      // Calculate next position
      const nextPosition = new THREE.Vector3(
        ref.current.position.x + direction.x * speed,
        ref.current.position.y + direction.y * speed,
        ref.current.position.z + direction.z * speed
      );

      // If nextPosition is close enough to the target position, just set it directly to the target position
      if (nextPosition.distanceTo(new THREE.Vector3(...position)) < speed) {
        ref.current.position.set(...position);
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
    <mesh ref={ref} position={initialPosition}>
      <sphereBufferGeometry attach='geometry' args={[0.5, 32, 32]} />
      <meshStandardMaterial attach='material' color={team === 'red' ? 'red' : 'blue'} />
    </mesh>
  );
};

export default Agent;
