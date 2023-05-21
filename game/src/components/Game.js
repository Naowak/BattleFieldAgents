import React, { useState, useEffect, useRef } from 'react';
import Board from './Board';
import Agent from './Agent';
import Target from './Target';
import Obstacle from './Obstacle';
import Bullet from './Bullet';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import { COLOR_BG_GAME } from '../libs/constants';
import { handleShakeItem } from '../libs/animations';
import { initGameState } from '../libs/initialization';
import { handleMove, handleAttack } from '../libs/actions';

const Game = ({ gameState, setGameState }) => {

  // Ref 
  const over = useRef(false);

  // States
  const [bullets, setBullets] = useState([]);
  
  const removeBullet = (bulletId) => {
    setBullets(bullets.filter((bullet) => bullet.id !== bulletId));
  };

  const onAnimationEnd = (agentId) => {
    return { ...gameState, isAnimation: false };
  };
    

  // Remove agent from the gameState.turn.order
  const killAgent = (agentId) => {
    let newGameState = { ...gameState };
    newGameState.turn.order = newGameState.turn.order.filter((id) => id !== agentId);
    setGameState(newGameState);
  };
  
  // CONTROLS WITH KEYBOARD
  useEffect(() => {
    
    const handleKeyPress = (event) => {
      // Get the current ref value inside the event handler
      if (!gameState.isAnimation) {
        // Get the id of the current agent
        if (event.key === "ArrowUp") { handleMove('up', gameState, setGameState) }
        if (event.key === "ArrowDown") { handleMove('down', gameState, setGameState) }
        if (event.key === "ArrowLeft") { handleMove('left', gameState, setGameState) }
        if (event.key === "ArrowRight") { handleMove('right', gameState, setGameState) }
        if (event.key === " ") { handleAttack(gameState, setGameState, setBullets) }
      }
    };    

    // Add event listener for keypress
    window.addEventListener('keydown', handleKeyPress);
  
    // Clean up when component unmounts
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    }
  }, [gameState, setGameState]);
  

  // GAME LOOP
  useEffect(() => {

    // handle win
    const handleWin = (team) => {
      if (over.current) {
        return;
      }
      over.current = true;
      alert(`${team} team wins!`);
      console.log("New game in 10 seconds")
      setTimeout(() => {
        over.current = false;
        setGameState(initGameState())
      }, 10000);
    };

    const redTeamAgents = gameState.agents.filter(agent => agent.team === 'red');
    const blueTeamAgents = gameState.agents.filter(agent => agent.team === 'blue');
    
    // check if all agents of one team are dead
    if (redTeamAgents.every(agent => agent.life <= 0)) {
      handleWin('Blue!');
    }
    if (blueTeamAgents.every(agent => agent.life <= 0)) {
      handleWin('Red');
    }

    // check if a target is destroyed
    if (gameState.targets.some(target => target.life <= 0)) {
      handleWin(gameState.targets[0].life > 0 ? 'Red' : 'Blue');
    }
  }, [gameState, setGameState]);
  
  
  

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
      {gameState.agents.map(agent => (
        agent.life > 0 && (
          <Agent 
            key={agent.id} 
            initialPosition={agent.initialPosition} 
            position={agent.position} 
            team={agent.team} 
            life={agent.life} 
            shake={agent.shake}
            isCurrent={agent.id === gameState.turn.agentId}
            onAnimationEnd={onAnimationEnd}
          />
        )
      ))}
      {gameState.targets.map(target => (
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
      {gameState.obstacles.map(obstacle => <Obstacle key={obstacle.id} position={obstacle.position} />)}
      {bullets.map((bullet) => (
        <Bullet 
          key={bullet.id} 
          {...bullet} 
          removeBullet={removeBullet}
          gameState={gameState}
          handleShakeItem={(itemId, kind) => handleShakeItem(itemId, kind, gameState, setGameState)}
          killAgent={killAgent}
          onAnimationEnd={onAnimationEnd}
        />
      ))}
    </Canvas>
  );
};

export default Game;
