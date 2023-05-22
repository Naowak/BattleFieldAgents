import React, { useState, useRef, createContext } from 'react'
import { initGameState } from '../libs/initialization';


export const GameContext = createContext()

export default function GameContextProvider (props) {

  // Initialize game state
  const init = initGameState();

  // Set up state
  const [over, setOver] = useState(false);
  const [turn, setTurn] = useState(init.turn);
  const [agents, setAgents] = useState(init.agents);
  const [targets, setTargets] = useState(init.targets);
  const [bullets, setBullets] = useState(init.bullets);
  const [obstacles, setObstacles] = useState(init.obstacles);

  // Set up functions
  const removeBullet = (bulletId) => {
    setBullets(prev => [...prev].filter((bullet) => bullet.id !== bulletId));
  };

  // New Game : reset state
  const newGame = () => {
    const init = initGameState();
    setOver(false);
    setTurn(init.turn);
    setAgents(init.agents);
    setTargets(init.targets);
    setBullets(init.bullets);
    setObstacles(init.obstacles);
  };

  return (
    <GameContext.Provider value={{ 
      over, setOver,
      turn, setTurn,
      agents, setAgents,
      targets, setTargets,
      bullets, setBullets,
      obstacles, setObstacles,
      removeBullet,
      newGame,
    }}>
      {props.children}
    </GameContext.Provider>
  )
}