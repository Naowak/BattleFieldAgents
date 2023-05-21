import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { AGENT_RADIUS, AGENT_TRANSLATE_Y, AGENT_TOP_HEIGHT, AGENT_BUBBLE_TRANSLATE_Y } from '../libs/constants';
import { agentMovement } from '../libs/movements';
import { shake as ShakeAgent } from '../libs/animations';
import { 
  COLOR_BLUE, 
  COLOR_RED,
  COLOR_BG_ITEM,
  COLOR_FONT,
} from '../libs/constants';


const Agent = ({ initialPosition, team, life, position, shake, isCurrent }) => {
  
  const ref = useRef();  
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

  const bubbleStyles = {
    display: 'flex', 
    flexDirection: 'row', 
    alignItems: 'center',
    justifyContent: 'center',
    width: 80,
    height: 25,
    fontSize: 16, 
    borderRadius: 15,
    border: '1px solid darkgrey',
    borderColor: COLOR_FONT,
    backgroundColor: COLOR_BG_ITEM,
    color: COLOR_FONT, 
  }

  return (
    <mesh ref={ref} position={[initialPosition[0], AGENT_TRANSLATE_Y, initialPosition[1]]}>
      <sphereBufferGeometry attach='geometry' args={[AGENT_RADIUS, 32, 32]} />
      <meshStandardMaterial attach='material' color={team === 'red' ? COLOR_RED : COLOR_BLUE} />

      {isCurrent && (
        <Html position={[0, AGENT_BUBBLE_TRANSLATE_Y, 0]} center>
          <div style={bubbleStyles}>
            <p>Life: {life}</p>
          </div>
        </Html>
      )}
      
    </mesh>
  );
};

export default Agent;
