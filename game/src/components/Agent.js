import React, { useRef, useContext, useEffect, useState, Suspense, useMemo } from 'react';
import { GameContext } from '../contexts/GameContext';
import { useFrame, useGraph } from '@react-three/fiber';
import { Html, useGLTF, useAnimations } from '@react-three/drei';
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
  THOUGHT_BUBBLE_DURATION
} from '../libs/constants';
import { SkeletonUtils } from "three-stdlib"

const Agent = ({ agent, isCurrent }) => {

  const { team, position, initialPosition, thinking, historic, shaking } = agent;
  
  const ref = useRef();  
  const { setAnimationRunning, updateSight } = useContext(GameContext);
  const [currentThoughts, setCurrentThoughts] = useState(''); 
  const [currentAction, setCurrentAction] = useState('');
  const closeThoughtsTimeout = useRef(null);
  let upDown = 1;  // Used to animate the agent up and down

  // Load the agent model, copy it, change its color 
  const { scene, materials, animations } = useGLTF('/agent.glb')
  const clone = useMemo(() => SkeletonUtils.clone(scene), [scene])
  const clonedMaterials = useMemo(() => {
    const newMat = {
      main: materials['Beta_HighLimbsGeoSG3.001'].clone(true),
      joints: materials['Beta_Joints_MAT1.001'].clone(true),
    }
    newMat.main.color.set(team === "red" ? COLOR_RED : COLOR_BLUE)
    newMat.joints.color.set(team === "red" ? COLOR_RED : COLOR_BLUE)
    return newMat
  }, [materials])

  const { nodes } = useGraph(clone)
  const { actions } = useAnimations(animations, ref)

  useEffect(() => {
    console.log(actions)
    actions.die.play()
  }, [])

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
    <Suspense fallback={null}>
      <group ref={ref} scale={0.75} position={[initialPosition[0], AGENT_TRANSLATE_Y, initialPosition[1]]} dispose={null}>
        <group name="Scene">
          <group name="Armature" rotation={[Math.PI / 2, 0, 0]} scale={0.01}>
            <primitive object={nodes.mixamorigHips} />
            <skinnedMesh name="Beta_Joints" geometry={nodes.Beta_Joints.geometry} material={clonedMaterials?.main} skeleton={nodes.Beta_Joints.skeleton} />
            <skinnedMesh name="Beta_Surface" geometry={nodes.Beta_Surface.geometry} material={clonedMaterials?.joints} skeleton={nodes.Beta_Surface.skeleton} />
          </group>
        </group>

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
        {isCurrent && !thinking && !currentThoughts && (
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
        {/* DEBUG Coords */}
        {DEBUG &&
          <Html position={[0, 0, 0]} center>
            <div>
              <p style={{margin: 0, padding: 0, fontWeight: 'bold'}}>{position[0]},{position[1]}</p>
            </div>
          </Html>
        }
      </group>
    </Suspense>
  );
};

export default Agent;
