"""
Game State module for BattleFieldAgents.
Manages the complete game state including agents, targets, obstacles, and turn order.
Handles game initialization, updates, and win condition checking.
"""

from constants import *
from agents import Agent, Target, Obstacle, BonusMalus
from actions import ActionQueue
from utils import compute_sight, compute_last_positions_seen, distance
import random


class GameState:
    """
    Central game state manager.
    Maintains all game entities, turn information, and game flow.
    """
    
    def __init__(self, nb_bonuses=NB_BONUS):
        """
        Initialize the game state.
        
        Args:
            nb_bonuses (int): Number of bonuses to generate (default from constants)
        """
        self.agents = []
        self.targets = []
        self.obstacles = []
        self.bonus_malus = []
        self.nb_bonuses = nb_bonuses
        
        self.turn = {
            'current': 1,
            'agent_id': None,
            'action_count': 0,
            'order': []
        }
        
        self.action_queue = ActionQueue()
        self.winner = None
        self.game_over = False
        self.notifications = []  # List of system messages to display
        
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
        self.bonus_malus = []
        self.winner = None
        self.game_over = False
        self.notifications = []
        
        # Create targets at opposite sides of the board
        red_target_pos = [-SPAWN_RANGE - 1, -SPAWN_RANGE -  1]
        blue_target_pos = [SPAWN_RANGE + 1, SPAWN_RANGE + 1]
        
        self.targets.append(Target('red', red_target_pos))
        self.targets.append(Target('blue', blue_target_pos))
        
        # Create obstacles first (so agents avoid them)
        self._generate_obstacles()
        
        # Generate bonus/malus
        self._generate_bonus_malus()

        # Generate symmetric spawn positions for agents
        red_spawn_positions, blue_spawn_positions = self._generate_symmetric_spawn_positions(
            red_target_pos, 
            NB_AGENTS_PER_TEAM
        )
        
        # Create red team agents
        for i, pos in enumerate(red_spawn_positions):
            agent = Agent(f'red_{i+1}', 'red', pos)
            self.agents.append(agent)
        
        # Create blue team agents
        for i, pos in enumerate(blue_spawn_positions):
            agent = Agent(f'blue_{i+1}', 'blue', pos)
            self.agents.append(agent)
        
        # Set up turn order (alternating teams)
        self._setup_turn_order()
        
        # Update initial sight for all agents
        self._update_all_sights()
    
    def _generate_symmetric_spawn_positions(self, red_target_pos, count):
        """
        Generate symmetric spawn positions around targets.
        
        Args:
            red_target_pos (list): Red target position [x, y]
            count (int): Number of positions to generate per team
        
        Returns:
            tuple: (red_positions, blue_positions)
        """
        red_positions = []
        blue_positions = []
        attempts = 0
        max_attempts = 100
        
        # Helper to check if a position is free (obstacles or targets)
        # Agents are not created yet so we only check internal collision
        def is_free(pos, current_positions):
            # Check occupied by other generated positions
            if pos in current_positions:
                return False
            
            # Check targets
            for target in self.targets:
                if target.position == pos:
                    return False
            
            # Check obstacles
            for obstacle in self.obstacles:
                if obstacle.position == pos:
                    return False
            
            return True

        while len(red_positions) < count and attempts < max_attempts:
            attempts += 1
            
            # Random offset within spawn range for Red
            dx = random.randint(-SPAWN_RANGE, SPAWN_RANGE)
            dy = random.randint(-SPAWN_RANGE, SPAWN_RANGE)
            
            pos_red = [red_target_pos[0] + dx, red_target_pos[1] + dy]
            
            # Calculate symmetric Blue position (central symmetry)
            pos_blue = [-pos_red[0], -pos_red[1]]
            
            # Check validity for both
            if (is_free(pos_red, red_positions) and 
                is_free(pos_blue, blue_positions) and 
                pos_red != pos_blue): # Prevent overlapping
                
                red_positions.append(pos_red)
                blue_positions.append(pos_blue)
        
        return red_positions, blue_positions
    
    def _generate_obstacles(self):
        """
        Generate random obstacles on the battlefield with central symmetry.
        The field is divided by the diagonal y = -x.
        """
        self.obstacles = []
        
        pairs_count = NB_OBSTACLES // 2
        has_center = NB_OBSTACLES % 2 == 1
        
        # Helper to check if a position is occupied
        def is_occupied(pos):
            for agent in self.agents:
                if agent.position == pos:
                    return True
            for target in self.targets:
                if target.position == pos:
                    return True
            for obstacle in self.obstacles:
                if obstacle.position == pos:
                    return True
            return False

        # 1. Place center obstacle if needed
        if has_center:
            center = [0, 0]
            if not is_occupied(center):
                self.obstacles.append(Obstacle(center))
        
        # 2. Generate pairs
        added_pairs = 0
        attempts = 0
        max_attempts = 1000  # Safety break
        
        while added_pairs < pairs_count and attempts < max_attempts:
            attempts += 1
            
            # Generate random position
            x = random.randint(-BOARD_SIZE, BOARD_SIZE)
            y = random.randint(-BOARD_SIZE, BOARD_SIZE)
            
            if y == -x:
                continue 
            
            if y > -x:
                x, y = -x, -y
            
            pos1 = [x, y]
            pos2 = [-x, -y]
            
            # Check if both positions are free
            if not is_occupied(pos1) and not is_occupied(pos2):
                self.obstacles.append(Obstacle(pos1))
                self.obstacles.append(Obstacle(pos2))
                added_pairs += 1

    def _generate_bonus_malus(self):
        """
        Generate random bonus/malus items on the battlefield with central symmetry.
        """
        self.bonus_malus = []
        
        pairs_count = self.nb_bonuses // 2
        
        # Helper to check if a position is occupied
        def is_occupied(pos):
            for agent in self.agents:
                if agent.position == pos:
                    return True
            for target in self.targets:
                if target.position == pos:
                    return True
            for obstacle in self.obstacles:
                if obstacle.position == pos:
                    return True
            for bonus in self.bonus_malus:
                if bonus.position == pos:
                    return True
            return False

        added_pairs = 0
        attempts = 0
        max_attempts = 1000
        
        while added_pairs < pairs_count and attempts < max_attempts:
            attempts += 1
            
            # Generate random position
            x = random.randint(-BOARD_SIZE, BOARD_SIZE)
            y = random.randint(-BOARD_SIZE, BOARD_SIZE)
            
            if y == -x:
                continue 
            
            if y > -x:
                x, y = -x, -y
            
            pos1 = [x, y]
            pos2 = [-x, -y]
            
            # Check if both positions are free
            if not is_occupied(pos1) and not is_occupied(pos2):
                bonus_type = random.choice(BONUS_TYPES)
                # Create symmetric bonuses (same type)
                self.bonus_malus.append(BonusMalus(pos1, bonus_type))
                self.bonus_malus.append(BonusMalus(pos2, bonus_type))
                added_pairs += 1

    def check_bonus_activation(self, agent):
        """
        Check if an agent triggered a bonus/malus.
        
        Args:
            agent (Agent): The agent that moved
        """
        self.trigger_bonus_at_position(agent.position, agent)

    def trigger_bonus_at_position(self, position, agent):
        """
        Check for and trigger a bonus at a specific position.
        
        Args:
            position (list): Position to check [x, y]
            agent (Agent): The agent triggering the bonus
        """
        for bonus in self.bonus_malus:
            if not bonus.triggered and bonus.position == position:
                self._apply_bonus_effect(agent, bonus)
                bonus.triggered = True
                self.bonus_malus.remove(bonus)
                return

    def _apply_bonus_effect(self, agent, bonus):
        """
        Apply the effect of a bonus/malus to the agent.
        
        Args:
            agent (Agent): The triggering agent
            bonus (BonusMalus): The bonus triggered
        """
        message_text = f"Turn {self.turn['current']}: {agent.id} triggered {bonus.type}"
        print(message_text)
        self.notifications.append(message_text)
        
        # Broadcast message to all agents
        for a in self.agents:
            if a.is_alive():
                a.add_message(self.turn['current'], "SYSTEM", bonus.position, message_text)
        
        if bonus.type == "HEAL":
            agent.heal(BONUS_HEAL_AMOUNT)
            
        elif bonus.type == "TRAP":
            agent.take_damage(BONUS_TRAP_DAMAGE)
            # Should trigger blink animation ideally, handled by renderer if damage taken?
            
        elif bonus.type == "VAMPIRE":
            # Life steal in range 3
            targets_hit = 0
            for enemy in self.agents:
                if enemy.team != agent.team and enemy.is_alive() and distance(agent.position, enemy.position) <= BONUS_VAMPIRE_RANGE:
                    enemy.take_damage(BONUS_VAMPIRE_DAMAGE)
                    targets_hit += 1
            
            for target in self.targets:
                if target.team != agent.team and target.is_alive() and distance(agent.position, target.position) <= BONUS_VAMPIRE_RANGE:
                    target.take_damage(BONUS_VAMPIRE_DAMAGE)
                    targets_hit += 1
            
            if targets_hit > 0:
                agent.heal(BONUS_VAMPIRE_DAMAGE * targets_hit)
                
        elif bonus.type == "GRENADE":
            # Damage all entities in range 3
            all_entities = self.agents + self.targets
            for entity in all_entities:
                if entity.is_alive() and distance(agent.position, entity.position) <= BONUS_GRENADE_RANGE:
                    entity.take_damage(BONUS_GRENADE_DAMAGE)
                    
        elif bonus.type == "SABOTAGE":
            # Damage enemy target
            for target in self.targets:
                if target.team != agent.team:
                    target.take_damage(BONUS_SABOTAGE_DAMAGE)

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
                agent.sight = compute_sight(agent, self.agents, self.targets, self.obstacles, self.bonus_malus)
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
        Get any entity (agent, target, obstacle, bonus) at a position.
        
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
        
        for bonus in self.bonus_malus:
            if bonus.position == position:
                return bonus
        
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
                next_agent.sight = compute_sight(next_agent, self.agents, self.targets, self.obstacles, self.bonus_malus)
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
