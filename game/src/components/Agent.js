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
  AGENT_LIFE,
  COLOR_BLUE, 
  COLOR_BLUE_LIGHT,
  COLOR_RED,
  COLOR_RED_LIGHT,
  COLOR_BUBBLE_AGENT,
  COLOR_BUBBLE_BORDER,
  COLOR_FONT,
  THOUGHT_BUBBLE_DURATION
} from '../libs/constants';


const Agent = ({ agent, isCurrent }) => {

  const { team, position, initialPosition, path, thinking, historic, shaking } = agent;
  
  const ref = useRef();  
  const { hover, setAnimationRunning, updateSight, setAgents, setHover, debug } = useContext(GameContext);
  const [currentThoughts, setCurrentThoughts] = useState(''); 
  const [currentAction, setCurrentAction] = useState('');
  const closeThoughtsTimeout = useRef(null);
  let upDown = 1;  // Used to animate the agent up and down

  useEffect(() => {
    if (ref.current) {
      ref.current.position.y = AGENT_TRANSLATE_Y;
    }
  }, [ref]);

  // Update agent position

  useFrame(() => {
    if (ref.current) {

      // Apply up and down animation to the agent
      if (ref.current.position.y >= AGENT_TOP_HEIGHT) { upDown = -1; }
      if (ref.current.position.y <= AGENT_TRANSLATE_Y) { upDown = 1; }

      // Move the agent to position
      if (ref.current.position.x !== position[0] || ref.current.position.z !== position[1]) {
        const arrived = agentMovement(ref, position, upDown);
        arrived && setAnimationRunning(false);
        arrived && updateSight()
      }
      else {
        ref.current.position.y = AGENT_TRANSLATE_Y; // attempt to debug the agent staying up
      }

      // Update position to follow the path
      if ( path && path.length > 0 
        && position[0] === ref.current.position.x 
        && position[1] === ref.current.position.z 
      ) {
        setAgents(prev => {
          const newAgents = prev.map((a) => {
            if (a.id === agent.id) {
              return {
                ...a,
                position: path[0],
                path: path.slice(1),  // Remove the first cell from the path
              }
            }
            return a;
          });
          return newAgents;
        });
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
      setCurrentThoughts('');
      setCurrentAction('');
    }
  }, [thinking]);

  // Show agent thought when he stops thinking
  useEffect(() => {
    if (historic.length > 0) {
      setCurrentThoughts(`${historic[historic.length - 1].thoughts}`);
      setCurrentAction(`${historic[historic.length - 1].action}`);
      closeThoughtsTimeout.current = setTimeout(() => {
        setCurrentThoughts('');
      }, THOUGHT_BUBBLE_DURATION);
    }
  }, [historic]);

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
    hover: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      width: 120,
      height: 45,
      fontSize: 16,
      gap: 3,
      borderRadius: 15,
      border: `1px solid ${COLOR_BUBBLE_BORDER}`,
      backgroundColor: COLOR_BUBBLE_AGENT,
      color: COLOR_FONT,
    },
    currentThoughts: {
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
    <mesh 
      ref={ref} 
      position={[initialPosition[0], AGENT_TRANSLATE_Y, initialPosition[1]]}
      onPointerOver={() => setHover(agent)}
      onPointerOut={() => setHover(null)}
    >
      <capsuleBufferGeometry attach='geometry' args={[AGENT_RADIUS, AGENT_RADIUS, 32, 32]} />
      <meshStandardMaterial attach='material' color={
        hover?.id === agent.id ?
        (team === 'red' ? COLOR_RED_LIGHT : COLOR_BLUE_LIGHT) :
        (team === 'red' ? COLOR_RED : COLOR_BLUE)
      } />

      {/* Thoughts */}
      {currentThoughts && !thinking && (
        <Html position={[0, AGENT_BUBBLE_TRANSLATE_Y, 0]} center>
          <div style={styles.currentThoughts}>
            <p style={{margin: 0, padding: 0}}>{currentThoughts}</p>
            <p style={{margin: 0, padding: 0}}>{currentAction}</p>
          </div>
        </Html>
      )}
      {/* Alert current player */}
      {isCurrent && !thinking && !currentThoughts && !hover && (
        <Html position={[0, AGENT_BUBBLE_TRANSLATE_Y, 0]} center>
          <div style={styles.waiting}>
            <p style={{margin: 0, padding: 0, fontWeight: 'bold'}}>!</p>
          </div>
        </Html>
      )}
      {/* Thinking */}
      {isCurrent && thinking && !currentThoughts && (
        <Html position={[0, AGENT_BUBBLE_TRANSLATE_Y, 0]} center>
          <div style={styles.thinking}>
            <div className="spinner"/>
            <p style={{margin: 0, padding: 0, marginLeft: 5}}>Thinking...</p>
          </div>
        </Html>
      )}
      {/* Hover */}
      {hover?.id === agent.id && (
        <Html position={[0, AGENT_BUBBLE_TRANSLATE_Y, 0]} center>
          <div style={styles.hover}>
            <p style={{margin: 0, padding: 0, marginLeft: 5}}>{agent.id}</p>
            <p style={{margin: 0, padding: 0, marginLeft: 5}}>{agent.life} / {AGENT_LIFE}</p>
          </div>
        </Html>
      )}
      {/* DEBUG Coords */}
      {debug &&
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