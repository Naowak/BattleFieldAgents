import React, { useState, createContext } from 'react'
import { initGameState } from '../libs/initialization';
import { computeSight } from '../libs/sight';

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
  const [animationQueue, setAnimationQueue] = useState(init.animationQueue);
  const [animationRunning, setAnimationRunning] = useState(init.animationRunning);

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

  // Update Current Agent Sight
  const updateSight = (newTurn) => {
    let newAgents = [...agents];
    const currentAgent = newAgents.find(agent => agent.id === newTurn.agentId);
    currentAgent.sight = computeSight(currentAgent, agents, targets, obstacles);
    setAgents(newAgents);
  };

  // Next action
  const nextAction = () => {
    let newTurn = { ...turn };
    newTurn.actions += 1;
    setTurn(newTurn);
  }

  // Return the next turn
  const nextTurn = () => {
    let newTurn = { ...turn };
    newTurn.actions = 0;
    newTurn.current += 1;
    newTurn.agentId = newTurn.order[newTurn.current % newTurn.order.length]
    setTurn(newTurn);
    updateSight(newTurn);
  };


  // Update Agents and check win
  const updateAgents = (newAgents) => {
    const blues = newAgents.filter(agent => agent.team === 'blue');
    const reds = newAgents.filter(agent => agent.team === 'red');
    if (blues.every(agent => agent.life <= 0)) {
      setWin('red');
    } else if (reds.every(agent => agent.life <= 0)) {
      setWin('blue');
    }
    setAgents(newAgents);
  };

  // Update Targets and check win
  const updateTargets = (newTargets) => {
    const blues = newTargets.filter(target => target.team === 'blue');
    const reds = newTargets.filter(target => target.team === 'red');
    if (blues.every(target => target.life <= 0)) {
      setWin('red');
    } else if (reds.every(target => target.life <= 0)) {
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
      animationQueue, setAnimationQueue,
      animationRunning, setAnimationRunning,
      nextAction,
      nextTurn,
      removeBullet,
      newGame,
    }}>
      {props.children}
    </GameContext.Provider>
  )
}