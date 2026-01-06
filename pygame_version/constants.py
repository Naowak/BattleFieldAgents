"""
Constants for the BattleFieldAgents Pygame version.
All game parameters can be easily modified here.
"""

# ============================================================================
# WINDOW & DISPLAY
# ============================================================================
WINDOW_WIDTH = 1300
WINDOW_HEIGHT = 800
FPS = 60

# UI Layout
LEFT_PANEL_WIDTH = 300
RIGHT_PANEL_WIDTH = 400
GRID_AREA_WIDTH = WINDOW_WIDTH - LEFT_PANEL_WIDTH - RIGHT_PANEL_WIDTH

# ============================================================================
# COLORS
# ============================================================================
# Background
COLOR_BG = (17, 17, 17)
COLOR_PANEL_BG = (34, 34, 34)

# Grid cells
COLOR_CELL_1 = (153, 153, 153)
COLOR_CELL_2 = (187, 187, 187)
COLOR_CELL_BORDER = (147, 147, 147)
COLOR_OBSTACLE = (40, 40, 40)
COLOR_OBSTACLE_PATTERN = (60, 60, 60)

# Teams
COLOR_TEAM_RED = (170, 68, 68)
COLOR_TEAM_RED_LIGHT = (187, 102, 102)
COLOR_TEAM_BLUE = (68, 68, 153)
COLOR_TEAM_BLUE_LIGHT = (102, 102, 187)

# Highlights
COLOR_HIGHLIGHT_YELLOW = (255, 220, 100)
COLOR_HIGHLIGHT_ATTACK = (255, 100, 100)

# UI Elements
COLOR_TEXT = (255, 255, 255)
COLOR_TEXT_SECONDARY = (180, 180, 180)
COLOR_HP_BAR_BG = (60, 60, 60)
COLOR_HP_BAR_GREEN = (100, 200, 100)
COLOR_HP_BAR_YELLOW = (200, 200, 100)
COLOR_HP_BAR_RED = (200, 100, 100)

# Thought bubbles
COLOR_BUBBLE_BG_RED = (170, 68, 68, 180)
COLOR_BUBBLE_BG_BLUE = (68, 68, 153, 180)
COLOR_BUBBLE_BORDER = (187, 187, 187)

# ============================================================================
# GAME BOARD
# ============================================================================
BOARD_SIZE = 6  # Grid is (2*BOARD_SIZE + 1) x (2*BOARD_SIZE + 1)
CELL_SIZE = 43   # Size of each cell in pixels
GRID_PADDING = 0  # Padding around the grid

# ============================================================================
# GAME MECHANICS
# ============================================================================
NB_AGENTS_PER_TEAM = 3
NB_ACTIONS_PER_TURN = 3
AGENT_MOVE_RANGE = 3

# Combat
TARGET_LIFE = 150
AGENT_LIFE = 100
ATTACK_DAMAGE = 25
SIGHT_RANGE = 99  # Vision range (currently unlimited)

# Spawning
SPAWN_RANGE = 2  # Range around target where agents spawn

# Obstacles
NB_OBSTACLES = 41
OBSTACLE_SIZE = 1  # Size in cells

# Bonus/Malus
NB_BONUS = 10  # Total bonuses (symmetric pairs)
COLOR_BONUS = (150, 200, 150)
BONUS_TYPES = ["HEAL", "TRAP", "VAMPIRE", "GRENADE", "SABOTAGE"]
BONUS_HEAL_AMOUNT = 50
BONUS_TRAP_DAMAGE = 25
BONUS_VAMPIRE_RANGE = 3
BONUS_VAMPIRE_DAMAGE = 15
BONUS_GRENADE_RANGE = 3
BONUS_GRENADE_DAMAGE = 20
BONUS_SABOTAGE_DAMAGE = 25

# ============================================================================
# ANIMATIONS
# ============================================================================
ANIMATION_MOVE_DURATION_PER_CELL = 0.75  # seconds per cell
ANIMATION_ATTACK_DURATION = 2.0  # seconds
ANIMATION_ATTACK_BLINKS = 3  # number of blinks
ANIMATION_SPEAK_DURATION = 2.0  # seconds

# ============================================================================
# RENDERING
# ============================================================================
# Agent rendering
AGENT_RADIUS = 18  # pixels
TARGET_SIZE = 18   # pixels (diamond shape)

# UI Elements
PANEL_PADDING = 15
AGENT_CARD_HEIGHT = 80
AGENT_CARD_MARGIN = 10

BUBBLE_WIDTH = 350
BUBBLE_PADDING = 10
BUBBLE_MARGIN = 10
BUBBLE_MAX_HEIGHT = 150

# Fonts
FONT_SIZE_TITLE = 24
FONT_SIZE_NORMAL = 16
FONT_SIZE_SMALL = 14

# ============================================================================
# AI/API
# ============================================================================
API_URL = "http://127.0.0.1:5000/play_one_turn"
API_TIMEOUT = 15.0  # seconds

# ============================================================================
# DEBUG
# ============================================================================
DEBUG_MODE = False
SHOW_COORDINATES = True
SHOW_STATS = True

# Debug colors for grid overlays
COLOR_DEBUG_POSSIBLE_MOVES = (100, 150, 255, 150)  # Light blue, semi-transparent
COLOR_DEBUG_AGENT_POSITION = (255, 220, 100, 150) # Yellow, semi-transparent
COLOR_DEBUG_AGENT_VISION = (200, 100, 200, 100)  # Purple, semi-transparent
