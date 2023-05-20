import React, { useRef } from 'react';
import { TARGET_TRANSLATE_Y } from '../libs/constants';

const Target = ({ position, team }) => {
  const ref = useRef();  

  return (
    <mesh ref={ref} position={[position[0], TARGET_TRANSLATE_Y, position[1]]}>
      <boxBufferGeometry attach='geometry' args={[1, 1, 1]} />
      <meshStandardMaterial attach='material' color={team === 'red' ? 'red' : 'blue'} />
    </mesh>
  );
};

export default Target;
