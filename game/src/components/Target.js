import React, { useRef } from 'react';

const Target = ({ position, team }) => {
  const ref = useRef();  

  return (
    <mesh ref={ref} position={[position[0], 0, position[1]]}>
      <boxBufferGeometry attach='geometry' args={[1, 1, 1]} />
      <meshStandardMaterial attach='material' color={team === 'red' ? 'red' : 'blue'} />
    </mesh>
  );
};

export default Target;
