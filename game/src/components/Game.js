import React, { useState, useEffect } from 'react';
import Board from './Board';
import Agent from './Agent';
import Target from './Target';
import Obstacle from './Obstacle';
import Bullet from './Bullet';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import { AGENT_LIFE, TARGET_LIFE, BOARD_SIZE } from '../libs/constants';
import { handleShakeItem } from '../libs/animations';


const Game = () => {

  // States
  const [bullets, setBullets] = useState([]);
  const [gameState, setGameState] = useState({
    turn: 0,  
    agents: [
      { id: 1, team: 'red', life: AGENT_LIFE, initialPosition: [2, 0], position: [2, 0], shake: false },
      { id: 2, team: 'blue', life: AGENT_LIFE, initialPosition: [-2, 0], position: [-2, 0], shake: false },
    ],
    targets: [
      { id: 1, team: 'blue', position: [-1, 0], life: TARGET_LIFE, shake: false },
      { id: 2, team: 'red', position: [1, 0], life: TARGET_LIFE, shake: false },
    ],
    obstacles: [
      { id: 1, position: [0, 0] },
    ],
  });

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
        setGameState(newGameState);
      }
    }
  };

  const handleAttack = (agentId) => {
    // Find the agent in the gameState
    const agentIndex = gameState.agents.findIndex((agent) => agent.id === agentId);
  
    // If the agent is found
    if (agentIndex !== -1) {
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
    }
  };



  
  // CONTROLS WITH KEYBOARD
  useEffect(() => {
    
    const handleKeyPress = (event) => {
      if (event.key === "ArrowUp") { handleMove(1, 'up') }
      if (event.key === "ArrowDown") { handleMove(1, 'down') }
      if (event.key === "ArrowLeft") { handleMove(1, 'left') }
      if (event.key === "ArrowRight") { handleMove(1, 'right') }
      if (event.key === " ") { handleAttack(1) }
    };

    window.addEventListener('keydown', handleKeyPress);
  
    // Clean up when component unmounts
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    }
  }, []);
  
  
  

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
