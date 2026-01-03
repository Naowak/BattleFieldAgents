"""
Utility functions for the BattleFieldAgents game.
Includes pathfinding (A*), vision calculation, and helper functions.
"""

from constants import *
import math
from heapq import heappush, heappop


def distance(pos1, pos2):
    """
    Calculate Manhattan distance between two positions.
    
    Args:
        pos1 (list): First position [x, y]
        pos2 (list): Second position [x, y]
    
    Returns:
        int: Manhattan distance
    """
    return abs(pos1[0] - pos2[0]) + abs(pos1[1] - pos2[1])


def euclidean_distance(pos1, pos2):
    """
    Calculate Euclidean distance between two positions.
    
    Args:
        pos1 (list): First position [x, y]
        pos2 (list): Second position [x, y]
    
    Returns:
        float: Euclidean distance
    """
    return math.sqrt((pos1[0] - pos2[0])**2 + (pos1[1] - pos2[1])**2)


def is_position_valid(position):
    """
    Check if a position is within the game board bounds.
    
    Args:
        position (list): Position [x, y] to check
    
    Returns:
        bool: True if position is valid
    """
    return -BOARD_SIZE <= position[0] <= BOARD_SIZE and -BOARD_SIZE <= position[1] <= BOARD_SIZE


def is_position_occupied(position, agents, targets, obstacles):
    """
    Check if a position is occupied by any entity.
    
    Args:
        position (list): Position [x, y] to check
        agents (list): List of agents
        targets (list): List of targets
        obstacles (list): List of obstacles
    
    Returns:
        bool: True if position is occupied
    """
    # Check agents
    for agent in agents:
        if agent.position == position and agent.is_alive():
            return True
    
    # Check targets
    for target in targets:
        if target.position == position and target.is_alive():
            return True
    
    # Check obstacles
    for obstacle in obstacles:
        if obstacle.position == position:
            return True
    
    return False


def get_neighbors(position):
    """
    Get the 4 orthogonal neighbors of a position.
    
    Args:
        position (list): Current position [x, y]
    
    Returns:
        list: List of neighbor positions [[x, y], ...]
    """
    x, y = position
    neighbors = [
        [x + 1, y],
        [x - 1, y],
        [x, y + 1],
        [x, y - 1]
    ]
    return [n for n in neighbors if is_position_valid(n)]


def astar_pathfinding(start, goal, agents, targets, obstacles):
    """
    Find the shortest path from start to goal using A* algorithm.
    Avoids occupied cells.
    
    Args:
        start (list): Starting position [x, y]
        goal (list): Goal position [x, y]
        agents (list): List of agents
        targets (list): List of targets
        obstacles (list): List of obstacles
    
    Returns:
        list: Path as list of positions [[x, y], ...], or empty list if no path found
    """
    # If start and goal are the same
    if start == goal:
        return []
    
    # Create a set of occupied positions (excluding the goal)
    occupied = set()
    for agent in agents:
        if agent.is_alive() and agent.position != goal:
            occupied.add(tuple(agent.position))
    for target in targets:
        if target.is_alive() and target.position != goal:
            occupied.add(tuple(target.position))
    for obstacle in obstacles:
        if obstacle.position != goal:
            occupied.add(tuple(obstacle.position))
    
    # A* algorithm
    open_set = []
    heappush(open_set, (0, tuple(start)))
    
    came_from = {}
    g_score = {tuple(start): 0}
    f_score = {tuple(start): distance(start, goal)}
    
    while open_set:
        _, current = heappop(open_set)
        current = list(current)
        
        # Goal reached
        if current == goal:
            # Reconstruct path
            path = []
            while tuple(current) in came_from:
                path.append(current)
                current = came_from[tuple(current)]
            path.reverse()
            return path
        
        # Explore neighbors
        for neighbor in get_neighbors(current):
            neighbor_tuple = tuple(neighbor)
            
            # Skip occupied positions
            if neighbor_tuple in occupied:
                continue
            
            tentative_g_score = g_score[tuple(current)] + 1
            
            if neighbor_tuple not in g_score or tentative_g_score < g_score[neighbor_tuple]:
                came_from[neighbor_tuple] = current
                g_score[neighbor_tuple] = tentative_g_score
                f_score[neighbor_tuple] = tentative_g_score + distance(neighbor, goal)
                heappush(open_set, (f_score[neighbor_tuple], neighbor_tuple))
    
    # No path found
    return []


def get_possible_moves(agent, agents, targets, obstacles, max_distance=AGENT_MOVE_RANGE):
    """
    Get all possible move positions for an agent within max_distance.
    
    Args:
        agent (Agent): The agent to move
        agents (list): List of all agents
        targets (list): List of targets
        obstacles (list): List of obstacles
        max_distance (int): Maximum movement distance
    
    Returns:
        list: List of possible positions [[x, y], ...]
    """
    possible_moves = []
    start_pos = agent.position
    
    # Explore all positions within Manhattan distance
    for dx in range(-max_distance, max_distance + 1):
        for dy in range(-max_distance, max_distance + 1):
            if abs(dx) + abs(dy) == 0 or abs(dx) + abs(dy) > max_distance:
                continue
            
            new_pos = [start_pos[0] + dx, start_pos[1] + dy]
            
            # Check if position is valid and not occupied
            if is_position_valid(new_pos) and not is_position_occupied(new_pos, agents, targets, obstacles):
                # Check if there's a valid path (A*) and if its length is within the allowed move range
                path = astar_pathfinding(start_pos, new_pos, agents, targets, obstacles)
                if path and len(path) <= max_distance:
                    possible_moves.append(new_pos)
    
    return possible_moves


