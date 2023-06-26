import React, { useEffect, useContext, useRef } from 'react';
import { Html } from '@react-three/drei';
import { GameContext } from '../contexts/GameContext';
import Board from './Board';
import Agent from './Agent';
import Target from './Target';
import Obstacle from './Obstacle';
import Bullet from './Bullet';
import Connection from './Connection';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import { COLOR_BG_GAME, COLOR_FONT, NB_ACTIONS_PER_TURN } from '../libs/constants';
import { playAI, playKeyboard } from '../libs/play';

const Game = () => {

  // Get context
  const { 
    win,
    turn,
    agents, setAgents,
    targets,
    bullets, setBullets, 
    obstacles,
    connection, setConnection,
    animationQueue, setAnimationQueue,
    animationRunning, setAnimationRunning,
    newGame,
    nextAction,
    nextTurn,
  } = useContext(GameContext);

  // Refs
  const waitingInput = useRef(false);

  // Play with keyboard, each action one by one
  useEffect(() => {
    const func = (event) => playKeyboard(event, waitingInput, turn, win, agents, targets, obstacles, setAgents, setBullets, animationQueue, setAnimationQueue, nextAction, newGame);
    window.addEventListener('keydown', func);
    return () => {
      window.removeEventListener('keydown', func);
    }
  }, [turn, win, agents, targets, obstacles, setAgents, setBullets, animationQueue, setAnimationQueue, nextAction, newGame]);

  // Play with AI, each turn at once
  useEffect(() => {
    const func = (event) => event.key === 'a' && playAI(turn, win, agents, targets, obstacles, setAgents, setBullets, setConnection, animationRunning, animationQueue, setAnimationQueue, nextAction);
    window.addEventListener('keydown', func);
    return () => {
      window.removeEventListener('keydown', func);
    }
  }, [turn, animationRunning, animationQueue, agents, targets, obstacles, setAgents, setBullets, setConnection, setAnimationQueue, setAnimationRunning, nextAction, win]);

  // Game loop logic, handle turns
  useEffect(() => {
    if (turn.actions === NB_ACTIONS_PER_TURN && !animationRunning && animationQueue.length === 0) {
      nextTurn();
    }
  }, [turn, animationRunning, animationQueue, nextTurn]);

  // GGame loop logic, handle animations
  useEffect(() => {
    if (!animationRunning && animationQueue.length > 0) {
      let queue = [...animationQueue];
      const animation = queue.shift();
      const started = animation();
      started && setAnimationRunning(true);
      setAnimationQueue(queue);
    }
  }, [animationQueue, animationRunning, setAnimationQueue, setAnimationRunning]);
  
  

  return (
    <Canvas 
      camera={{ position: [0, 10, 9] }} 
      style={{ background: COLOR_BG_GAME, flex: 3}}
    >
      <OrbitControls target={[0, 0, 0]} />
      <Stars />
      <ambientLight intensity={1.2} />
      <spotLight position={[0, 10, 0]} angle={1} />
      <Board />
      {/*  Custom components  */}
      <Connection 
        cellFrom={connection.cellFrom} 
        cellTo={connection.cellTo}
      />
      {agents.map(agent => (
        agent.life > 0 && (
          <Agent 
            key={agent.id}
            agent={agent}
            isCurrent={agent.id === turn.agentId}
          />
        )
      ))}
      {targets.map(target => (
        target.life > 0 && (
          <Target 
            key={target.id}
            target={target}
          />
        )
      ))}
      {obstacles.map(obstacle => <Obstacle key={obstacle.id} position={obstacle.position} />)}
      {bullets.map((bullet) => (
        <Bullet 
          key={bullet.id}
          bullet={bullet}
        />
        ))}
      {win ?
        <Html position={[0, 0, 0]} center>
          <div style={overPanelStyle}>
            <p style={{margin: 0, padding: 0, fontWeight: 'bold', fontSize: 25}}>{win === 'red' ? 'Red' : 'Blue'} team won !</p>
            <p style={{margin: 0, padding: 0, fontSize: 18}}>Press Enter to launch a new game !</p>
          </div>
        </Html>
        : null
      }
    </Canvas>
  );
};

const overPanelStyle = {
  height: 200,
  width: 400,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  gap: 12,
  color: COLOR_FONT,
  borderRadius: 15,
  backgroundColor: 'rgba(0, 0, 0, 0.6)',
}

export default Game;
