"""
Game State module for BattleFieldAgents.
Manages the complete game state including agents, targets, obstacles, and turn order.
Handles game initialization, updates, and win condition checking.
"""

from constants import *
from agents import Agent, Target, Obstacle
from actions import ActionQueue
from utils import compute_sight, compute_last_positions_seen
import random


class GameState:
    """
    Central game state manager.
    Maintains all game entities, turn information, and game flow.
    """
    
    def __init__(self):
        """Initialize the game state."""
        self.agents = []
        self.targets = []
        self.obstacles = []
        
        self.turn = {
            'current': 1,
            'agent_id': None,
            'action_count': 0,
            'order': []
        }
        
        self.action_queue = ActionQueue()
        self.winner = None
        self.game_over = False
        
        # Initialize game
        self.initialize_game()
    
    def initialize_game(self):
        """
        Initialize a new game with agents, targets, and obstacles.
        """
        # Reset state
        self.agents = []
        self.targets = []
        self.obstacles = []
        self.winner = None
        self.game_over = False
        
        # Create targets at opposite sides of the board
        red_target_pos = [-SPAWN_RANGE - 1, -SPAWN_RANGE -  1]
        blue_target_pos = [SPAWN_RANGE + 1, SPAWN_RANGE + 1]
        
        self.targets.append(Target('red', red_target_pos))
        self.targets.append(Target('blue', blue_target_pos))
        
        # Create agents around their targets
        red_spawn_positions = self._generate_spawn_positions(red_target_pos, NB_AGENTS_PER_TEAM)
        blue_spawn_positions = self._generate_spawn_positions(blue_target_pos, NB_AGENTS_PER_TEAM)
        
        # Create red team agents
        for i, pos in enumerate(red_spawn_positions):
            agent = Agent(f'red_{i+1}', 'red', pos)
            self.agents.append(agent)
        
        # Create blue team agents
        for i, pos in enumerate(blue_spawn_positions):
            agent = Agent(f'blue_{i+1}', 'blue', pos)
            self.agents.append(agent)
        
        # Create obstacles
        self._generate_obstacles()
        
        # Set up turn order (alternating teams)
        self._setup_turn_order()
        
        # Update initial sight for all agents
        self._update_all_sights()
    
    def _generate_spawn_positions(self, target_pos, count):
        """
        Generate spawn positions around a target.
        
        Args:
            target_pos (list): Target position [x, y]
            count (int): Number of positions to generate
        
        Returns:
            list: List of spawn positions
        """
        positions = []
        attempts = 0
        max_attempts = 100
        
        while len(positions) < count and attempts < max_attempts:
            attempts += 1
            
            # Random offset within spawn range
            dx = random.randint(-SPAWN_RANGE, SPAWN_RANGE)
            dy = random.randint(-SPAWN_RANGE, SPAWN_RANGE)
            
            pos = [target_pos[0] + dx, target_pos[1] + dy]
            
            # Check if position is valid and not occupied
            if pos not in positions and pos != target_pos:
                positions.append(pos)
        
        return positions
    
    def _generate_obstacles(self):
        """Generate random obstacles on the battlefield."""
        for _ in range(NB_OBSTACLES):
            attempts = 0
            max_attempts = 100
            
            while attempts < max_attempts:
                attempts += 1
                
                # Random position
                x = random.randint(-BOARD_SIZE + 1, BOARD_SIZE - 1)
                y = random.randint(-BOARD_SIZE + 1, BOARD_SIZE - 1)
                pos = [x, y]
                
                # Check if position is free
                occupied = False
                
                for agent in self.agents:
                    if agent.position == pos:
                        occupied = True
                        break
                
                for target in self.targets:
                    if target.position == pos:
                        occupied = True
                        break
                
                for obstacle in self.obstacles:
                    if obstacle.position == pos:
                        occupied = True
                        break
                
                if not occupied:
                    self.obstacles.append(Obstacle(pos))
                    break
    
    def _setup_turn_order(self):
        """Set up the turn order, alternating between teams."""
        red_agents = [a.id for a in self.agents if a.team == 'red']
        blue_agents = [a.id for a in self.agents if a.team == 'blue']
        
        order = []
        for i in range(max(len(red_agents), len(blue_agents))):
            if i < len(red_agents):
                order.append(red_agents[i])
            if i < len(blue_agents):
                order.append(blue_agents[i])
        
        self.turn['order'] = order
        self.turn['agent_id'] = order[0] if order else None
        self.turn['current'] = 1
        self.turn['action_count'] = 0
    
    def _update_all_sights(self):
        """Update sight information for all agents."""
        for agent in self.agents:
            if agent.is_alive():
                agent.sight = compute_sight(agent, self.agents, self.targets, self.obstacles)
                agent.last_pos_seen = compute_last_positions_seen(agent, self.turn['current'])
    
    def get_agent_by_id(self, agent_id):
        """
        Get an agent by ID.
        
        Args:
            agent_id (str): Agent ID
        
        Returns:
            Agent: The agent, or None if not found
        """
        for agent in self.agents:
            if agent.id == agent_id:
                return agent
        return None
    
    def get_current_agent(self):
        """
        Get the agent whose turn it is.
        
        Returns:
            Agent: Current agent or None
        """
        return self.get_agent_by_id(self.turn['agent_id'])
    
    def get_entity_at_position(self, position):
        """
        Get any entity (agent, target, obstacle) at a position.
        
        Args:
            position (list): Position [x, y]
        
        Returns:
            Entity at position or None
        """
        for agent in self.agents:
            if agent.position == position and agent.is_alive():
                return agent
        
        for target in self.targets:
            if target.position == position and target.is_alive():
                return target
        
        for obstacle in self.obstacles:
            if obstacle.position == position:
                return obstacle
        
        return None
    
    def next_action(self):
        """
        Move to the next action in the current turn.
        If all actions are used, move to next agent's turn.
        """
        self.turn['action_count'] += 1
        
        if self.turn['action_count'] >= NB_ACTIONS_PER_TURN:
            self.next_turn()
    
    def next_turn(self):
        """Move to the next agent's turn."""
        # Reset action count
        self.turn['action_count'] = 0
        
        # Find next alive agent
        current_index = self.turn['order'].index(self.turn['agent_id'])
        
        for i in range(1, len(self.turn['order']) + 1):
            next_index = (current_index + i) % len(self.turn['order'])
            next_agent_id = self.turn['order'][next_index]
            next_agent = self.get_agent_by_id(next_agent_id)
            
            if next_agent and next_agent.is_alive():
                self.turn['agent_id'] = next_agent_id
                
                # Increment turn number if we've completed a full cycle
                if next_index <= current_index:
                    self.turn['current'] += 1
                
                # Update sight for new current agent
                next_agent.sight = compute_sight(next_agent, self.agents, self.targets, self.obstacles)
                next_agent.last_pos_seen = compute_last_positions_seen(next_agent, self.turn['current'])
                
                return
        
        # No alive agents found - game over
        self.check_win_condition()
    
    def check_win_condition(self):
        """
        Check if the game has been won by either team.
        Updates self.winner and self.game_over.
        
        Returns:
            str: Winner team name or None
        """
        # Check if all agents of a team are dead
        red_alive = any(a.is_alive() for a in self.agents if a.team == 'red')
        blue_alive = any(a.is_alive() for a in self.agents if a.team == 'blue')
        
        # Check if targets are destroyed
        red_target_alive = any(t.is_alive() for t in self.targets if t.team == 'red')
        blue_target_alive = any(t.is_alive() for t in self.targets if t.team == 'blue')
        
        # Determine winner
        if not red_alive or not red_target_alive:
            self.winner = 'blue'
            self.game_over = True
        elif not blue_alive or not blue_target_alive:
            self.winner = 'red'
            self.game_over = True
        
        return self.winner
    
    def reset_game(self):
        """Reset the game to initial state."""
        self.initialize_game()
    
    def get_game_info(self):
        """
        Get game information summary.
        
        Returns:
            dict: Game information
        """
        return {
            'turn': self.turn['current'],
            'current_agent': self.turn['agent_id'],
            'action_count': self.turn['action_count'],
            'red_agents_alive': sum(1 for a in self.agents if a.team == 'red' and a.is_alive()),
            'blue_agents_alive': sum(1 for a in self.agents if a.team == 'blue' and a.is_alive()),
            'red_target_alive': any(t.is_alive() for t in self.targets if t.team == 'red'),
            'blue_target_alive': any(t.is_alive() for t in self.targets if t.team == 'blue'),
            'winner': self.winner,
            'game_over': self.game_over
        }
