import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { shake as ShakeTarget } from '../libs/animations';
import { 
  COLOR_BUBBLE_BORDER,
  COLOR_BLUE, 
  COLOR_RED, 
  TARGET_RADIUS, 
  TARGET_BUBBLE_TRANSLATE_Y, 
  COLOR_FONT, 
  TARGET_LIFE,
  TARGET_TRANSLATE_Y
} from '../libs/constants';

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
      ref.current.rotation.x += Math.random() * 0.05;
      ref.current.rotation.y += Math.random() * 0.05;
      ref.current.rotation.z += Math.random() * 0.05;
    }
  });

  const bubbleStyles = {
    display: 'flex', 
    flexDirection: 'column', 
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    width: 90,
    height: 25,
    fontSize: 16, 
    borderRadius: 10,
    border: `1px solid ${COLOR_BUBBLE_BORDER}`,
    backgroundColor: team === "red" ? COLOR_RED : COLOR_BLUE,
    color: COLOR_FONT, 
  }

  return (
    <>
      <mesh ref={ref} position={[position[0], TARGET_TRANSLATE_Y, position[1]]}>
        <torusBufferGeometry 
          attach='geometry' 
          args={[TARGET_RADIUS, 0.1, 50, 16]}
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
      <Html position={[position[0], TARGET_BUBBLE_TRANSLATE_Y, position[1]]} center>
        <div style={bubbleStyles}>
          <p style={{margin: 0, padding: 0}}>{life} / {TARGET_LIFE}</p>
        </div>
      </Html>
    </>
  );
};

export default Target;
