import React, { useState, createContext } from 'react'
import { initGameState } from '../libs/initialization';
import { computeSight, computeVisibleCells, computeLastPosSeen } from '../libs/sight';
import { NB_ACTIONS_PER_TURN, CONNECTION_DURATION } from '../libs/constants';

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
  const [connection, setConnection] = useState(init.connection);
  const [animationQueue, setAnimationQueue] = useState(init.animationQueue);
  const [animationRunning, setAnimationRunning] = useState(init.animationRunning);
  const [hover, setHover] = useState(null);

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
    setAgents(prevAgents => {
      const curTurn = newTurn ? newTurn : turn;
      const currentAgent = prevAgents.find(agent => agent.id === curTurn.agentId);
      const newAgents = [...prevAgents];
      currentAgent.sight = computeSight(currentAgent, prevAgents, obstacles, targets);
      currentAgent.lastPosSeen = computeLastPosSeen(currentAgent, curTurn);
      setVisibleCells(computeVisibleCells(currentAgent, prevAgents, obstacles, targets));
      return newAgents;
    });
  };

  // Next action
  const nextAction = () => {
    if (turn.actions === NB_ACTIONS_PER_TURN) return;
    setTurn(prev => ({ ...prev, actions: prev.actions + 1 }));
  }

  // Return the next turn
  const nextTurn = () => {
    // Create new turn
    let newTurn = { ...turn };
    newTurn.actions = 0;
    newTurn.current += 1;

    // Find next agent
    const index = (newTurn.order.findIndex(a => a === newTurn.agentId) + 1) % newTurn.order.length;
    const tempOrder = [...newTurn.order.slice(index), ...newTurn.order.slice(0, index)];
    newTurn.agentId = tempOrder.find(agentId => agents.find(agent => agent.id === agentId).life > 0);

    // Update sight of new agent
    updateSight(newTurn);

    // Set new turn
    setTurn(newTurn);
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

  // Update Connection (active animation) and timeout the end of animation
  const updateConnection = (newConnection) => {
    setConnection({
      cellFrom: newConnection.cellFrom,
      cellTo: newConnection.cellTo,
    });
    setTimeout(() => {
      setConnection({
        cellFrom: null,
        cellTo: null,
      });
    }, CONNECTION_DURATION)
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
      connection, setConnection: updateConnection,
      animationQueue, setAnimationQueue,
      animationRunning, setAnimationRunning,
      hover, setHover,
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