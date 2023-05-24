import React, { useEffect, useContext, useRef } from 'react';
import { Html } from '@react-three/drei';
import { GameContext } from '../contexts/GameContext';
import Board from './Board';
import Agent from './Agent';
import Target from './Target';
import Obstacle from './Obstacle';
import Bullet from './Bullet';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import { COLOR_BG_GAME, COLOR_FONT, NB_ACTIONS_PER_TURN } from '../libs/constants';
import { handleMove, handleAttack } from '../libs/actions';

const Game = () => {

  // Get context
  const { 
    win,
    turn,
    agents, setAgents,
    targets,
    bullets, setBullets, 
    obstacles,
    animationQueue, setAnimationQueue,
    animationRunning, setAnimationRunning,
    newGame,
    nextAction,
    nextTurn,
  } = useContext(GameContext);

  // Refs
  const waitingInput = useRef(false);

  // CONTROLS WITH KEYBOARD
  useEffect(() => {
    
    const handleKeyPress = (event) => { 
      // Prevent multiple inputs
      if (waitingInput.current) return;
      // Prevent more than NB_ACTIONS_PER_TURN actions per turn
      if (turn.actions === NB_ACTIONS_PER_TURN) return;
      // Prevent actions if game is over
      if (win && event.key !== 'Enter') return;
    
      // Prevent actions if animation is running
      waitingInput.current = true;

      // Define arguments
      const moveArgs = [turn, agents, targets, obstacles, setAgents];
      const attackArgs = [turn, agents, setBullets];

      // Define actions
      const actions = {
        'ArrowUp': () => handleMove('up', ...moveArgs),
        'ArrowDown': () => handleMove('down', ...moveArgs),
        'ArrowLeft': () => handleMove('left', ...moveArgs),
        'ArrowRight': () => handleMove('right', ...moveArgs),
        ' ': () => handleAttack(...attackArgs),
        'Enter': () => newGame(),
      }

      // Add action to animation queue and start animation
      if (actions[event.key]) {
        setAnimationQueue([...animationQueue, actions[event.key]]);
        nextAction();
      }

      // Reset input
      setTimeout(() => waitingInput.current = false, 500);
    };

    // Add event listener for keypress
    window.addEventListener('keydown', handleKeyPress);
    // Clean up when component unmounts
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    }
  }, [turn, win, agents, targets, obstacles, setAgents, setBullets, animationQueue, setAnimationQueue, nextAction, newGame]);
  

  // GAME LOOP : handle turns
  useEffect(() => {
    if (turn.actions === NB_ACTIONS_PER_TURN && !animationRunning && animationQueue.length === 0) {
      nextTurn();
    }
  }, [turn, animationRunning, animationQueue, nextTurn]);

  // GAME LOOP : animation queue
  useEffect(() => {
    if (!animationRunning && animationQueue.length > 0) {
      let queue = [...animationQueue];
      const animation = queue.shift();
      const started = animation();
      started && setAnimationRunning(true);
      setAnimationQueue(queue)
    }
  }, [animationQueue, animationRunning, setAnimationQueue, setAnimationRunning]);
  

  return (
    <Canvas 
      camera={{ position: [0, 14, 14] }} 
      style={{ background: COLOR_BG_GAME, flex: 3}}
    >
      <OrbitControls target={[0, 0, 0]} />
      <Stars />
      <ambientLight intensity={1.2} />
      <spotLight position={[0, 10, 0]} angle={1} />
      <Board />
      {/* Here you can add your agents, targets, and obstacles. */}
      {agents.map(agent => (
        agent.life > 0 && (
          <Agent 
            key={agent.id} 
            id={agent.id}
            initialPosition={agent.initialPosition} 
            position={agent.position} 
            team={agent.team} 
            life={agent.life} 
            shake={agent.shake}
            isCurrent={agent.id === turn.agentId}
          />
        )
      ))}
      {targets.map(target => (
        target.life > 0 && (
          <Target 
            key={target.id} 
            position={target.position} 
            team={target.team} 
            life={target.life}
            shake={target.shake}
          />
        )
      ))}
      {obstacles.map(obstacle => <Obstacle key={obstacle.id} position={obstacle.position} />)}
      {bullets.map((bullet) => (
        <Bullet 
          key={bullet.id}
          id={bullet.id}
          initialPosition={bullet.initialPosition}
          target={bullet.target}
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
