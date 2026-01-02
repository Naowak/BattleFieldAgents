# BattleFieldAgents - Pygame 2D Version 🎮

A 2D visualization of the BattleFieldAgents game using Pygame. Watch AI agents battle on a grid-based battlefield with smooth animations and a polished UI.

## Features ✨

- **2D Grid Visualization**: Clean, grid-based battlefield with agents, targets, and obstacles
- **Smooth Animations**: 
  - Movement animations (0.75s per cell)
  - Attack animations (blinking effect)
  - Speak animations (yellow highlight)
- **Interactive UI**:
  - Left panel: Agent status cards with HP bars and stats
  - Right panel: AI thought bubbles showing reasoning
  - Hover tooltips for detailed information
- **Game Controls**:
  - Pause/Resume gameplay
  - Manual step-through for analysis
  - Restart game anytime
- **AI Integration**: Connects to OpenAI API or uses mock AI for testing

## Installation 📦

### Prerequisites
- Python 3.8+
- pip

### Setup

```bash
# Navigate to the pygame version directory
cd pygame_version

# Install dependencies
pip install -r requirements.txt
```

## Usage 🚀

### Running with Mock AI (No API Required)

Perfect for testing and development:

```bash
python main.py --mock-ai
```

The mock AI uses simple rule-based decisions:
- Attacks enemies when visible
- Moves towards enemy targets
- Communicates with teammates

### Running with OpenAI API

For real AI-controlled agents:

```bash
# Make sure your API is running (from project root)
cd api
python main.py

# In another terminal, run the pygame version
cd pygame_version
python main.py
```

The game will connect to the API at `http://localhost:5000/play_one_turn`.

## Controls 🎮

| Key | Action |
|-----|--------|
| **SPACE** | Pause/Resume game |
| **R** | Restart game |
| **N** | Next action (manual step) |
| **ESC** | Quit game |
| **Mouse Hover** | Show agent stats tooltip |

## Configuration ⚙️

Edit `constants.py` to customize the game:

### Game Settings
```python
NB_AGENTS_PER_TEAM = 3      # Number of agents per team
NB_ACTIONS_PER_TURN = 3     # Actions per agent per turn
BOARD_SIZE = 10             # Grid size (-10 to +10)
NB_OBSTACLES = 15           # Number of obstacles
```

### Visual Settings
```python
WINDOW_WIDTH = 1600         # Window width
WINDOW_HEIGHT = 900         # Window height
CELL_SIZE = 40              # Size of each grid cell
FPS = 60                    # Frame rate
```

## Architecture 🏗️

```
pygame_version/
├── main.py              # Game loop and entry point
├── constants.py         # Configuration and constants
├── game_state.py        # Game state management
├── agents.py            # Agent, Target, Obstacle classes
├── actions.py           # Action system (Move, Attack, Speak)
├── renderer.py          # Game rendering (grid, entities)
├── ui_components.py     # UI panels and widgets
├── utils.py             # Pathfinding and utilities
├── ai_interface.py      # AI API communication
├── animations.py        # Animation system (particles, tweens)
└── requirements.txt     # Python dependencies
```

## Troubleshooting 🔧

### Game won't start
- Check that pygame is installed: `pip install pygame`
- Verify Python version: `python --version` (should be 3.8+)

### API connection errors
- Ensure the Flask API is running on port 5000
- Check `constants.py` has correct `API_URL`
- Try mock AI mode: `python main.py --mock-ai`

---

**Enjoy watching AI agents battle!** 🤖⚔️🤖