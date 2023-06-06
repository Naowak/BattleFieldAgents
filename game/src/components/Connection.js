import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { 
  CONNECTION_SPHERE_RADIUS,
  NB_SPEHERES_PER_DIST_UNIT 
} from '../libs/constants';

export default function Connection({ cellFrom, cellTo }) {
  
  // ref 
  const ref = useRef();

  // Animate the connection
  useFrame(({ clock }) => {
    if (ref.current) {
      const time = clock.elapsedTime;
      const scale = 1 + Math.sin(time * 5) * 0.1;  // Scale the spheres based on time
      ref.current.scale.set(scale, scale, scale);
    }
  });

  // If there is no cellFrom or cellTo, return null
  if (!cellFrom || !cellTo) return null;

  // Start and end points
  const start = new THREE.Vector3(cellFrom[0], 0, cellFrom[1]);
  const end = new THREE.Vector3(cellTo[0], 0, cellTo[1]);

  // Calculate the distance and direction between the start and end points
  const distance = start.distanceTo(end);
  const direction = end.clone().sub(start).normalize();

  // Calculate the number of spheres to create
  const numSpheres = Math.floor(distance * NB_SPEHERES_PER_DIST_UNIT);

  // Create an array of sphere positions
  const spherePositions = [];
  for (let i = 0; i < numSpheres+1; i++) {
    const position = start.clone().add(direction.clone().multiplyScalar(i * distance / numSpheres));
    spherePositions.push(position);
  }

  return (
    <>
      {spherePositions.map((position, index) => (
        <mesh key={index} ref={ref} position={[position.x, 0, position.z]}>
          <sphereBufferGeometry attach='geometry' args={[CONNECTION_SPHERE_RADIUS, 32, 32]} />
          <meshStandardMaterial attach='material' color='#00ff00' />
        </mesh>
      ))}
    </>
  );
};