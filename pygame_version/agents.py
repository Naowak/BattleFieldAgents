"""
Agent class for the BattleFieldAgents game.
Represents a player-controlled or AI-controlled agent on the battlefield.
"""

from constants import *
import random


class Agent:
    """
    Represents an agent (player) in the game.
    
    Attributes:
        id (str): Unique identifier for the agent
        team (str): Team name ('red' or 'blue')
        position (list): Current [x, y] position on the grid
        life (int): Current health points
        sight (list): List of visible entities
        messages (list): Messages received from teammates
        historic (list): History of thoughts and actions
        last_pos_seen (dict): Last known positions of enemies
        stats (dict): Statistics (shots_fired, speaks_count, moves_count)
    """
    
    def __init__(self, agent_id, team, position):
        """
        Initialize an agent.
        
        Args:
            agent_id (str): Unique identifier
            team (str): Team name ('red' or 'blue')
            position (list): Starting [x, y] position
        """
        self.id = agent_id
        self.team = team
        self.position = position.copy()
        self.life = AGENT_LIFE
        self.kind = 'agents'
        
        # Vision and communication
        self.sight = []
        self.messages = []
        self.historic = []
        self.last_pos_seen = {}
        
        # For animations
        self.target_position = None
        self.path = []
        self.animation_progress = 0.0
        
        # Statistics
        self.stats = {
            'shots_fired': 0,
            'speaks_count': 0,
            'moves_count': 0,
            'damage_dealt': 0,
            'damage_taken': 0
        }
    
    def get_color(self):
        """Get the color based on team."""
        if self.team == 'red':
            return COLOR_TEAM_RED
        else:
            return COLOR_TEAM_BLUE
    
    def get_light_color(self):
        """Get the light color based on team."""
        if self.team == 'red':
            return COLOR_TEAM_RED_LIGHT
        else:
            return COLOR_TEAM_BLUE_LIGHT
    
    def is_alive(self):
        """Check if the agent is still alive."""
        return self.life > 0
    
    def take_damage(self, damage):
        """
        Apply damage to the agent.
        
        Args:
            damage (int): Amount of damage to take
        """
        self.life = max(0, self.life - damage)
        self.stats['damage_taken'] += damage
    
    def add_message(self, turn, sender_id, sender_pos, message):
        """
        Add a message received from a teammate.
        
        Args:
            turn (int): Turn number when message was received
            sender_id (str): ID of the sender
            sender_pos (list): Position of the sender
            message (str): Message content
        """
        self.messages.append({
            'turn': turn,
            'sender': sender_id,
            'position': sender_pos,
            'message': message
        })
    
    def add_historic_entry(self, turn, action_number, thoughts, action):
        """
        Add an entry to the agent's action history.
        
        Args:
            turn (int): Turn number
            action_number (int): Action number in the turn
            thoughts (str): Agent's reasoning
            action (str): Action taken
        """
        self.historic.append({
            'turn': turn,
            'actionNumber': action_number,
            'thoughts': thoughts,
            'action': action
        })
    
    def get_hp_percentage(self):
        """Get health as a percentage."""
        return (self.life / AGENT_LIFE) * 100
    
    def get_hp_bar_color(self):
        """Get color for HP bar based on current health."""
        hp_percent = self.get_hp_percentage()
        if hp_percent > 60:
            return COLOR_HP_BAR_GREEN
        elif hp_percent > 30:
            return COLOR_HP_BAR_YELLOW
        else:
            return COLOR_HP_BAR_RED
    
    def __repr__(self):
        """String representation of the agent."""
        return f"Agent({self.id}, {self.team}, pos={self.position}, hp={self.life})"


class Target:
    """
    Represents a target (base) that teams must protect/destroy.
    
    Attributes:
        team (str): Team that owns this target
        position (list): [x, y] position on the grid
        life (int): Current health points
    """
    
    def __init__(self, team, position):
        """
        Initialize a target.
        
        Args:
            team (str): Team name ('red' or 'blue')
            position (list): [x, y] position
        """
        self.team = team
        self.position = position.copy()
        self.life = TARGET_LIFE  # Targets have same HP as agents
        self.kind = 'targets'
    
    def is_alive(self):
        """Check if the target is still standing."""
        return self.life > 0
    
    def take_damage(self, damage):
        """
        Apply damage to the target.
        
        Args:
            damage (int): Amount of damage to take
        """
        self.life = max(0, self.life - damage)

    def get_hp_percentage(self):
        """Get health as a percentage."""
        return (self.life / TARGET_LIFE) * 100
    
    def get_hp_bar_color(self):
        """Get color for HP bar based on current health."""
        hp_percent = self.get_hp_percentage()
        if hp_percent > 60:
            return COLOR_HP_BAR_GREEN
        elif hp_percent > 30:
            return COLOR_HP_BAR_YELLOW
        else:
            return COLOR_HP_BAR_RED

    def get_color(self):
        """Get the color based on team."""
        if self.team == 'red':
            return COLOR_TEAM_RED
        else:
            return COLOR_TEAM_BLUE
    
    def __repr__(self):
        """String representation of the target."""
        return f"Target({self.team}, pos={self.position}, hp={self.life})"


class Obstacle:
    """
    Represents an obstacle on the battlefield.
    
    Attributes:
        position (list): [x, y] position on the grid
    """
    
    def __init__(self, position):
        """
        Initialize an obstacle.
        
        Args:
            position (list): [x, y] position
        """
        self.position = position.copy()
        self.kind = 'obstacles'
    
    def __repr__(self):
        """String representation of the obstacle."""
        return f"Obstacle(pos={self.position})"
