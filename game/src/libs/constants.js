// Bullets
const BULLET_TRANSLATE_Y = -0.2;
const BULLET_RADIUS = 0.1;
const BULLET_SPEED = 0.2;
const BULLET_DAMAGE = 25;

// Agents
const AGENT_TRANSLATE_Y = -0.2;
const AGENT_RADIUS = 0.3;
const AGENT_SPEED = 0.1;
const AGENT_TOP_HEIGHT = 0.05; // BE CAREFUL TO ADJUST THIS VALUE IN FUNCTION OF THE SPEED
const AGENT_LIFE = 100;
const AGENT_BUBBLE_TRANSLATE_Y = 1;
const NB_AGENTS_PER_TEAM = 5;

// Targets
const TARGET_TRANSLATE_Y = 0;
const TARGET_LIFE = 200;

// Board
const BOARD_SIZE = 10;
const BOARD_TRANSLATE_Y = -1;

// Obstacles
const OBSTACLE_TRANSLATE_Y = 0;
const NB_OBSTACLES = 50;

// Others
const PRECISION = 3;  // Number of decimal places for position coordinates
const SPAWN_RANGE = 3;  // Range of cells around the target where the agents can spawn
const COLOR_RED = '#aa4444';
const COLOR_BLUE = '#444499';
const COLOR_BG_PANEL = '#222222';
const COLOR_BG_ITEM = '#3a3a3a';
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
  NB_AGENTS_PER_TEAM,

  TARGET_TRANSLATE_Y,
  TARGET_LIFE,

  BOARD_SIZE,
  BOARD_TRANSLATE_Y,

  OBSTACLE_TRANSLATE_Y,
  NB_OBSTACLES,

  PRECISION,
  SPAWN_RANGE,
  COLOR_RED,
  COLOR_BLUE,
  COLOR_BG_PANEL,
  COLOR_BG_ITEM,
  COLOR_FONT,
}