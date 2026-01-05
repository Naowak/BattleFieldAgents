"""
Actions module for BattleFieldAgents game.
Handles all game actions: MOVE, ATTACK, and SPEAK.
Manages action execution and animation triggering.
"""

from constants import *
from agents import Agent, Target
from utils import astar_pathfinding
import time


class Action:
    """
    Base class for all actions in the game.
    Each action has a type, parameters, and animation properties.
    """
    
    def __init__(self, action_type, agent_id, params=None):
        """
        Initialize an action.
        
        Args:
            action_type (str): Type of action ('MOVE', 'ATTACK', 'SPEAK')
            agent_id (str): ID of the agent performing the action
            params (dict): Additional parameters for the action
        """
        self.action_type = action_type
        self.agent_id = agent_id
        self.params = params or {}
        self.is_complete = False
        self.animation_progress = 0.0
        self.start_time = None
    
    def start(self):
        """Start the action."""
        self.start_time = time.time()
        self.is_complete = False
        self.animation_progress = 0.0
    
    def update(self, dt):
        """
        Update action progress.
        
        Args:
            dt (float): Delta time in seconds
        """
        pass
    
    def execute(self, game_state):
        """
        Execute the action's effects on game state.
        
        Args:
            game_state: The game state object
        """
        pass


class MoveAction(Action):
    """
    Movement action - moves an agent along a path.
    Animation: Agent moves smoothly along the calculated path.
    Duration: 0.75 seconds per cell.
    """
    
    def __init__(self, agent_id, target_position, path):
        """
        Initialize a move action.
        
        Args:
            agent_id (str): ID of the moving agent
            target_position (list): Target [x, y] position
            path (list): List of positions forming the path
        """
        super().__init__('MOVE', agent_id, {
            'target_position': target_position,
            'path': path
        })
        self.current_cell_index = 0
        self.cell_progress = 0.0
        self.total_duration = len(path) * ANIMATION_MOVE_DURATION_PER_CELL
    
    def start(self):
        """Start the move action."""
        super().start()
        self.current_cell_index = 0
        self.cell_progress = 0.0
    
    def update(self, dt):
        """
        Update movement animation.
        
        Args:
            dt (float): Delta time in seconds
        """
        if self.is_complete:
            return
        
        path = self.params['path']
        
        # Update progress for current cell
        self.cell_progress += dt / ANIMATION_MOVE_DURATION_PER_CELL
        
        # Move to next cell if current cell is complete
        if self.cell_progress >= 1.0:
            self.cell_progress = 0.0
            self.current_cell_index += 1
            
            # Check if entire path is complete
            if self.current_cell_index >= len(path):
                self.is_complete = True
                self.animation_progress = 1.0
                return
        
        # Calculate overall progress
        self.animation_progress = (self.current_cell_index + self.cell_progress) / len(path)
    
    def get_current_position(self, agent):
        """
        Get the agent's current interpolated position during animation.
        
        Args:
            agent (Agent): The agent being moved
        
        Returns:
            list: Current [x, y] position
        """
        if self.is_complete:
            return self.params['target_position']
        
        path = self.params['path']
        
        if self.current_cell_index >= len(path):
            return self.params['target_position']
        
        # Get start and end positions for current segment
        if self.current_cell_index == 0:
            start_pos = agent.position
        else:
            start_pos = path[self.current_cell_index - 1]
        
        end_pos = path[self.current_cell_index]
        
        # Linear interpolation
        x = start_pos[0] + (end_pos[0] - start_pos[0]) * self.cell_progress
        y = start_pos[1] + (end_pos[1] - start_pos[1]) * self.cell_progress
        
        return [x, y]
    
    def execute(self, game_state):
        """
        Execute the move action - update agent position.
        
        Args:
            game_state: The game state object
        """
        agent = game_state.get_agent_by_id(self.agent_id)
        if agent:
            agent.position = self.params['target_position'].copy()
            agent.stats['moves_count'] += 1


