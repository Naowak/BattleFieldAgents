"""
AI Interface Module for BattleField Agents

This module provides an interface for communicating with OpenAI's API
to enable AI-controlled agents in the game.
"""

import os
import json
from typing import Dict, List, Optional, Any
from openai import OpenAI


class AIInterface:
    """Interface for AI agent communication with OpenAI API."""
    
    def __init__(self, api_key: Optional[str] = None, model: str = "gpt-4"):
        """
        Initialize the AI interface.
        
        Args:
            api_key: OpenAI API key. If None, will try to get from environment.
            model: The OpenAI model to use for AI decisions.
        """
        self.api_key = api_key or os.getenv("OPENAI_API_KEY")
        if not self.api_key:
            raise ValueError("OpenAI API key must be provided or set in OPENAI_API_KEY environment variable")
        
        self.client = OpenAI(api_key=self.api_key)
        self.model = model
        self.conversation_history: Dict[str, List[Dict[str, str]]] = {}
    
    def _get_system_prompt(self) -> str:
        """Get the system prompt for the AI agent."""
        return """You are an AI agent in a battlefield strategy game. Your goal is to survive and eliminate enemy agents.

Game Rules:
- You can move in 4 directions: up, down, left, right
- You can shoot in 4 directions: up, down, left, right
- Shooting consumes energy
- Getting hit reduces your health
- You die when health reaches 0
- You win by being the last agent standing

You will receive information about:
- Your current position, health, and energy
- Positions of other agents (enemies and allies)
- Obstacles on the battlefield
- Recent events (hits, deaths, etc.)

You must respond with a JSON object containing your action:
{
    "action": "move" or "shoot" or "wait",
    "direction": "up" or "down" or "left" or "right" (if applicable),
    "reasoning": "brief explanation of your decision"
}

Make strategic decisions to maximize your survival and eliminate enemies."""
    
    def _format_game_state(self, game_state: Dict[str, Any]) -> str:
        """
        Format the game state into a readable prompt for the AI.
        
        Args:
            game_state: Dictionary containing the current game state.
            
        Returns:
            Formatted string describing the game state.
        """
        prompt_parts = ["Current Game State:\n"]
        
        # Agent's own status
        if "agent" in game_state:
            agent = game_state["agent"]
            prompt_parts.append(f"Your Status:")
            prompt_parts.append(f"  Position: ({agent.get('x', 0)}, {agent.get('y', 0)})")
            prompt_parts.append(f"  Health: {agent.get('health', 100)}")
            prompt_parts.append(f"  Energy: {agent.get('energy', 100)}")
            prompt_parts.append(f"  Team: {agent.get('team', 'unknown')}\n")
        
        # Other agents
        if "other_agents" in game_state and game_state["other_agents"]:
            prompt_parts.append("Other Agents:")
            for i, other in enumerate(game_state["other_agents"], 1):
                prompt_parts.append(f"  Agent {i}:")
                prompt_parts.append(f"    Position: ({other.get('x', 0)}, {other.get('y', 0)})")
                prompt_parts.append(f"    Team: {other.get('team', 'unknown')}")
                prompt_parts.append(f"    Alive: {other.get('alive', True)}")
            prompt_parts.append("")
        
        # Obstacles
        if "obstacles" in game_state and game_state["obstacles"]:
            prompt_parts.append(f"Obstacles: {len(game_state['obstacles'])} obstacles on the map")
            prompt_parts.append("")
        
        # Recent events
        if "events" in game_state and game_state["events"]:
            prompt_parts.append("Recent Events:")
            for event in game_state["events"][-5:]:  # Last 5 events
                prompt_parts.append(f"  - {event}")
            prompt_parts.append("")
        
        # Battlefield dimensions
        if "battlefield" in game_state:
            bf = game_state["battlefield"]
            prompt_parts.append(f"Battlefield: {bf.get('width', 800)}x{bf.get('height', 600)}")
        
        return "\n".join(prompt_parts)
    
    def get_agent_decision(
        self, 
        agent_id: str, 
        game_state: Dict[str, Any],
        reset_history: bool = False
    ) -> Dict[str, Any]:
        """
        Get a decision from the AI for the given agent.
        
        Args:
            agent_id: Unique identifier for the agent.
            game_state: Dictionary containing the current game state.
            reset_history: If True, reset the conversation history for this agent.
            
        Returns:
            Dictionary containing the agent's decision.
        """
        if reset_history or agent_id not in self.conversation_history:
            self.conversation_history[agent_id] = []
        
        # Format the game state
        state_prompt = self._format_game_state(game_state)
        
        # Build messages
        messages = [{"role": "system", "content": self._get_system_prompt()}]
        messages.extend(self.conversation_history[agent_id])
        messages.append({"role": "user", "content": state_prompt})
        
        try:
            # Call OpenAI API
            response = self.client.chat.completions.create(
                model=self.model,
                messages=messages,
                temperature=0.7,
                max_tokens=200,
                response_format={"type": "json_object"}
            )
            
            # Parse response
            ai_response = response.choices[0].message.content
            decision = json.loads(ai_response)
            
            # Update conversation history (keep last 10 exchanges)
            self.conversation_history[agent_id].append({"role": "user", "content": state_prompt})
            self.conversation_history[agent_id].append({"role": "assistant", "content": ai_response})
            
            if len(self.conversation_history[agent_id]) > 20:
                self.conversation_history[agent_id] = self.conversation_history[agent_id][-20:]
            
            return decision
            
        except json.JSONDecodeError as e:
            print(f"Error parsing AI response: {e}")
            return {"action": "wait", "reasoning": "Error parsing response"}
        except Exception as e:
            print(f"Error communicating with OpenAI API: {e}")
            return {"action": "wait", "reasoning": "API communication error"}
    
    def reset_agent_history(self, agent_id: str):
        """Reset the conversation history for a specific agent."""
        if agent_id in self.conversation_history:
            del self.conversation_history[agent_id]
    
    def reset_all_histories(self):
        """Reset conversation histories for all agents."""
        self.conversation_history.clear()


