"""
AI Interface module for BattleFieldAgents game.
Handles communication with the AI API to get agent decisions.
"""

from constants import *
from utils import format_agent_state, get_possible_moves, distance
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
        Generate a mock decision for an agent.
        - Priority 1: Attack visible enemies.
        - Priority 2: Move to align for an attack.
        - Priority 3: Move towards the enemy main target.
        - Priority 4: Wait.
        """
        self.is_thinking = True
        
        # 1. Check for attack opportunities first
        visible_enemies = [
            e for e in agent.sight
            if e.get('kind') in ['agents', 'targets'] and e.get('team') != agent.team
        ]
        
        if visible_enemies:
            # Find the closest enemy
            closest_enemy = min(
                visible_enemies,
                key=lambda e: distance(agent.position, e['position'])
            )
            enemy_pos = closest_enemy['position']
            
            thoughts = f"Enemy '{closest_enemy.get('id', 'target')}' spotted at {enemy_pos}."
            
            # Check if aligned for an attack (same row or column)
            if agent.position[0] == enemy_pos[0] or agent.position[1] == enemy_pos[1]:
                action = f"ATTACK [{enemy_pos[0]}, {enemy_pos[1]}]"
                thoughts += " Aligned for attack!"
                self.is_thinking = False
                return thoughts, action
            
            # 2. Not aligned, try to move into an attack position
            possible_moves = get_possible_moves(
                agent,
                game_state.agents,
                game_state.targets,
                game_state.obstacles
            )
            
            if possible_moves:
                # Find a move that aligns with the enemy
                alignment_moves = []
                for move in possible_moves:
                    if move[0] == enemy_pos[0] or move[1] == enemy_pos[1]:
                        alignment_moves.append(move)
                
                if alignment_moves:
                    # Choose the alignment move closest to the enemy
                    best_alignment_move = min(
                        alignment_moves,
                        key=lambda move: distance(move, enemy_pos)
                    )
                    action = f"MOVE [{best_alignment_move[0]}, {best_alignment_move[1]}]"
                    thoughts += " Moving to get in attack range."
                    self.is_thinking = False
                    return thoughts, action

        # 3. No enemies visible or no alignment move possible, move towards the main enemy target
        enemy_target = next((t for t in game_state.targets if t.team != agent.team and t.is_alive()), None)
        
        if enemy_target:
            possible_moves = get_possible_moves(
                agent,
                game_state.agents,
                game_state.targets,
                game_state.obstacles
            )
            
            if possible_moves:
                # Find the move that gets closest to the enemy target
                best_move = min(
                    possible_moves,
                    key=lambda move: distance(move, enemy_target.position)
                )
                
                thoughts = f"No enemy in sight. Moving towards the enemy target at {enemy_target.position}."
                action = f"MOVE [{best_move[0]}, {best_move[1]}]"
                self.is_thinking = False
                return thoughts, action

        # 4. If no other action, wait
        thoughts = "No valid moves or attacks available. Waiting."
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
