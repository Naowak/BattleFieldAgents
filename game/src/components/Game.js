import React, { useState, useEffect } from 'react';
import Board from './Board';
import Agent from './Agent';
import Target from './Target';
import Obstacle from './Obstacle';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import { Physics } from '@react-three/cannon';

const SIZE = 10;

const Game = () => {

  const [gameState, setGameState] = useState({
    turn: 0,  
    agents: [
      { id: 1, team: 'red', life: 100, initialPosition: [2, 0], position: [2, 0] },
      { id: 2, team: 'blue', life: 100, initialPosition: [-2, 0], position: [-2, 0]},
    ],
    targets: [
      { id: 1, team: 'blue', position: [-1, 0] },
      { id: 2, team: 'red', position: [1, 0] },
    ],
    obstacles: [
      { id: 1, position: [0, 0] },
    ],
  });

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
        return Math.abs(coord) > SIZE;
      });

      if (!obstacleCollision && !agentCollision && !targetCollision && !outOfBounds) {
        // Update gameState
        let newGameState = { ...gameState };
        newGameState.agents[agentIndex].position = newPosition;
        setGameState(newGameState);
      }
    }
  };

  const handleAttack = (agentId, direction) => {
    // Find the agent in the gameState
    const agentIndex = gameState.agents.findIndex((agent) => agent.id === agentId);
    if (agentIndex !== -1) {
      // Add a bullet to the gameState
      let newGameState = { ...gameState };
      newGameState.bullets = newGameState.bullets || [];
      newGameState.bullets.push({
        id: Date.now(),  // Just using the current timestamp as a unique id
        position: [...newGameState.agents[agentIndex].position],
        direction,
      });
      setGameState(newGameState);
  
      // Remove the bullet after some time (simulate range)
      setTimeout(() => {
        let newGameState = { ...gameState };
        newGameState.bullets = newGameState.bullets.filter((bullet) => bullet.id !== Date.now());
        setGameState(newGameState);
      }, 2000);  // Adjust this based on how long you want the bullet to exist
    }
  };

  
  useEffect(() => {
    
    const handleKeyPress = (event) => {
      if (event.key === "ArrowUp") { handleMove(1, 'up') }
      if (event.key === "ArrowDown") { handleMove(1, 'down') }
      if (event.key === "ArrowLeft") { handleMove(1, 'left') }
      if (event.key === "ArrowRight") { handleMove(1, 'right') }
    };

    window.addEventListener('keydown', handleKeyPress);
  
    // Clean up when component unmounts
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    }
  }, []); // Pass an empty dependency array so this effect only runs once
  
  
  

  return (
    <Canvas 
      camera={{ position: [0, 14, 14] }} 
      style={{ background: "#111111"}}
    >
      <OrbitControls target={[0, 0, 0]} />
      <Stars />
      <ambientLight intensity={0.7} />
      <spotLight position={[0, 10, 0]} angle={1} />
      <Physics>
        <Board dimensions={[2*SIZE+1, 2*SIZE+1]}
        />
        {/* Here you can add your agents, targets, and obstacles. */}
        {gameState.agents.map(agent => (
          <Agent 
            key={agent.id} 
            initialPosition={agent.initialPosition} 
            position={agent.position} 
            team={agent.team} 
            life={agent.life} 
          />
        ))}
        {gameState.targets.map(target => <Target key={target.id} position={target.position} team={target.team} />)}
        {gameState.obstacles.map(obstacle => <Obstacle key={obstacle.id} position={obstacle.position} />)}
      </Physics>
    </Canvas>
  );
};

export default Game;
