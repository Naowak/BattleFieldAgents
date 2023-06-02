import { NB_ACTIONS_PER_TURN, BOARD_SIZE } from './constants';
import { handleMove, handleAttack } from './actions';


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
  const moveArgs = [turn, agents, targets, obstacles, setAgents];
  const attackArgs = [turn, agents, setBullets];

  // Define actions
  const actions = {
    'ArrowUp': () => handleMove('up', ...moveArgs),
    'ArrowDown': () => handleMove('down', ...moveArgs),
    'ArrowLeft': () => handleMove('left', ...moveArgs),
    'ArrowRight': () => handleMove('right', ...moveArgs),
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

// Function that converts an agent's sight and infos to a state
const getAgentState = (agent, turn) => {

  // Compute which movement are possible
  const adjacantCells = [
    [agent.position[0], agent.position[1] - 1],
    [agent.position[0], agent.position[1] + 1], 
    [agent.position[0] - 1, agent.position[1]], 
    [agent.position[0] + 1, agent.position[1]], 
  ];
  const possibleMoves = []
  adjacantCells.forEach(cell => {
    const free = agent.sight.find(o => o.position[0] === cell[0] && o.position[1] === cell[1]) === undefined;
    const inBoard = cell[0] >= -BOARD_SIZE && cell[0] <= BOARD_SIZE && cell[1] >= -BOARD_SIZE && cell[1] <= BOARD_SIZE;
    if (free && inBoard) possibleMoves.push(`MOVE [${cell[0]}, ${cell[1]}]`)
  });

  // Compute which cell he can attack
  const possibleAttacks = agent.sight.filter(o => ((o.kind === 'agents' || o.kind === 'targets') && o.team !== agent.team)).map(
    o => `ATTACK [${o.position[0]}, ${o.position[1]}]`
  );

  console.log(possibleMoves, possibleAttacks)

  // Create state
  const state = {}
  state['Your Position'] = agent.position;
  state['Your Health'] = agent.life;
  state['Friends'] = agent.sight.filter(o => o.kind === 'agents' && o.team === agent.team).map(
    o => ({ position: o.position, health: o.life })
  );
  state['Enemies'] = agent.sight.filter(o => o.kind === 'agents' && o.team !== agent.team).map(
    o => ({ position: o.position, health: o.life })
  );
  state['Friend Target'] = agent.sight.filter(o => o.kind === 'targets' && o.team === agent.team).map(
    o => ({ position: o.position, health: o.life })
  )
  state['Enemy Target'] = agent.sight.filter(o => o.kind === 'targets' && o.team !== agent.team).map(
    o => ({ position: o.position, health: o.life })
  )
  state['Obstacles'] = agent.sight.filter(o => o.kind === 'obstacles').map(o => o.position);
  state['Turn'] = turn.current;
  state['Actions Left'] = NB_ACTIONS_PER_TURN - turn.actions;
  state['Possible Actions'] = [...possibleMoves, ...possibleAttacks];
  return state;
}


// Function called when key "A" is pressed, to play the AI
const playAI = async (turn, win, agents, targets, obstacles, setAgents, setBullets, animationRunning, animationQueue, setAnimationQueue, nextAction) => {

  // Prevent more than NB_ACTIONS_PER_TURN actions per turn
  if (turn.actions === NB_ACTIONS_PER_TURN || animationRunning || animationQueue.length !== 0 || win) {
      return null;
  }

  // Find current agent
  const currentAgent = agents.find(agent => agent.id === turn.agentId);
  console.log(getAgentState(currentAgent, turn))

  return

  // Update agent thinking 
  setAgents(agents.map(agent => {
    if (agent.id === currentAgent.id) {
      return {
        ...agent,
        thinking: true,
      }
    }
    return agent;
  }));
  
  // Send a POST request to the API with the current game state
  const response = await fetch('http://localhost:5000/play_one_turn', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ 
      state: getAgentState(currentAgent),
    })
  });
  
  // Parse the response JSON
  const { thoughts, action } = await response.json();

  // Update agent thinking 
  setAgents(agents.map(agent => {
    if (agent.id === currentAgent.id) {
      return {
        ...agent,
        thinking: false,
      }
    }
    return agent;
  }));

  console.log(thoughts, action);

  // Select corresponding action
  let animation = null;
  if (action.slice(0, 4) === 'MOVE') {
    const moveArgs = [turn, agents, targets, obstacles, setAgents];
    const actions = {
      'MOVE UP': () => handleMove('up', ...moveArgs),
      'MOVE DOWN': () => handleMove('down', ...moveArgs),
      'MOVE LEFT': () => handleMove('left', ...moveArgs),
      'MOVE RIGHT': () => handleMove('right', ...moveArgs),
    }
    animation = actions[action];
  } else if (action.slice(0, 6) === 'ATTACK') {
    const attackArgs = [turn, agents, setBullets];
    const position = action.slice(8, -1).split(', ').map(Number);
    animation = () => handleAttack(position, ...attackArgs);
  }

  // Add action to animation queue and start animation
  if (animation) {
    setAnimationQueue([...animationQueue, animation]);
    nextAction();
  }

};

export {
  playKeyboard,
  playAI,
}