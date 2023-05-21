import React, { useRef } from 'react';
import * as THREE from 'three';
import { OBSTACLE_TRANSLATE_Y } from '../libs/constants';

const Obstacle = ({ position }) => {
  const ref = useRef();  

  return (
    <mesh ref={ref} position={[position[0], OBSTACLE_TRANSLATE_Y, position[1]]}>
      <boxBufferGeometry attach='geometry' args={[1, 1, 1]} />
      <meshStandardMaterial attach='material' color='grey' />
      <lineSegments>
        <edgesGeometry attach="geometry" args={[new THREE.BoxGeometry(1, 1, 1)]} />
        <lineBasicMaterial attach="material" color="#707070" linewidth={2} />
      </lineSegments>
    </mesh>
  );
};

export default Obstacle;