class MockAIInterface(AIInterface):
    """Mock AI interface for testing without API calls."""
    
    def __init__(self):
        """Initialize mock interface without API key."""
        self.conversation_history = {}
        self.model = "mock"
    
    def get_agent_decision(
        self, 
        agent_id: str, 
        game_state: Dict[str, Any],
        reset_history: bool = False
    ) -> Dict[str, Any]:
        """
        Return a mock decision for testing.
        
        This implementation uses simple heuristics instead of AI.
        """
        import random
        
        # Simple heuristic: move towards nearest enemy or shoot if close
        agent = game_state.get("agent", {})
        other_agents = game_state.get("other_agents", [])
        
        if not other_agents:
            # No enemies, move randomly
            return {
                "action": "move",
                "direction": random.choice(["up", "down", "left", "right"]),
                "reasoning": "No enemies detected, exploring"
            }
        
        # Find nearest enemy
        agent_x, agent_y = agent.get("x", 0), agent.get("y", 0)
        agent_team = agent.get("team", "unknown")
        
        nearest_enemy = None
        min_distance = float('inf')
        
        for other in other_agents:
            if other.get("team") != agent_team and other.get("alive", True):
                dx = other.get("x", 0) - agent_x
                dy = other.get("y", 0) - agent_y
                distance = abs(dx) + abs(dy)
                
                if distance < min_distance:
                    min_distance = distance
                    nearest_enemy = (dx, dy)
        
        if nearest_enemy:
            dx, dy = nearest_enemy
            
            # If enemy is close and aligned, shoot
            if (abs(dx) < 50 and abs(dy) < 10) or (abs(dy) < 50 and abs(dx) < 10):
                if abs(dx) > abs(dy):
                    direction = "right" if dx > 0 else "left"
                else:
                    direction = "down" if dy > 0 else "up"
                
                return {
                    "action": "shoot",
                    "direction": direction,
                    "reasoning": f"Enemy nearby, shooting {direction}"
                }
            
            # Otherwise, move towards enemy
            if abs(dx) > abs(dy):
                direction = "right" if dx > 0 else "left"
            else:
                direction = "down" if dy > 0 else "up"
            
            return {
                "action": "move",
                "direction": direction,
                "reasoning": f"Moving {direction} towards enemy"
            }
        
        return {
            "action": "wait",
            "reasoning": "Waiting for better opportunity"
        }
