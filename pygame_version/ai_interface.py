import random
from typing import Dict, List, Tuple, Optional


def get_ai_action(agent_state: Dict) -> str:
    """
    AI decision-making function that uses pre-calculated possible actions
    from format_agent_state and prioritizes moves towards enemy target.
    
    Args:
        agent_state: Formatted agent state containing:
            - possible_actions: List of available actions
            - enemy_positions: List of enemy positions
            - position: Agent's current position
            - Other state information
    
    Returns:
        Action string (e.g., "move_up", "shoot_right", "idle")
    """
    possible_actions = agent_state.get("possible_actions", [])
    
    if not possible_actions:
        return "idle"
    
    # Separate actions by type
    move_actions = [a for a in possible_actions if a.startswith("move_")]
    shoot_actions = [a for a in possible_actions if a.startswith("shoot_")]
    
    # Prioritize shooting if available
    if shoot_actions:
        return random.choice(shoot_actions)
    
    # If we have move actions, prioritize moves towards enemy
    if move_actions:
        enemy_positions = agent_state.get("enemy_positions", [])
        agent_pos = agent_state.get("position")
        
        if enemy_positions and agent_pos:
            # Find the closest enemy
            closest_enemy = min(
                enemy_positions,
                key=lambda enemy: manhattan_distance(agent_pos, enemy)
            )
            
            # Get the best move towards the closest enemy
            best_move = get_move_towards_target(
                agent_pos, 
                closest_enemy, 
                move_actions
            )
            
            if best_move:
                return best_move
        
        # If no enemy or no good move found, choose random move
        return random.choice(move_actions)
    
    # If only idle or other actions available
    return random.choice(possible_actions)


def manhattan_distance(pos1: Tuple[int, int], pos2: Tuple[int, int]) -> int:
    """Calculate Manhattan distance between two positions."""
    return abs(pos1[0] - pos2[0]) + abs(pos1[1] - pos2[1])


def get_move_towards_target(
    current_pos: Tuple[int, int],
    target_pos: Tuple[int, int],
    available_moves: List[str]
) -> Optional[str]:
    """
    Determine the best move towards a target from available moves.
    
    Args:
        current_pos: Current position (x, y)
        target_pos: Target position (x, y)
        available_moves: List of available move actions
    
    Returns:
        Best move action string or None if no good move found
    """
    # Calculate direction to target
    dx = target_pos[0] - current_pos[0]
    dy = target_pos[1] - current_pos[1]
    
    # Priority list of moves based on distance to target
    move_priorities = []
    
    # Prioritize moves that reduce distance
    if dy < 0 and "move_up" in available_moves:
        move_priorities.append(("move_up", abs(dy)))
    if dy > 0 and "move_down" in available_moves:
        move_priorities.append(("move_down", abs(dy)))
    if dx < 0 and "move_left" in available_moves:
        move_priorities.append(("move_left", abs(dx)))
    if dx > 0 and "move_right" in available_moves:
        move_priorities.append(("move_right", abs(dx)))
    
    # Sort by distance benefit (higher is better)
    if move_priorities:
        move_priorities.sort(key=lambda x: x[1], reverse=True)
        return move_priorities[0][0]
    
    return None


def get_advanced_ai_action(agent_state: Dict, strategy: str = "aggressive") -> str:
    """
    Advanced AI decision-making with different strategies.
    
    Args:
        agent_state: Formatted agent state
        strategy: AI strategy ("aggressive", "defensive", "balanced")
    
    Returns:
        Action string
    """
    possible_actions = agent_state.get("possible_actions", [])
    
    if not possible_actions:
        return "idle"
    
    move_actions = [a for a in possible_actions if a.startswith("move_")]
    shoot_actions = [a for a in possible_actions if a.startswith("shoot_")]
    
    health = agent_state.get("health", 100)
    enemy_positions = agent_state.get("enemy_positions", [])
    agent_pos = agent_state.get("position")
    
    # Aggressive strategy: prioritize shooting, then move towards enemy
    if strategy == "aggressive":
        if shoot_actions:
            return random.choice(shoot_actions)
        if move_actions and enemy_positions and agent_pos:
            closest_enemy = min(
                enemy_positions,
                key=lambda e: manhattan_distance(agent_pos, e)
            )
            best_move = get_move_towards_target(agent_pos, closest_enemy, move_actions)
            if best_move:
                return best_move
        return random.choice(possible_actions)
    
    # Defensive strategy: retreat if low health, shoot from distance
    elif strategy == "defensive":
        if health < 30 and move_actions and enemy_positions and agent_pos:
            # Retreat: move away from closest enemy
            closest_enemy = min(
                enemy_positions,
                key=lambda e: manhattan_distance(agent_pos, e)
            )
            retreat_move = get_move_away_from_target(agent_pos, closest_enemy, move_actions)
            if retreat_move:
                return retreat_move
        if shoot_actions:
            return random.choice(shoot_actions)
        return random.choice(possible_actions)
    
    # Balanced strategy: mix of aggressive and defensive
    else:
        if shoot_actions and random.random() < 0.7:
            return random.choice(shoot_actions)
        if move_actions and enemy_positions and agent_pos:
            closest_enemy = min(
                enemy_positions,
                key=lambda e: manhattan_distance(agent_pos, e)
            )
            distance = manhattan_distance(agent_pos, closest_enemy)
            
            # Keep optimal distance
            if distance < 3:
                retreat_move = get_move_away_from_target(agent_pos, closest_enemy, move_actions)
                if retreat_move:
                    return retreat_move
            elif distance > 5:
                approach_move = get_move_towards_target(agent_pos, closest_enemy, move_actions)
                if approach_move:
                    return approach_move
        
        return random.choice(possible_actions)


def get_move_away_from_target(
    current_pos: Tuple[int, int],
    target_pos: Tuple[int, int],
    available_moves: List[str]
) -> Optional[str]:
    """
    Determine the best move away from a target.
    
    Args:
        current_pos: Current position (x, y)
        target_pos: Target position (x, y)
        available_moves: List of available move actions
    
    Returns:
        Best retreat move action string or None
    """
    # Calculate direction away from target
    dx = current_pos[0] - target_pos[0]
    dy = current_pos[1] - target_pos[1]
    
    move_priorities = []
    
    # Prioritize moves that increase distance
    if dy < 0 and "move_up" in available_moves:
        move_priorities.append(("move_up", abs(dy)))
    if dy > 0 and "move_down" in available_moves:
        move_priorities.append(("move_down", abs(dy)))
    if dx < 0 and "move_left" in available_moves:
        move_priorities.append(("move_left", abs(dx)))
    if dx > 0 and "move_right" in available_moves:
        move_priorities.append(("move_right", abs(dx)))
    
    if move_priorities:
        move_priorities.sort(key=lambda x: x[1], reverse=True)
        return move_priorities[0][0]
    
    return None
