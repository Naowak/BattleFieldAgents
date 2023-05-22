import React, { useEffect, useContext } from 'react';
import { GameContext } from '../contexts/GameContext';
import Board from './Board';
import Agent from './Agent';
import Target from './Target';
import Obstacle from './Obstacle';
import Bullet from './Bullet';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import { COLOR_BG_GAME } from '../libs/constants';
import { handleMove, handleAttack } from '../libs/actions';

const Game = () => {

  // Get context
  const { 
    win,
    turn, setTurn,
    agents, setAgents,
    targets,
    bullets, setBullets, 
    obstacles,
    animationQueue, setAnimationQueue,
    animationCounter, setAnimationCounter,
    newGame,
  } = useContext(GameContext);

  // CONTROLS WITH KEYBOARD
  useEffect(() => {
    
    const handleKeyPress = (event) => { 

      // Define arguments
      const moveArgs = [turn, agents, targets, obstacles, setTurn, setAgents];
      const attackArgs = [turn, agents, setTurn, setBullets];

      // Define actions
      const actions = {
        'ArrowUp': () => handleMove('up', ...moveArgs),
        'ArrowDown': () => handleMove('down', ...moveArgs),
        'ArrowLeft': () => handleMove('left', ...moveArgs),
        'ArrowRight': () => handleMove('right', ...moveArgs),
        ' ': () => handleAttack(...attackArgs),
      }

      // Add action to animation queue
      if (actions[event.key]) {
        animationQueue.push(actions[event.key]);
      }
    };    

    // Add event listener for keypress
    window.addEventListener('keydown', handleKeyPress);
  
    // Clean up when component unmounts
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    }
  }, [turn, agents, targets, obstacles, setTurn, setAgents, setBullets]);
  

  // GAME LOOP : check win 
  useEffect(() => {
    if (win) {
      alert(`${win === 'red' ? 'Red' : 'Blue'} team wins!\nNew game in 10 seconds.`);
      setTimeout(() => newGame(), 10000);
    }
  }, [win, newGame]);
  

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
    </Canvas>
  );
};

export default Game;
