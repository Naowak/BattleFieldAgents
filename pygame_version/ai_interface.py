"""
AI Interface module for BattleFieldAgents game.
Handles communication with the AI API to get agent decisions.
"""

from constants import *
from utils import format_agent_state
import requests
import json
import random


class AIInterface:
    """
    Interface for communicating with the AI API.
    Sends game state and receives agent decisions (thoughts + actions).
    """
    
    def __init__(self, api_url=API_URL, timeout=API_TIMEOUT):
        """
        Initialize the AI interface.
        
        Args:
            api_url (str): URL of the AI API endpoint
            timeout (float): Request timeout in seconds
        """
        self.api_url = api_url
        self.timeout = timeout
        self.last_response = None
        self.is_thinking = False
    
    def get_agent_decision(self, agent, turn, game_state):
        """
        Request a decision from the AI for a specific agent.
        
        Args:
            agent (Agent): The agent that needs to make a decision
            turn (dict): Current turn information
            game_state: The game state object
        
        Returns:
            tuple: (thoughts, action) where:
                - thoughts (str): The agent's reasoning
                - action (str): The action string (e.g., "MOVE [3, 5]")
            Returns (None, None) if the request fails.
        """
        self.is_thinking = True
        
        try:
            # Format the agent's state for the API
            state = format_agent_state(
                agent,
                turn,
                game_state.agents,
                game_state.targets,
                game_state.obstacles
            )
            
            # Prepare the request payload
            payload = {
                'state': state
            }
            
            # Send POST request to the AI API
            response = requests.post(
                self.api_url,
                json=payload,
                timeout=self.timeout,
                headers={'Content-Type': 'application/json'}
            )
            
            # Check if request was successful
            if response.status_code != 200:
                print(f"AI API Error: Status code {response.status_code}")
                self.is_thinking = False
                return None, None
            
            # Parse the response
            data = response.json()
            thoughts = data.get('thoughts', '')
            action = data.get('action', '')
            
            self.last_response = data
            self.is_thinking = False
            
            return thoughts, action
        
        except requests.exceptions.Timeout:
            print("AI API Error: Request timed out")
            self.is_thinking = False
            return None, None
        
        except requests.exceptions.ConnectionError:
            print("AI API Error: Could not connect to server")
            print(f"Make sure the API is running at {self.api_url}")
            self.is_thinking = False
            return None, None
        
        except requests.exceptions.RequestException as e:
            print(f"AI API Error: {e}")
            self.is_thinking = False
            return None, None
        
        except json.JSONDecodeError:
            print("AI API Error: Invalid JSON response")
            self.is_thinking = False
            return None, None
        
        except Exception as e:
            print(f"AI API Error: Unexpected error - {e}")
            self.is_thinking = False
            return None, None
    
    def check_api_connection(self):
        """
        Check if the API is reachable.
        
        Returns:
            bool: True if API is accessible, False otherwise
        """
        try:
            # Try to connect to a hello endpoint or just check the base URL
            test_url = self.api_url.replace('/play_one_turn', '/hello')
            response = requests.get(test_url, timeout=5)
            return response.status_code == 200
        except:
            return False


