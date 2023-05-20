import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { AGENT_RADIUS, AGENT_TRANSLATE_Y, AGENT_TOP_HEIGHT } from '../libs/constants';
import { agentMovement } from '../libs/movements';
import { shake as ShakeAgent } from '../libs/animations';
import { COLOR_BLUE, COLOR_RED } from '../libs/constants';


const Agent = ({ initialPosition, team, life, position, shake }) => {
  
  const ref = useRef();  
  const precision = 3;  // Number of decimal places for position coordinates
  let upDown = 1;  // Used to animate the agent up and down

  useFrame(() => {

    if (ref.current) {

      // Apply up and down animation to the agent
      if (ref.current.position.y >= AGENT_TOP_HEIGHT) { upDown = -1; }
      if (ref.current.position.y <= AGENT_TRANSLATE_Y) { upDown = 1; }

      // Move the agent
      agentMovement(ref, position, upDown);

      // Shake the agent when it gets hit
      if (shake) {
        ShakeAgent(ref);
      }
      
    }
  });

  return (
    <mesh ref={ref} position={[initialPosition[0], AGENT_TRANSLATE_Y, initialPosition[1]]}>
      <sphereBufferGeometry attach='geometry' args={[AGENT_RADIUS, 32, 32]} />
      <meshStandardMaterial attach='material' color={team === 'red' ? COLOR_RED : COLOR_BLUE} />
    </mesh>
  );
};

export default Agent;
