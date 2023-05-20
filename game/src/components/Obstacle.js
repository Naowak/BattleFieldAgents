import React, { useRef } from 'react';
import { OBSTACLE_TRANSLATE_Y } from '../libs/constants';

const Obstacle = ({ position }) => {
  const ref = useRef();  

  return (
    <mesh ref={ref} position={[position[0], OBSTACLE_TRANSLATE_Y, position[1]]}>
      <boxBufferGeometry attach='geometry' args={[1, 1, 1]} />
      <meshStandardMaterial attach='material' color='gray' />
    </mesh>
  );
};

export default Obstacle;