class MockAIInterface(AIInterface):
    """
    Mock AI interface for testing without an actual API.
    Provides simple rule-based decisions for agents.
    """
    
    def __init__(self):
        """Initialize the mock AI interface."""
        super().__init__()
        self.api_url = "MOCK"
    
    def get_agent_decision(self, agent, turn, game_state):
        """
        Generate a simple rule-based decision.
        
        Args:
            agent (Agent): The agent that needs to make a decision
            turn (dict): Current turn information
            game_state: The game state object
        
        Returns:
            tuple: (thoughts, action)
        """
        self.is_thinking = True
        
        # Get visible entities from agent's sight (which is a list)
        sight = agent.sight
        
        # Priority logic:
        # 1. Attack visible enemies
        # 2. Move towards enemy target
        # 3. Random move
        
        # Check for visible enemies in sight list
        visible_enemies = []
        if sight:
            for visible_entity in sight:
                # Check if it's an enemy agent
                if visible_entity.get('kind') == 'agents' and visible_entity.get('team') != agent.team:
                    visible_enemies.append(visible_entity)
        
        # If we can see enemies, try to attack
        if visible_enemies:
            # Pick closest enemy
            closest_enemy = min(visible_enemies, 
                              key=lambda e: abs(e['position'][0] - agent.position[0]) + 
                                          abs(e['position'][1] - agent.position[1]))
            
            enemy_pos = closest_enemy['position']
            dx = enemy_pos[0] - agent.position[0]
            dy = enemy_pos[1] - agent.position[1]
            
            # Check if aligned for attack (same row or column)
            if dx == 0 or dy == 0:
                thoughts = f"Enemy spotted at {enemy_pos}! Attacking!"
                action = f"ATTACK {enemy_pos}"
                self.is_thinking = False
                return thoughts, action
            else:
                # Move towards enemy to get in line
                if abs(dx) > abs(dy):
                    new_pos = [agent.position[0] + (1 if dx > 0 else -1), agent.position[1]]
                else:
                    new_pos = [agent.position[0], agent.position[1] + (1 if dy > 0 else -1)]
                
                thoughts = f"Moving towards enemy at {enemy_pos}"
                action = f"MOVE {new_pos}"
                self.is_thinking = False
                return thoughts, action
        
        # Find enemy target
        enemy_target = None
        for target in game_state.targets:
            if target.team != agent.team and target.is_alive():
                enemy_target = target
                break
        
        # Move towards enemy target
        if enemy_target:
            target_pos = enemy_target.position
            dx = target_pos[0] - agent.position[0]
            dy = target_pos[1] - agent.position[1]
            
            # Move in the direction of the target
            if abs(dx) > abs(dy):
                new_pos = [agent.position[0] + (1 if dx > 0 else -1), agent.position[1]]
            else:
                new_pos = [agent.position[0], agent.position[1] + (1 if dy > 0 else -1)]
            
            # Check if position is valid (not obstacle, not occupied)
            is_valid = True
            
            # Check obstacles
            for obstacle in game_state.obstacles:
                if obstacle.position == new_pos:
                    is_valid = False
                    break
            
            # Check other agents
            if is_valid:
                for other_agent in game_state.agents:
                    if other_agent.position == new_pos and other_agent.is_alive():
                        is_valid = False
                        break
            
            # Check bounds
            if abs(new_pos[0]) > BOARD_SIZE or abs(new_pos[1]) > BOARD_SIZE:
                is_valid = False
            
            if is_valid:
                thoughts = f"Moving towards enemy target at {target_pos}"
                action = f"MOVE {new_pos}"
                self.is_thinking = False
                return thoughts, action
        
        # Random move as fallback
        directions = [
            [agent.position[0] + 1, agent.position[1]],  # right
            [agent.position[0] - 1, agent.position[1]],  # left
            [agent.position[0], agent.position[1] + 1],  # down
            [agent.position[0], agent.position[1] - 1]   # up
        ]
        
        random.shuffle(directions)
        
        for new_pos in directions:
            # Check if position is valid
            if abs(new_pos[0]) > BOARD_SIZE or abs(new_pos[1]) > BOARD_SIZE:
                continue
            
            is_valid = True
            
            # Check obstacles
            for obstacle in game_state.obstacles:
                if obstacle.position == new_pos:
                    is_valid = False
                    break
            
            # Check other agents
            if is_valid:
                for other_agent in game_state.agents:
                    if other_agent.position == new_pos and other_agent.is_alive():
                        is_valid = False
                        break
            
            if is_valid:
                thoughts = "Exploring the battlefield"
                action = f"MOVE {new_pos}"
                self.is_thinking = False
                return thoughts, action
        
        # Can't move anywhere, wait
        thoughts = "No valid moves available, waiting"
        action = "WAIT"
        self.is_thinking = False
        return thoughts, action
    
    def check_api_connection(self):
        """Mock API is always 'connected'."""
        return True


# Example usage
if __name__ == "__main__":
    # Test mock interface
    print("Testing mock interface...")
    mock_ai = MockAIInterface()
    print(f"✓ Mock AI created (always returns valid decisions)")
