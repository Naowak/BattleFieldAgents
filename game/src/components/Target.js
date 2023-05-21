import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { TARGET_TRANSLATE_Y } from '../libs/constants';
import { shake as ShakeTarget } from '../libs/animations';
import { COLOR_BLUE, COLOR_RED, TARGET_RADIUS } from '../libs/constants';

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

      // Apply rotation
      ref.current.rotation.x += Math.random() * 0.01;
      ref.current.rotation.y += Math.random() * 0.01;
      ref.current.rotation.z += Math.random() * 0.01;
    }
  });

  return (
    <mesh ref={ref} position={[position[0], TARGET_TRANSLATE_Y, position[1]]}>
      <torusBufferGeometry 
        attach='geometry' 
        args={[0.3, 0.1, 50, 16]}
      />
      <meshStandardMaterial 
        attach='material' 
        color={team === "red" ? COLOR_RED : COLOR_BLUE}
      />
      {/* <lineSegments>
        <edgesGeometry attach="geometry" args={[new THREE.TorusGeometry(0.3, 0.1, 50, 16)]} />
        <lineBasicMaterial attach="material" color={team === "red" ? COLOR_RED : COLOR_BLUE } linewidth={1} />
      </lineSegments> */}
    </mesh>
  );
};

export default Target;
