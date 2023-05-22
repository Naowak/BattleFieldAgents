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

const Game = ({ }) => {

  // Get context
  const { 
    win,
    turn, 
    agents, 
    targets, 
    bullets, 
    obstacles,
    setTurn,
    setAgents,
    setBullets,
    newGame,
  } = useContext(GameContext);

  // CONTROLS WITH KEYBOARD
  useEffect(() => {
    
    const handleKeyPress = (event) => {

      // Get the id of the current agent
      if (event.key === "ArrowUp") { handleMove('up', turn, agents, targets, obstacles, setTurn, setAgents) }
      if (event.key === "ArrowDown") { handleMove('down', turn, agents, targets, obstacles, setTurn, setAgents) }
      if (event.key === "ArrowLeft") { handleMove('left', turn, agents, targets, obstacles, setTurn, setAgents) }
      if (event.key === "ArrowRight") { handleMove('right', turn, agents, targets, obstacles, setTurn, setAgents) }
      if (event.key === " ") { handleAttack(turn, agents, setTurn, setBullets) }
    };    

    // Add event listener for keypress
    window.addEventListener('keydown', handleKeyPress);
  
    // Clean up when component unmounts
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    }
  }, [turn, agents, targets, obstacles, setTurn, setAgents, setBullets]);
  

  // GAME LOOP : check win 
  // useEffect(() => {
  //   console.log('win', win)
  //   if (win) {
  //     alert(`${win === 'red' ? 'Red' : 'Blue'} team wins!\nNew game in 10 seconds.`);
  //     setTimeout(() => {
  //       newGame()
  //     }, 10000);
  //   }
  // }, [win]);
  

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
