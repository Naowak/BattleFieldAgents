import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { TARGET_TRANSLATE_Y } from '../libs/constants';
import { shake as ShakeTarget } from '../libs/animations';

const Target = ({ position, team, life, shake }) => {
  const ref = useRef();  

  useFrame(() => {
    if (ref.current) {
      if (shake) {
        // re-position before shake, otherwise the target will move away
        ref.current.position.x = position[0];
        ref.current.position.z = position[1];
        ShakeTarget(ref);
      } else {
        // reset the target position
        ref.current.position.x = position[0];
        ref.current.position.z = position[1];
      }
    }
  });

  return (
    <mesh ref={ref} position={[position[0], TARGET_TRANSLATE_Y, position[1]]}>
      <boxBufferGeometry attach='geometry' args={[1, 1, 1]} />
      <meshStandardMaterial attach='material' color={team === 'red' ? 'red' : 'blue'} />
    </mesh>
  );
};

export default Target;