class AttackAction(Action):
    """
    Attack action - deals damage to a target.
    Animation: Target blinks 3 times over 2 seconds.
    Duration: 2 seconds total.
    """
    
    def __init__(self, agent_id, target_position):
        """
        Initialize an attack action.
        
        Args:
            agent_id (str): ID of the attacking agent
            target_position (list): Position [x, y] being attacked
        """
        super().__init__('ATTACK', agent_id, {
            'target_position': target_position
        })
        self.blink_state = False
        self.blink_count = 0
        self.last_blink_time = 0
        self.blink_interval = ANIMATION_ATTACK_DURATION / (ANIMATION_ATTACK_BLINKS * 2)
    
    def start(self):
        """Start the attack action."""
        super().start()
        self.blink_state = False
        self.blink_count = 0
        self.last_blink_time = 0
    
    def update(self, dt):
        """
        Update attack animation (blinking).
        
        Args:
            dt (float): Delta time in seconds
        """
        if self.is_complete:
            return
        
        elapsed = time.time() - self.start_time
        
        # Check if animation is complete
        if elapsed >= ANIMATION_ATTACK_DURATION:
            self.is_complete = True
            self.animation_progress = 1.0
            return
        
        # Update blink state
        self.last_blink_time += dt
        if self.last_blink_time >= self.blink_interval:
            self.last_blink_time = 0
            self.blink_state = not self.blink_state
            if self.blink_state:
                self.blink_count += 1
        
        self.animation_progress = elapsed / ANIMATION_ATTACK_DURATION
    
    def should_render_target(self):
        """
        Check if target should be rendered (for blinking effect).
        
        Returns:
            bool: True if target should be visible
        """
        return not self.blink_state
    
    def execute(self, game_state):
        """
        Execute the attack action - deal damage to target.
        
        Args:
            game_state: The game state object
        """
        target_pos = self.params['target_position']
        agent = game_state.get_agent_by_id(self.agent_id)
        
        if not agent:
            return
        
        # Find target at position (could be agent or target)
        target = game_state.get_entity_at_position(target_pos)
        
        if target and hasattr(target, 'take_damage'):
            target.take_damage(ATTACK_DAMAGE)
            agent.stats['shots_fired'] += 1
            agent.stats['damage_dealt'] += ATTACK_DAMAGE


class SpeakAction(Action):
    """
    Speak action - sends a message to another agent.
    Animation: Both agents surrounded by yellow for 2 seconds.
    Duration: 2 seconds.
    """
    
    def __init__(self, agent_id, target_position, message):
        """
        Initialize a speak action.
        
        Args:
            agent_id (str): ID of the speaking agent
            target_position (list): Position [x, y] of the recipient
            message (str): Message content
        """
        super().__init__('SPEAK', agent_id, {
            'target_position': target_position,
            'message': message
        })
    
    def start(self):
        """Start the speak action."""
        super().start()
    
    def update(self, dt):
        """
        Update speak animation.
        
        Args:
            dt (float): Delta time in seconds
        """
        if self.is_complete:
            return
        
        elapsed = time.time() - self.start_time
        
        if elapsed >= ANIMATION_SPEAK_DURATION:
            self.is_complete = True
            self.animation_progress = 1.0
        else:
            self.animation_progress = elapsed / ANIMATION_SPEAK_DURATION
    
    def execute(self, game_state):
        """
        Execute the speak action - deliver message to target agent.
        
        Args:
            game_state: The game state object
        """
        agent = game_state.get_agent_by_id(self.agent_id)
        target_agent = game_state.get_entity_at_position(self.params['target_position'])
        
        if agent and target_agent and isinstance(target_agent, Agent):
            target_agent.add_message(
                game_state.turn['current'],
                agent.id,
                agent.position,
                self.params['message']
            )
            agent.stats['speaks_count'] += 1


