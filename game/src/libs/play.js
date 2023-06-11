import { NB_ACTIONS_PER_TURN, FETCH_TIMEOUT, NB_CELLS_MAX_PER_MOVE } from './constants';
import { handleMove, handleAttack, handleSpeak } from './actions';
import { aStar } from './aStar';

// EXPORTS

// Function called when a key [up, down, left, right, space, enter] is pressed
const playKeyboard = (event, waitingInput, turn, win, agents, targets, obstacles, setAgents, setBullets, animationQueue, setAnimationQueue, nextAction, newGame) => { 
  // Prevent multiple inputs
  if (waitingInput.current) return;
  // Prevent more than NB_ACTIONS_PER_TURN actions per turn
  if (turn.actions === NB_ACTIONS_PER_TURN) return;
  // Prevent actions if game is over
  if (win && event.key !== 'Enter') return;

  // Prevent actions if animation is running
  waitingInput.current = true;

  
  // Define arguments
  const currAgent = agents.find(agent => agent.id === turn.agentId);
  const moveArgs = [turn, agents, targets, obstacles, setAgents];
  const attackArgs = [turn, agents, setBullets];

  // Define actions
  const actions = {
    'ArrowUp': () => handleMove([currAgent.position[0], currAgent.position[1] - 1], ...moveArgs),
    'ArrowDown': () => handleMove([currAgent.position[0], currAgent.position[1] + 1], ...moveArgs),
    'ArrowLeft': () => handleMove([currAgent.position[0] - 1, currAgent.position[1]], ...moveArgs),
    'ArrowRight': () => handleMove([currAgent.position[0] + 1, currAgent.position[1]], ...moveArgs),
    ' ': () => handleAttack(null, ...attackArgs),
    'Enter': () => newGame(),
  }

  // Add action to animation queue and start animation
  if (actions[event.key]) {
    setAnimationQueue([...animationQueue, actions[event.key]]);
    nextAction();
  }

  // Reset input
  setTimeout(() => waitingInput.current = false, 500);
};



// Function called when key "A" is pressed, to play the AI
const playAI = async (turn, win, agents, targets, obstacles, setAgents, setBullets, setConnection, animationRunning, animationQueue, setAnimationQueue, nextAction) => {

  // Prevent more than NB_ACTIONS_PER_TURN actions per turn
  if (turn.actions === NB_ACTIONS_PER_TURN || animationRunning || animationQueue.length !== 0 || win) {
      return null;
  }

  // Find current agent
  const currentAgent = agents.find(agent => agent.id === turn.agentId);

  // Update agent thinking 
  const newCurrentAgent = {
    ...currentAgent,
    thinking: true,
  };
  const newAgents = agents.map(agent => {
    if (agent.id === currentAgent.id) {
      return newCurrentAgent;
    }
    return agent;
  });
  setAgents(newAgents);

  // Set a timeout of X second for the fetch request
  let response;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT);

  
  try {
    // Send a POST request to the API with the current game state
    response = await fetch('http://localhost:5000/play_one_turn', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        state: getAgentState(newCurrentAgent, turn, agents, targets, obstacles),
      }),
      signal: controller.signal // Pass the AbortController's signal to the fetch request
    });
  } catch (error) {
    // Update agent thinking
    const finalAgent = {
      ...newCurrentAgent,
      thinking: false,
    };
    const finalAgents = agents.map(agent => {
      if (agent.id === newCurrentAgent.id) {
        return finalAgent;
      }
      return agent;
    });
    setAgents(finalAgents);
    console.log('Error', error);
    return null;
  }

  // Clear the timeout
  clearTimeout(timeout);

  // Parse the response JSON
  const { thoughts, action } = await response.json();

  console.log(getAgentState(newCurrentAgent, turn, agents, targets, obstacles), thoughts, action);

  // Update agent thinking 
  const finalAgent = {
    ...newCurrentAgent,
    thinking: false,
    historic: [...newCurrentAgent.historic, { turn: turn.current, actionNumber: turn.actions, thoughts, action }],
  };
  const finalAgents = agents.map(agent => {
    if (agent.id === newCurrentAgent.id) {
      return finalAgent;
    }
    return agent;
  });
  setAgents(finalAgents);

  // Add action to animation queue and start animation
  try {
    // Read action
    const animation = readAIAction(action, turn, agents, targets, obstacles, setAgents, setBullets, setConnection);
    if (animation) {
      setAnimationQueue([...animationQueue, animation]);
      nextAction();
    }
    else {
      console.log('Invalid action', action);
    }
  }
  catch {
    console.log('Error Invalid action', action);
    return null;
  }
};

export {
  playKeyboard,
  playAI,
}


// FUNCTIONS

