import React, { useState, createContext } from 'react'
import { initGameState } from '../libs/initialization';
import { computeSight, computeVisibleCells } from '../libs/sight';
import { NB_ACTIONS_PER_TURN } from '../libs/constants';

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
  const [visibleCells, setVisibleCells] = useState(init.visibleCells); // only for debug
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
    const curTurn = newTurn ? newTurn : turn;
    let newAgents = [...agents];
    const currentAgent = newAgents.find(agent => agent.id === curTurn.agentId);
    currentAgent.sight = computeSight(currentAgent, agents, obstacles, targets);
    setVisibleCells(computeVisibleCells(currentAgent, agents, obstacles, targets));
    setAgents(newAgents);
  };

  // Next action
  const nextAction = () => {
    if (turn.actions === NB_ACTIONS_PER_TURN) return;
    setTurn(prev => ({ ...prev, actions: prev.actions + 1 }));
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

  // check win
  const checkWin = (agents) => {
    const blues = agents.filter(agent => agent.team === 'blue');
    const reds = agents.filter(agent => agent.team === 'red');
    if (blues.every(agent => agent.life <= 0)) {
      setWin('red');
    } else if (reds.every(agent => agent.life <= 0)) {
      setWin('blue');
    }
  };

  // Update Agents and check win
  const updateAgents = (arg) => {
    // check if arg is a function
    if (typeof arg === 'function') {
      setAgents(prev => {
        const newAgents = arg(prev);
        checkWin(newAgents);
        return newAgents;
      });
    } else {
      // check win
      checkWin(arg);
      setAgents(arg);
    }  
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
      visibleCells, setVisibleCells,
      animationQueue, setAnimationQueue,
      animationRunning, setAnimationRunning,
      nextAction,
      nextTurn,
      removeBullet,
      newGame,
      updateSight,
    }}>
      {props.children}
    </GameContext.Provider>
  )
}