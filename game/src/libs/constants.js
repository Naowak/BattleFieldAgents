// Bullets
const BULLET_TRANSLATE_Y = -0.2;
const BULLET_RADIUS = 0.1;
const BULLET_SPEED = 0.2;
const BULLET_DAMAGE = 25;

// Agents
const AGENT_TRANSLATE_Y = -0.05;
const AGENT_RADIUS = 0.3;
const AGENT_SPEED = 0.1;
const AGENT_TOP_HEIGHT = 0.2; // BE CAREFUL TO ADJUST THIS VALUE IN FUNCTION OF THE SPEED
const AGENT_LIFE = 100;
const AGENT_BUBBLE_TRANSLATE_Y = 1;

// Targets
const TARGET_TRANSLATE_Y = -0.1;
const TARGET_LIFE = 200;
const TARGET_RADIUS = 0.3;
const TARGET_BUBBLE_TRANSLATE_Y = 1;

// Board
const BOARD_SIZE = 10;
const BOARD_TRANSLATE_Y = -1;

// Obstacles
const OBSTACLE_TRANSLATE_Y = 0;
const NB_OBSTACLES = 50;

// Others
const NB_AGENTS_PER_TEAM = 5;
const NB_ACTIONS_PER_TURN = 4;
const PRECISION = 3;  // Number of decimal places for position coordinates
const SPAWN_RANGE = 3;  // Range of cells around the target where the agents can spawn

const COLOR_CELL_1 = '#AA9999';
const COLOR_CELL_2 = '#CCBBBB';
const COLOR_CELL_BORDER = '#a39393';
const COLOR_RED = '#aa4444';
const COLOR_BLUE = '#444499';
const COLOR_OBSTACLE = '#7a6a6a';
const COLOR_OBSTACLE_BORDER = '#706060';
const COLOR_BG_GAME = '#111111';
const COLOR_BG_PANEL = '#222222';
const COLOR_BUBBLE_AGENT = '#3a3a3a';
const COLOR_BUBBLE_BORDER = '#bbbbbb';
const COLOR_FONT = '#ffffff';

export {
  BULLET_TRANSLATE_Y,
  BULLET_RADIUS,
  BULLET_SPEED,
  BULLET_DAMAGE,

  AGENT_TRANSLATE_Y,
  AGENT_RADIUS,
  AGENT_SPEED,
  AGENT_TOP_HEIGHT,
  AGENT_LIFE,
  AGENT_BUBBLE_TRANSLATE_Y,
  
  TARGET_TRANSLATE_Y,
  TARGET_LIFE,
  TARGET_RADIUS,
  TARGET_BUBBLE_TRANSLATE_Y,
  
  BOARD_SIZE,
  BOARD_TRANSLATE_Y,
  
  OBSTACLE_TRANSLATE_Y,
  NB_OBSTACLES,
  
  NB_AGENTS_PER_TEAM,
  NB_ACTIONS_PER_TURN,
  PRECISION,
  SPAWN_RANGE,

  COLOR_CELL_1,
  COLOR_CELL_2,
  COLOR_CELL_BORDER,
  COLOR_RED,
  COLOR_BLUE,
  COLOR_OBSTACLE,
  COLOR_OBSTACLE_BORDER,
  COLOR_BG_GAME,
  COLOR_BG_PANEL,
  COLOR_BUBBLE_AGENT,
  COLOR_BUBBLE_BORDER,
  COLOR_FONT,
}