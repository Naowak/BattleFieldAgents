import React, { useState, useRef, createContext } from 'react'
import { initGameState } from '../libs/initialization';


export const GameContext = createContext()

export default function GameContextProvider (props) {

  // Initialize game state
  const init = initGameState();

  // Set up state
  const [win, setWin] = useState('');
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
    setWin('');
    setTurn(init.turn);
    setAgents(init.agents);
    setTargets(init.targets);
    setBullets(init.bullets);
    setObstacles(init.obstacles);
  };

  // Update Agents and check win
  const updateAgents = (newAgents) => {
    const blues = newAgents.filter(agent => agent.kind === 'blue');
    const reds = newAgents.filter(agent => agent.kind === 'red');
    if (blues.every(agent => agent.life <= 0)) {
      setWin('red');
    } else if (reds.every(agent => agent.life <= 0)) {
      setWin('blue');
    }
    setAgents(newAgents);
  };

  // Update Targets and check win
  const updateTargets = (newTargets) => {
    const blues = newTargets.filter(agent => agent.kind === 'blue');
    const reds = newTargets.filter(agent => agent.kind === 'red');
    if (blues.every(agent => agent.life <= 0)) {
      setWin('red');
    } else if (reds.every(agent => agent.life <= 0)) {
      setWin('blue');
    }
    setTargets(newTargets);
  };

  return (
    <GameContext.Provider value={{ 
      win, setWin,
      turn, setTurn,
      agents, setAgents: updateAgents,
      targets, setTargets: updateTargets,
      bullets, setBullets,
      obstacles, setObstacles,
      removeBullet,
      newGame,
    }}>
      {props.children}
    </GameContext.Provider>
  )
}