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
    over,
    turn, 
    agents, 
    targets, 
    bullets, 
    obstacles,
    setOver,
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
  

  // GAME LOOP
  useEffect(() => {

    // handle win
    const handleWin = (team) => {
      if (over) {
        return;
      }
      setOver(true);
      alert(`${team} team wins!\nNew game in 10 seconds.`);
      setTimeout(() => {
        newGame()
      }, 10000);
    };

    const redTeamAgents = agents.filter(agent => agent.team === 'red');
    const blueTeamAgents = agents.filter(agent => agent.team === 'blue');
    
    // check if all agents of one team are dead
    if (redTeamAgents.every(agent => agent.life <= 0)) {
      handleWin('Blue!');
    }
    if (blueTeamAgents.every(agent => agent.life <= 0)) {
      handleWin('Red');
    }

    // check if a target is destroyed
    if (targets.some(target => target.life <= 0)) {
      handleWin(targets[0].life > 0 ? 'Red' : 'Blue');
    }
  }, [over, agents, targets, setOver]);
  
  
  

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
          initialPosition={bullet.initialPosition}
          target={bullet.target}
        />
      ))}
    </Canvas>
  );
};

export default Game;
