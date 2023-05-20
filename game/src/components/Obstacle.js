import React, { useRef } from 'react';

const Obstacle = ({ position }) => {
  const ref = useRef();  

  return (
    <mesh ref={ref} position={[position[0], 0, position[1]]}>
      <boxBufferGeometry attach='geometry' args={[1, 1, 1]} />
      <meshStandardMaterial attach='material' color='gray' />
    </mesh>
  );
};

export default Obstacle;