// Return all cells that are reachable by the agent
const getPossibleMoves = (agent, forbidden_cells) => {
  
  // Compute all cells that are in range NB_CELLS_MAX_PER_MOVE in manhattan distance
  const cellsInRange = [];
  for (let i = -NB_CELLS_MAX_PER_MOVE; i <= NB_CELLS_MAX_PER_MOVE; i++) {
    for (let j = -NB_CELLS_MAX_PER_MOVE; j <= NB_CELLS_MAX_PER_MOVE; j++) {
      if (Math.abs(i) + Math.abs(j) <= NB_CELLS_MAX_PER_MOVE) {
        cellsInRange.push([agent.position[0] + i, agent.position[1] + j]);
      }
    }
  }

  // Filter out cells that have no path to them (and the ones that are occupied or out of bounds)
  const possibleMoves = cellsInRange.filter(c => aStar(agent.position, c, forbidden_cells).length > 0);
  return possibleMoves.map(c => `MOVE [${c[0]}, ${c[1]}]`);
}


const getPossibleAttacks = (agent) => {
  return agent.sight.filter(o => ((o.kind === 'agents' || o.kind === 'targets') && o.team !== agent.team)).map(
    o => `ATTACK [${o.position[0]}, ${o.position[1]}]`
  );
}

const getPossibleSpeaks = (agent) => {
  return agent.sight.filter(o => o.kind === 'agents' && o.team === agent.team).map(
    o => `SPEAK [${o.position[0]}, ${o.position[1]}]`
  );
}

// Function that converts an agent's sight and infos to a state
const getAgentState = (agent, turn, agents, targets, obstacles) => {

  // Compute which movement are possible
  const possibleMoves = getPossibleMoves(agent, [...agents, ...targets, ...obstacles].map(o => o.position));

  // Compute which cell he can attack
  const possibleAttacks = getPossibleAttacks(agent);

  // Compute which cell he can speak
  const possibleSpeaks = getPossibleSpeaks(agent);

  // Create state
  const state = {}
  state['Turn'] = turn.current;
  state['Messages'] = [...agent.messages];
  state['Historic'] = [...agent.historic];
  state['Last Positions Seen'] = {...agent.lastPosSeen};
  state['Your Position'] = agent.position;
  state['Your Health'] = agent.life;
  state['Friends'] = agent.sight.filter(o => o.kind === 'agents' && o.team === agent.team).map(
    o => ({ id: o.id, position: o.position, health: o.life })
  );
  state['Enemies'] = agent.sight.filter(o => o.kind === 'agents' && o.team !== agent.team).map(
    o => ({ id: o.id, position: o.position, health: o.life })
  );
  state['Friend Target'] = agent.sight.filter(o => o.kind === 'targets' && o.team === agent.team).map(
    o => ({ position: o.position, health: o.life })
  )
  state['Enemy Target'] = agent.sight.filter(o => o.kind === 'targets' && o.team !== agent.team).map(
    o => ({ position: o.position, health: o.life })
  )
  state['Obstacles'] = agent.sight.filter(o => o.kind === 'obstacles').map(o => o.position);
  state['Actions Left'] = `${NB_ACTIONS_PER_TURN - turn.actions}/${NB_ACTIONS_PER_TURN}`;
  state['Possible Actions'] = [...possibleMoves, ...possibleAttacks, ...possibleSpeaks];
  return state;
}

const readAIAction = (action, turn, agents, targets, obstacles, setAgents, setBullets, setConnection) => {

  const currAgent = agents.find(o => o.id === turn.agentId);

  if (action.slice(0, 4) === 'MOVE') {

    // Check if move is possible
    const possibleMoves = getPossibleMoves(currAgent);
    const match = action.match(/MOVE \[(-*\d+), (-*\d+)\]/);
    const cell = match ? [parseInt(match[1]), parseInt(match[2])] : null;
    const possible = possibleMoves.find(o => o === action) !== undefined;

    if (possible && cell) {
      const moveArgs = [turn, agents, targets, obstacles, setAgents];
      return () => handleMove(cell, ...moveArgs)
    }

  } else if (action.slice(0, 6) === 'ATTACK') {

    // Check if attack is possible
    const possibleAttacks = getPossibleAttacks(currAgent);
    const match = action.match(/ATTACK \[(-*\d+), (-*\d+)\]/);
    const cell = match ? [parseInt(match[1]), parseInt(match[2])] : null;
    const possible = possibleAttacks.find(o => o === action) !== undefined;

    if (possible && cell) {
      const attackArgs = [turn, agents, setBullets];
      return () => handleAttack(cell, ...attackArgs)
    }
  } else if (action.slice(0, 5) === 'SPEAK') {

    // Check if speak is possible
    const possibleSpeaks = getPossibleSpeaks(currAgent);
    const match = action.match(/SPEAK \[(-*\d+), (-*\d+)\] (.+)/);
    const cell = match ? [parseInt(match[1]), parseInt(match[2])] : null;
    const message = match ? match[3] : null;
    const actionToTest = match ? `SPEAK [${cell[0]}, ${cell[1]}]` : null;
    const possible = possibleSpeaks.find(o => o === actionToTest) !== undefined;

    if (possible && cell && message) {
      const speakArgs = [turn, agents, setAgents, setConnection];
      return () => handleSpeak(cell, message, ...speakArgs)
    }
  }

  return null;
}