import React, { useState, useEffect } from 'react';
import Board from './Board';
import Agent from './Agent';
import Target from './Target';
import Obstacle from './Obstacle';
import Bullet from './Bullet';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import { BOARD_SIZE } from '../libs/constants';
import { handleShakeItem } from '../libs/animations';
import { initGameState } from '../libs/initialization';

const Game = () => {

  // States
  const [bullets, setBullets] = useState([]);
  const [gameState, setGameState] = useState(initGameState());

  const removeBullet = (bulletId) => {
    setBullets(bullets.filter((bullet) => bullet.id !== bulletId));
  };

  const handleMove = (agentId, direction) => {

    // Create vector in the direction of the move
    let directionVector = [0, 0];
    if (direction === 'right') { directionVector[0] = 1; } 
    else if (direction === 'left') { directionVector[0] = -1; } 
    else if (direction === 'up') { directionVector[1] = -1; } 
    else if (direction === 'down') { directionVector[1] = 1; }
      

    // Find the agent in the gameState
    const agentIndex = gameState.agents.findIndex((agent) => agent.id === agentId);

    // If the agent is found
    if (agentIndex !== -1) {
      // Calculate new position based on direction
      let newPosition = [...gameState.agents[agentIndex].position];
      newPosition[0] += directionVector[0];
      newPosition[1] += directionVector[1];

      // Check if new position is valid (not colliding with obstacles)
      const obstacleCollision = gameState.obstacles.some((obstacle) => {
        return JSON.stringify(obstacle.position) === JSON.stringify(newPosition);
      });

      // Check if new position is valid (not colliding with other agents)
      const agentCollision = gameState.agents.some((agent) => {
        return JSON.stringify(agent.position) === JSON.stringify(newPosition);
      });

      // Check if new position is valid (not colliding with targets)
      const targetCollision = gameState.targets.some((target) => {
        return JSON.stringify(target.position) === JSON.stringify(newPosition);
      });

      // Check if new position is valid (not out of bounds)
      const outOfBounds = newPosition.some((coord) => {
        return Math.abs(coord) > BOARD_SIZE;
      });

      if (!obstacleCollision && !agentCollision && !targetCollision && !outOfBounds) {
        // Update gameState
        let newGameState = { ...gameState };
        newGameState.agents[agentIndex].position = newPosition;
    
        // increment turnActions
        newGameState.turn.actions += 1;
    
        if (newGameState.turn.actions % 4 === 0) { // if 4 actions completed, move to next agent
          do {
            newGameState.turn.current = (newGameState.turn.current + 1) % newGameState.agents.length;
          } while (newGameState.agents[newGameState.turn.current].life <= 0); // skip dead agents
        }
    
        setGameState(newGameState);
      }
    }
  };

  const handleAttack = (agentId) => {
    // Find the agent in the gameState
    const agentIndex = gameState.agents.findIndex((agent) => agent.id === agentId);

    // If the agent is not found, return
    if (agentIndex == -1) {
      return
    }
  
    // Create a bullet with a random target
    let targetX = Math.floor(Math.random() * (2*BOARD_SIZE + 1)) - BOARD_SIZE; // Random cell in the range [-BOARD_SIZE, BOARD_SIZE]
    let targetY = Math.floor(Math.random() * (2*BOARD_SIZE + 1)) - BOARD_SIZE; 

    setBullets(prevBullets => ([
      ...prevBullets, 
      { 
        id: Date.now(),  // Unique id for the bullet
        initialPosition: gameState.agents[agentIndex].position, 
        target: [targetX, targetY] 
      }
    ]));

    // Update turn 
    let newGameState = { ...gameState };
    newGameState.turn.actions += 1;

    if (newGameState.turn.actions % 4 === 0) { // if 4 actions completed, move to next agent
      do {
        newGameState.turn.current = (newGameState.turn.current + 1) % newGameState.agents.length;
      } while (newGameState.agents[newGameState.turn.current].life <= 0); // skip dead agents
    }

    setGameState(newGameState);

  };



  
  // CONTROLS WITH KEYBOARD
  useEffect(() => {
    
    const handleKeyPress = (event) => {
      // Get the id of the current agent
      const agentId = gameState.agents[gameState.turn.current]?.id;
    
      if (event.key === "ArrowUp") { handleMove(agentId, 'up') }
      if (event.key === "ArrowDown") { handleMove(agentId, 'down') }
      if (event.key === "ArrowLeft") { handleMove(agentId, 'left') }
      if (event.key === "ArrowRight") { handleMove(agentId, 'right') }
      if (event.key === " ") { handleAttack(agentId) }
    };
    

    window.addEventListener('keydown', handleKeyPress);
  
    // Clean up when component unmounts
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    }
  }, []);
  

  // GAME LOOP
  useEffect(() => {
    const redTeamAgents = gameState.agents.filter(agent => agent.team === 'red');
    const blueTeamAgents = gameState.agents.filter(agent => agent.team === 'blue');
    
    // check if all agents of one team are dead
    if (redTeamAgents.every(agent => agent.life <= 0)) {
      alert('Blue team wins!');
      // add code to end game
    }
    if (blueTeamAgents.every(agent => agent.life <= 0)) {
      alert('Red team wins!');
      // add code to end game
    }
    
    // check if a target is destroyed
    if (gameState.targets.some(target => target.life <= 0)) {
      alert(`${gameState.targets[0].life > 0 ? 'Red' : 'Blue'} team wins!`);
      // add code to end game
    }
  }, [gameState]);
  
  
  

  return (
    <Canvas 
      camera={{ position: [0, 14, 14] }} 
      style={{ background: "#111111"}}
    >
      <OrbitControls target={[0, 0, 0]} />
      <Stars />
      <ambientLight intensity={0.7} />
      <spotLight position={[0, 10, 0]} angle={1} />
      <Board />
      {/* Here you can add your agents, targets, and obstacles. */}
      {gameState.agents.map(agent => (
        <Agent 
          key={agent.id} 
          initialPosition={agent.initialPosition} 
          position={agent.position} 
          team={agent.team} 
          life={agent.life} 
          shake={agent.shake}
        />
      ))}
      {gameState.targets.map(target => (
        <Target 
          key={target.id} 
          position={target.position} 
          team={target.team} 
          life={target.life}
          shake={target.shake}
        />
      ))}
      {gameState.obstacles.map(obstacle => <Obstacle key={obstacle.id} position={obstacle.position} />)}
      {bullets.map((bullet) => (
        <Bullet 
          key={bullet.id} 
          {...bullet} 
          removeBullet={removeBullet}
          gameState={gameState}
          handleShakeItem={(itemId, kind) => handleShakeItem(itemId, kind, gameState, setGameState)}
        />
      ))}
    </Canvas>
  );
};

export default Game;