def parse_action_string(action_string, agent_id, game_state):
    """
    Parse an action string from the AI and create an Action object.
    
    Args:
        action_string (str): Action string like "MOVE [3, 5]" or "SPEAK [1, 2] Hello!"
        agent_id (str): ID of the agent performing the action
        game_state: The game state object
    
    Returns:
        Action: The created action object, or None if parsing fails
    """
    import re
    
    action_string = action_string.strip()
    
    # Parse MOVE action: "MOVE [x, y]"
    move_match = re.match(r'MOVE\s*\[(-?\d+),\s*(-?\d+)\]', action_string)
    if move_match:
        x, y = int(move_match.group(1)), int(move_match.group(2))
        target_position = [x, y]
        
        # Check if target position is occupied
        if game_state.get_entity_at_position(target_position):
            return None
        
        agent = game_state.get_agent_by_id(agent_id)
        if not agent:
            return None
        
        # Calculate path using A*
        path = astar_pathfinding(
            agent.position,
            target_position,
            game_state.agents,
            game_state.targets,
            game_state.obstacles
        )
        
        if not path:
            return None
        
        return MoveAction(agent_id, target_position, path)
    
    # Parse ATTACK action: "ATTACK [x, y]"
    attack_match = re.match(r'ATTACK\s*\[(-?\d+),\s*(-?\d+)\]', action_string)
    if attack_match:
        x, y = int(attack_match.group(1)), int(attack_match.group(2))
        target_position = [x, y]
        return AttackAction(agent_id, target_position)
    
    # Parse SPEAK action: "SPEAK [x, y] message"
    speak_match = re.match(r'SPEAK\s*\[(-?\d+),\s*(-?\d+)\]\s*(.+)', action_string)
    if speak_match:
        x, y = int(speak_match.group(1)), int(speak_match.group(2))
        message = speak_match.group(3).strip()
        target_position = [x, y]
        return SpeakAction(agent_id, target_position, message)
    
    # No valid action found
    return None


class ActionQueue:
    """
    Manages a queue of actions to be executed sequentially.
    Ensures animations complete before starting the next action.
    """
    
    def __init__(self):
        """Initialize the action queue."""
        self.queue = []
        self.current_action = None
    
    def add_action(self, action):
        """
        Add an action to the queue.
        
        Args:
            action (Action): Action to add
        """
        self.queue.append(action)
    
    def update(self, dt, game_state):
        """
        Update the current action.
        
        Args:
            dt (float): Delta time in seconds
            game_state: The game state object
        """
        # Start next action if no current action
        if self.current_action is None:
            if self.queue:
                self.current_action = self.queue.pop(0)
                self.current_action.start()
            return
        
        # Update current action
        self.current_action.update(dt)
        
        # Check if current action is complete
        if self.current_action.is_complete:
            # Execute the action's effect on the game state
            self.current_action.execute(game_state)
            
            # Update sight for the agent that just acted
            from utils import compute_sight, compute_last_positions_seen
            acting_agent = game_state.get_agent_by_id(self.current_action.agent_id)
            if acting_agent and acting_agent.is_alive():
                acting_agent.sight = compute_sight(acting_agent, game_state.agents, game_state.targets, game_state.obstacles)
                acting_agent.last_pos_seen = compute_last_positions_seen(acting_agent, game_state.turn['current'])

            self.current_action = None
    
    def is_busy(self):
        """
        Check if the queue is currently processing an action.
        
        Returns:
            bool: True if an action is currently executing
        """
        return self.current_action is not None
    
    def has_pending_actions(self):
        """
        Check if there are actions waiting in the queue.
        
        Returns:
            bool: True if actions are queued
        """
        return len(self.queue) > 0
    
    def clear(self):
        """Clear all actions from the queue."""
        self.queue.clear()
        self.current_action = None
    
    def get_current_action(self):
        """
        Get the currently executing action.
        
        Returns:
            Action: Current action or None
        """
        return self.current_action
