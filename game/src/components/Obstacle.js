import React, { useRef } from 'react';
import * as THREE from 'three';
import { OBSTACLE_TRANSLATE_Y, COLOR_OBSTACLE, COLOR_OBSTACLE_BORDER, OBSTACLE_SIZE } from '../libs/constants';

const Obstacle = ({ position }) => {
  const ref = useRef();  

  return (
    <mesh ref={ref} position={[position[0], OBSTACLE_TRANSLATE_Y, position[1]]}>
      <boxBufferGeometry attach='geometry' args={[OBSTACLE_SIZE, 1, OBSTACLE_SIZE]} />
      <meshStandardMaterial attach='material' color={COLOR_OBSTACLE} />
      <lineSegments>
        <edgesGeometry attach="geometry" args={[new THREE.BoxGeometry(OBSTACLE_SIZE, 1, OBSTACLE_SIZE)]} />
        <lineBasicMaterial attach="material" color={COLOR_OBSTACLE_BORDER} linewidth={2} />
      </lineSegments>
    </mesh>
  );
};

export default Obstacle;
