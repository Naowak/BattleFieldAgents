"""
AI Interface module for BattleFieldAgents game.
Handles communication with the AI API to get agent decisions.
"""

from constants import *
from utils import format_agent_state, distance
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
    Uses pre-calculated possible actions from format_agent_state.
    """
    
    def __init__(self):
        """Initialize the mock AI interface."""
        super().__init__()
        self.api_url = "MOCK"
    
    def get_agent_decision(self, agent, turn, game_state):
        """
        Generate a simple rule-based decision using pre-calculated possible actions.
        
        Args:
            agent (Agent): The agent that needs to make a decision
            turn (dict): Current turn information
            game_state: The game state object
        
        Returns:
            tuple: (thoughts, action)
        """
        self.is_thinking = True
        
        # Get the formatted agent state with possible actions
        state = format_agent_state(
            agent,
            turn,
            game_state.agents,
            game_state.targets,
            game_state.obstacles
        )
        
        possible_actions = state['possibleActions']
        
        if not possible_actions:
            self.is_thinking = False
            return "No valid actions available", "WAIT"
        
        # Separate actions by type
        attack_actions = [a for a in possible_actions if a.startswith('ATTACK')]
        move_actions = [a for a in possible_actions if a.startswith('MOVE')]
        speak_actions = [a for a in possible_actions if a.startswith('SPEAK')]
        
        # Priority 1: Attack visible enemies
        if attack_actions:
            action = random.choice(attack_actions)
            thoughts = "Enemy in sight! Attacking!"
            self.is_thinking = False
            return thoughts, action
        
        # Priority 2: Move towards enemy spawn (or closest enemy target)
        if move_actions:
            # Find enemy target position
            enemy_target_pos = None
            for target in game_state.targets:
                if target.team != agent.team and target.is_alive():
                    enemy_target_pos = target.position
                    break
            
            if enemy_target_pos:
                # Parse move actions and find closest to enemy target
                best_move = None
                best_distance = float('inf')
                
                import re
                for move_action in move_actions:
                    match = re.match(r'MOVE\s*\[(-?\d+),\s*(-?\d+)\]', move_action)
                    if match:
                        x, y = int(match.group(1)), int(match.group(2))
                        pos = [x, y]
                        dist = distance(pos, enemy_target_pos)
                        
                        if dist < best_distance:
                            best_distance = dist
                            best_move = move_action
                
                if best_move:
                    thoughts = f"Moving towards enemy target at {enemy_target_pos}"
                    self.is_thinking = False
                    return thoughts, best_move
            
            # Fallback: random move
            action = random.choice(move_actions)
            thoughts = "Exploring the battlefield"
            self.is_thinking = False
            return thoughts, action
        
        # Priority 3: Communicate with teammates
        if speak_actions:
            action = f"{speak_actions[0]} Need backup!"
            thoughts = "Coordinating with team"
            self.is_thinking = False
            return thoughts, action
        
        # Fallback: wait
        self.is_thinking = False
        return "Waiting for opportunities", "WAIT"
    
    def check_api_connection(self):
        """Mock API is always 'connected'."""
        return True


# Example usage
if __name__ == "__main__":
    # Test mock interface
    print("Testing mock interface...")
    mock_ai = MockAIInterface()
    print(f"✓ Mock AI created (always returns valid decisions)")