def compute_sight(agent, agents, targets, obstacles):
    """
    Compute what entities an agent can see based on SIGHT_RANGE.
    Returns list of visible entities with their properties.
    
    Args:
        agent (Agent): The agent whose sight to compute
        agents (list): List of all agents
        targets (list): List of targets
        obstacles (list): List of obstacles
    
    Returns:
        list: List of visible entities with properties
    """
    visible = []
    
    # Check other agents
    for other_agent in agents:
        if other_agent.id != agent.id and other_agent.is_alive():
            dist = distance(agent.position, other_agent.position)
            if dist <= SIGHT_RANGE:
                visible.append({
                    'kind': 'agents',
                    'id': other_agent.id,
                    'team': other_agent.team,
                    'position': other_agent.position.copy(),
                    'life': other_agent.life
                })
    
    # Check targets
    for target in targets:
        if target.is_alive():
            dist = distance(agent.position, target.position)
            if dist <= SIGHT_RANGE:
                visible.append({
                    'kind': 'targets',
                    'team': target.team,
                    'position': target.position.copy(),
                    'life': target.life
                })
    
    # Check obstacles
    for obstacle in obstacles:
        dist = distance(agent.position, obstacle.position)
        if dist <= SIGHT_RANGE:
            visible.append({
                'kind': 'obstacles',
                'position': obstacle.position.copy()
            })
    
    return visible


def compute_last_positions_seen(agent, turn):
    """
    Compute the last known positions of enemies from sight history.
    
    Args:
        agent (Agent): The agent
        turn (int): Current turn number
    
    Returns:
        dict: Dictionary of {entity_id: {'position': [x, y], 'turn': turn}}
    """
    last_seen = {}
    
    # This would require maintaining a history of sights
    # For now, we'll return the current sight as last seen
    for entity in agent.sight:
        if entity['kind'] == 'agents' and entity['team'] != agent.team:
            last_seen[entity['id']] = {
                'position': entity['position'],
                'turn': turn
            }
    
    return last_seen


def format_agent_state(agent, turn, agents, targets, obstacles):
    """
    Format the agent's state for sending to the AI API.
    
    Args:
        agent (Agent): The agent
        turn (dict): Current turn information
        agents (list): List of all agents
        targets (list): List of targets
        obstacles (list): List of obstacles
    
    Returns:
        dict: Formatted state dictionary
    """
    # Get possible moves
    possible_moves = get_possible_moves(agent, agents, targets, obstacles)
    move_actions = [f"MOVE [{pos[0]}, {pos[1]}]" for pos in possible_moves]
    
    # Get possible attacks (enemies in sight)
    attack_actions = []
    for entity in agent.sight:
        if entity['kind'] in ['agents', 'targets'] and entity['team'] != agent.team:
            attack_actions.append(f"ATTACK [{entity['position'][0]}, {entity['position'][1]}]")
    
    # Get possible speaks (teammates in sight)
    speak_actions = []
    for entity in agent.sight:
        if entity['kind'] == 'agents' and entity['team'] == agent.team:
            speak_actions.append(f"SPEAK [{entity['position'][0]}, {entity['position'][1]}]")
    
    # Separate sight into categories
    friends = [e for e in agent.sight if e['kind'] == 'agents' and e['team'] == agent.team]
    enemies = [e for e in agent.sight if e['kind'] == 'agents' and e['team'] != agent.team]
    friendly_target = [e for e in agent.sight if e['kind'] == 'targets' and e['team'] == agent.team]
    enemy_target = [e for e in agent.sight if e['kind'] == 'targets' and e['team'] != agent.team]
    visible_obstacles = [e for e in agent.sight if e['kind'] == 'obstacles']
    
    state = {
        'messages': agent.messages,
        'historic': agent.historic,
        'lastPosSeen': agent.last_pos_seen,
        'position': agent.position,
        'life': agent.life,
        'friends': friends,
        'enemies': enemies,
        'friendlyTarget': friendly_target,
        'enemyTarget': enemy_target,
        'obstacles': visible_obstacles,
        'actionsLeft': NB_ACTIONS_PER_TURN - turn['action_count'],
        'possibleActions': move_actions + attack_actions + speak_actions
    }
    
    return state


def get_line_cells(start, end):
    """
    Get all cells on a line from start to end using Bresenham's algorithm.
    
    Args:
        start (list): Start position [x, y]
        end (list): End position [x, y]
        
    Returns:
        list: List of cells [[x, y], ...] on the line
    """
    x1, y1 = start
    x2, y2 = end
    points = []
    
    dx = abs(x2 - x1)
    dy = abs(y2 - y1)
    x, y = x1, y1
    
    sx = -1 if x1 > x2 else 1
    sy = -1 if y1 > y2 else 1
    
    if dx > dy:
        err = dx / 2.0
        while x != x2:
            points.append([x, y])
            err -= dy
            if err < 0:
                y += sy
                err += dx
            x += sx
    else:
        err = dy / 2.0
        while y != y2:
            points.append([x, y])
            err -= dx
            if err < 0:
                x += sx
                err += dy
            y += sy
            
    points.append([x, y])
    return points


def has_line_of_sight(start_pos, end_pos, agents, targets, obstacles):
    """
    Check for a clear line of sight between two points.
    
    Args:
        start_pos (list): Start position [x, y]
        end_pos (list): End position [x, y]
        agents (list): List of all agents
        targets (list): List of targets
        obstacles (list): List of obstacles
        
    Returns:
        bool: True if line of sight is clear, False otherwise
    """
    line = get_line_cells(start_pos, end_pos)
    
    # Check all cells on the line, excluding the start and end points
    for i in range(1, len(line) - 1):
        pos = line[i]
        if is_position_occupied(pos, agents, targets, obstacles):
            return False # Obstruction found
            
    return True
