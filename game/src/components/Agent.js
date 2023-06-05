import React, { useRef, useContext, useEffect, useState } from 'react';
import { GameContext } from '../contexts/GameContext';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { agentMovement } from '../libs/movements';
import { shake as shakeAgent } from '../libs/animations';
import { 
  AGENT_RADIUS,
  AGENT_TRANSLATE_Y,
  AGENT_TOP_HEIGHT,
  AGENT_BUBBLE_TRANSLATE_Y,
  COLOR_BLUE, 
  COLOR_RED,
  COLOR_BUBBLE_AGENT,
  COLOR_BUBBLE_BORDER,
  COLOR_FONT,
  DEBUG,
} from '../libs/constants';


const Agent = ({ agent, isCurrent }) => {

  const { team, position, initialPosition, thinking, thoughts, actions, shaking } = agent;
  
  const ref = useRef();  
  const { setAnimationRunning, updateSight } = useContext(GameContext);
  const [showThoughts, setShowThoughts] = useState(false); 
  const closeThoughtsTimeout = useRef(null);
  let upDown = 1;  // Used to animate the agent up and down

  useFrame(() => {

    if (ref.current) {

      // Apply up and down animation to the agent
      if (ref.current.position.y >= AGENT_TOP_HEIGHT) { upDown = -1; }
      if (ref.current.position.y <= AGENT_TRANSLATE_Y) { upDown = 1; }

      if (ref.current.position.x !== position[0] || ref.current.position.z !== position[1]) {
        // Move the agent
        const arrived = agentMovement(ref, position, upDown);
        arrived && setAnimationRunning(false);
        arrived && updateSight()
      }

      // Shake the agent when it gets hit
      if (shaking) {
        shakeAgent(ref);
      }
      
    }
  });

  // Remove agent thought when he starts thinking, and clear the timeout
  useEffect(() => {
    if (thinking) {
      clearTimeout(closeThoughtsTimeout.current);
      setShowThoughts(false);
    }
  }, [thinking]);

  // Show agent thought when he stops thinking
  useEffect(() => {
    if (thoughts.length > 0) {
      setShowThoughts(true);
      closeThoughtsTimeout.current = setTimeout(() => {
        setShowThoughts(false);
      }, 7000);
    }
  }, [thoughts]);

  const styles = {
    thinking: {
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      width: 110,
      height: 25,
      fontSize: 16,
      borderRadius: 15,
      border: `1px solid ${COLOR_BUBBLE_BORDER}`,
      backgroundColor: COLOR_BUBBLE_AGENT,
      color: COLOR_FONT,
    },
    waiting: {
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      width: 25,
      height: 25,
      fontSize: 16,
      borderRadius: 15,
      border: `1px solid ${COLOR_BUBBLE_BORDER}`,
      backgroundColor: COLOR_BUBBLE_AGENT,
      color: COLOR_FONT,
    },
    showThoughts: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 10,
      textAlign: 'center',
      width: 250,
      padding: 5,
      marginBottom: '50%',
      fontSize: 16,
      fontStyle: 'italic',
      borderRadius: 15,
      border: `1px solid ${COLOR_BUBBLE_BORDER}`,
      backgroundColor: COLOR_BUBBLE_AGENT,
      color: COLOR_FONT,
    },
  }

  return (
    <mesh ref={ref} position={[initialPosition[0], AGENT_TRANSLATE_Y, initialPosition[1]]}>
      <capsuleBufferGeometry attach='geometry' args={[AGENT_RADIUS, AGENT_RADIUS, 32, 32]} />
      <meshStandardMaterial attach='material' color={team === 'red' ? COLOR_RED : COLOR_BLUE} />

      {/* Thoughts */}
      {showThoughts && !thinking && (
        <Html position={[0, AGENT_BUBBLE_TRANSLATE_Y, 0]} center>
          <div style={styles.showThoughts}>
            <p style={{margin: 0, padding: 0}}>{thoughts[thoughts.length - 1]}</p>
            <p style={{margin: 0, padding: 0}}>{actions[actions.length - 1]}</p>
          </div>
        </Html>
      )}
      {/* Alert current player */}
      {isCurrent && !thinking && !showThoughts && (
        <Html position={[0, AGENT_BUBBLE_TRANSLATE_Y, 0]} center>
          <div style={styles.waiting}>
            <p style={{margin: 0, padding: 0, fontWeight: 'bold'}}>!</p>
          </div>
        </Html>
      )}
      {/* Thinking */}
      {isCurrent && thinking && !showThoughts && (
        <Html position={[0, AGENT_BUBBLE_TRANSLATE_Y, 0]} center>
          <div style={styles.thinking}>
            <div className="spinner"/>
            <p style={{margin: 0, padding: 0, marginLeft: 5}}>Thinking...</p>
          </div>
        </Html>
      )}
      {/* DEBUG Coords */}
      {DEBUG &&
        <Html position={[0, 0, 0]} center>
          <div>
            <p style={{margin: 0, padding: 0, fontWeight: 'bold'}}>{position[0]},{position[1]}</p>
          </div>
        </Html>
      }
    </mesh>
  );
};

export default Agent;
