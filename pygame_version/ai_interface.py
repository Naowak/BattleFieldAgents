"""
AI Interface for BattleField Agents Game

This module provides the interface for AI agents to interact with the game.
"""

from typing import Tuple


class AIInterface:
    """Interface for AI agents to make decisions in the game."""
    
    def __init__(self, api_handler=None):
        """
        Initialize the AI interface.
        
        Args:
            api_handler: Optional API handler for LLM calls
        """
        self.api_handler = api_handler
    
    def get_agent_decision(self, agent, turn: int, game_state: dict) -> Tuple[str, str]:
        """
        Get the decision from an AI agent.
        
        Args:
            agent: The agent object making the decision
            turn: The current turn number
            game_state: Dictionary containing the current game state
        
        Returns:
            Tuple[str, str]: A tuple containing (thoughts, action)
                - thoughts: The agent's reasoning as a string
                - action: The action to take as a string (e.g., "MOVE [3, 5]")
        """
        if self.api_handler is None:
            # Default behavior when no API handler is provided
            thoughts = "No AI handler configured, using default action"
            action = "WAIT"
            return (thoughts, action)
        
        # Call the API handler to get the agent's decision
        try:
            response = self.api_handler.get_agent_action(agent, turn, game_state)
            
            # Parse the response and extract thoughts and action
            thoughts = response.get("thoughts", "No thoughts provided")
            action = response.get("action", "WAIT")
            
            return (thoughts, action)
        except Exception as e:
            # Handle any errors gracefully
            thoughts = f"Error getting AI decision: {str(e)}"
            action = "WAIT"
            return (thoughts, action)
