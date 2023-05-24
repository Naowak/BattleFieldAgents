import React, { useRef } from 'react';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { OBSTACLE_TRANSLATE_Y, COLOR_OBSTACLE, COLOR_OBSTACLE_BORDER, DEBUG } from '../libs/constants';

const Obstacle = ({ position }) => {
  const ref = useRef();  

  return (
    <mesh ref={ref} position={[position[0], OBSTACLE_TRANSLATE_Y, position[1]]}>
      <boxBufferGeometry attach='geometry' args={[1, 1, 1]} />
      <meshStandardMaterial attach='material' color={COLOR_OBSTACLE} />
      <lineSegments>
        <edgesGeometry attach="geometry" args={[new THREE.BoxGeometry(1, 1, 1)]} />
        <lineBasicMaterial attach="material" color={COLOR_OBSTACLE_BORDER} linewidth={2} />
      </lineSegments>
      {DEBUG &&
        <Html position={[0, 1, 0]} center>
        <div>
          <p style={{margin: 0, padding: 0, fontWeight: 'bold'}}>{position[0]},{position[1]}</p>
        </div>
      </Html>
      }
    </mesh>
  );
};

export default Obstacle;
