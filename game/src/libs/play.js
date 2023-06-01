import { NB_ACTIONS_PER_TURN } from './constants';
import { handleMove, handleAttack } from './actions';
import { sightToText } from './sight';

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


const playAI = async (turn, win, agents, targets, obstacles, setAgents, setBullets, animationRunning, animationQueue, setAnimationQueue, nextAction) => {

  // Prevent more than NB_ACTIONS_PER_TURN actions per turn
  if (turn.actions !== 0 || animationRunning || animationQueue.length !== 0) {
      return null;
  }

  
  // Find current agent
  const currentAgent = agents.find(agent => agent.id === turn.agentId);
  const currentSight = sightToText(currentAgent);

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
      state: `Position: [${currentAgent.position[0]}, ${currentAgent.position[1]}]\n${currentSight}`,
    })
  });
  
  // Parse the response JSON
  const { toughts, actions } = await response.json();

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

  console.log(toughts, actions);
  return null;

  actions.forEach(action => {

    // Prevent more than NB_ACTIONS_PER_TURN actions per turn
    if (turn.actions === NB_ACTIONS_PER_TURN) return;
    // Prevent actions if game is over
    if (win) return;

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
      const position = action.slice(7, -1).split(',').map(Number);
      animation = () => handleAttack(position, ...attackArgs);
    }

    // Add action to animation queue and start animation
    if (animation) {
      setAnimationQueue([...animationQueue, animation]);
      nextAction();
    }

  });
};

export {
  playKeyboard,
  playAI,
}