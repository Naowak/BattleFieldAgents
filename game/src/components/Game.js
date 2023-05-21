import React, { useState, useEffect, useRef } from 'react';
import Board from './Board';
import Agent from './Agent';
import Target from './Target';
import Obstacle from './Obstacle';
import Bullet from './Bullet';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import { BOARD_SIZE, COLOR_BG_GAME } from '../libs/constants';
import { handleShakeItem } from '../libs/animations';
import { initGameState } from '../libs/initialization';

const Game = ({ gameState, setGameState }) => {

  // Ref 
  const over = useRef(false);

  // States
  const [bullets, setBullets] = useState([]);

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
        // Check if agent is dead
        if (!gameState.turn.order.includes(agent.id)) {
          return false;
        }
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
        updateTurn();
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

    updateTurn();

  };

  // Update the gameState after each action
  const updateTurn = () => {
    let newGameState = { ...gameState };
    newGameState.turn.actions += 1;

    if (newGameState.turn.actions % 4 === 0) { // if 4 actions completed, next turn (agent)
      newGameState.turn.actions = 0;
      newGameState.turn.current = newGameState.turn.current + 1;
      newGameState.turn.agentId = gameState.turn.order[gameState.turn.current % gameState.turn.order.length]
    }

    setGameState(newGameState);
  };

  // Remove agent from the gameState.turn.order
  const killAgent = (agentId) => {
    let newGameState = { ...gameState };
    newGameState.turn.order = newGameState.turn.order.filter((id) => id !== agentId);
    setGameState(newGameState);
  };


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




  
  // CONTROLS WITH KEYBOARD
  useEffect(() => {
    
    const handleKeyPress = (event) => {
      // Get the id of the current agent
      if (event.key === "ArrowUp") { handleMove(gameState.turn.agentId, 'up') }
      if (event.key === "ArrowDown") { handleMove(gameState.turn.agentId, 'down') }
      if (event.key === "ArrowLeft") { handleMove(gameState.turn.agentId, 'left') }
      if (event.key === "ArrowRight") { handleMove(gameState.turn.agentId, 'right') }
      if (event.key === " ") { handleAttack(gameState.turn.agentId) }
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
      handleWin('Blue!');
    }
    if (blueTeamAgents.every(agent => agent.life <= 0)) {
      handleWin('Red');
    }

    // check if a target is destroyed
    if (gameState.targets.some(target => target.life <= 0)) {
      handleWin(gameState.targets[0].life > 0 ? 'Red' : 'Blue');
    }
  }, [gameState]);
  
  
  

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
        />
      ))}
    </Canvas>
  );
};

export default Game;
