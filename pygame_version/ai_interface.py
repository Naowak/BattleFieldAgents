"""
AI Interface module for BattleFieldAgents game.
Handles communication with the AI API to get agent decisions.
"""

from constants import *
from utils import format_agent_state, get_possible_moves, distance, has_line_of_sight
import requests
import json
import random
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class AIInterface:
    """
    Interface for communicating with the AI API.
    Sends game state and receives agent decisions (thoughts + actions).
    """
    
    def __init__(self, api_url="https://unpalpablely-vibronic-leonore.ngrok-free.dev/api/v1", timeout=API_TIMEOUT):
        """
        Initialize the AI interface.
        
        Args:
            api_url (str): URL of the AI API endpoint.
            timeout (float): Request timeout in seconds.
        """
        # Ensure the URL points to the chat completions endpoint if it's an OpenAI-compatible API
        if not api_url.endswith("/chat/completions"):
             self.api_url = api_url.rstrip("/") + "/chat/completions"
        else:
             self.api_url = api_url

        self.timeout = timeout
        self.api_key = os.getenv("API_KEY")
        self.last_response = None
        self.is_thinking = False
        
        # Load system message
        try:
            with open('system_message.txt', 'r') as f:
                self.system_message = f.read()
        except FileNotFoundError:
            print("Error: system_message.txt not found.")
            self.system_message = "You are an AI agent playing a game."
    
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
            
            # Prepare the request payload for OpenAI-compatible API
            headers = {
                "Content-Type": "application/json",
                "Authorization": f"Bearer {self.api_key}"
            }
            
            payload = {
                "model": "qwen/qwen3-30b-a3b-2507:2", 
                "messages": [
                    {"role": "system", "content": self.system_message},
                    {"role": "user", "content": json.dumps(state)}
                ],
                "temperature": 0.2
            }

            # Send POST request to the AI API
            response = requests.post(
                self.api_url,
                json=payload,
                timeout=self.timeout,
                headers=headers
            )
            
            # Check if request was successful
            if response.status_code != 200:
                print(f"AI API Error: Status code {response.status_code} - {response.text}")
                self.is_thinking = False
                return None, None
            
            # Parse the response
            data = response.json()
            
            if 'choices' in data and len(data['choices']) > 0:
                content = data['choices'][0]['message']['content']
                thoughts, action = self._parse_response(content)
                
                self.last_response = data
                self.is_thinking = False
                return thoughts, action
            else:
                print("AI API Error: Unexpected response format")
                self.is_thinking = False
                return None, None
        
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

    def _parse_response(self, content):
        """
        Parse the content string to extract thoughts and action.
        """
        thoughts = ""
        action = ""
        try:
            lines = content.split('\n')
            # Extract thoughts
            t_lines = [l for l in lines if l.startswith('THOUGHTS: ')]
            if t_lines:
                thoughts = t_lines[0][10:].strip()
            
            # Extract action
            a_lines = [l for l in lines if l.startswith('ACTION: ')]
            if a_lines:
                action = a_lines[0][8:].strip()
            
            return thoughts, action
        except Exception as e:
            print(f"Error parsing response: {e}")
            return "", ""
    
    def check_api_connection(self):
        """
        Check if the API is reachable.
        
        Returns:
            bool: True if API is accessible, False otherwise
        """
        try:
            # Try to connect to a models endpoint or similar to check availability
            # Since we don't know if /models is available on the private API, 
            # we'll assume it's up if we can reach the base URL or just skip this check strictly.
            # But for good measure let's try a simple GET to the base URL
            test_url = self.api_url.replace('/chat/completions', '')
            response = requests.get(test_url, timeout=5)
            # Accept any response that indicates the server is there (even 404/401 is better than connection error)
            return True
        except:
            return False


class MockAIInterface(AIInterface):
    """
    Mock AI interface for testing without an actual API.
    Provides simple rule-based decisions for agents.
    """
    
    def __init__(self):
        """Initialize the mock AI interface."""
        # Initialize parent but don't fail if files missing
        self.api_url = "MOCK"
        self.timeout = 0
        self.api_key = "MOCK"
        self.system_message = ""
        self.last_response = None
        self.is_thinking = False
    
    def get_agent_decision(self, agent, turn, game_state):
        """
        Generate a mock decision for an agent.
        - Priority 1: Attack visible enemies with clear Line of Sight (LOS).
        - Priority 2: Move towards the enemy main target.
        - Priority 3: Wait.
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
            
            # Check for a clear Line of Sight (LOS)
            if has_line_of_sight(agent.position, enemy_pos, game_state.agents, game_state.targets, game_state.obstacles):
                action = f"ATTACK [{enemy_pos[0]}, {enemy_pos[1]}]"
                thoughts += " Clear line of sight. Attacking!"
                self.is_thinking = False
                return thoughts, action
            else:
                thoughts += " No clear line of sight."

        # 2. No enemy with LOS, so move towards the main enemy target
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
                
                thoughts = f"No enemy in my line of sight. Moving towards the enemy target at {enemy_target.position}."
                action = f"MOVE [{best_move[0]}, {best_move[1]}]"
                self.is_thinking = False
                return thoughts, action

        # 3. If no other action, wait
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
