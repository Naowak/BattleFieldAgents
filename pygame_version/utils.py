"""
Utility functions for the BattleFieldAgents game.
Includes pathfinding (A*), vision calculation, and helper functions.
"""

from bfa.core.constants import *
import math
from heapq import heappush, heappop
from bfa.entities.agents import Obstacle


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


def _is_in_box(position, box_position, box_range=0.5):
    """Check if a 2D point is inside a square box."""
    return (box_position[0] - box_range <= position[0] <= box_position[0] + box_range and
            box_position[1] - box_range <= position[1] <= box_position[1] + box_range)

def _intersection(start, end, hidder_position):
    """
    Check if a ray from start to end is blocked by a hidder.
    The ray is blocked if it passes through the hidder's 1x1 cell box.
    """
    STEP_SIZE = 0.1
    direction = [end[0] - start[0], end[1] - start[1]]
    
    length_sq = direction[0]**2 + direction[1]**2
    if length_sq == 0:
        return False
    length = math.sqrt(length_sq)
        
    unit_direction = [direction[0] / length, direction[1] / length]
    step_direction = [unit_direction[0] * STEP_SIZE, unit_direction[1] * STEP_SIZE]

    pos = list(start)
    
    # Step along the ray from start, checking for intersection.
    while not _is_in_box(pos, hidder_position) and not _is_in_box(pos, end):
        pos[0] += step_direction[0]
        pos[1] += step_direction[1]
        
        # Safety break to avoid infinite loops
        if (pos[0] - start[0])**2 + (pos[1] - start[1])**2 > length_sq:
            return False

    return _is_in_box(pos, hidder_position)

def compute_sight(agent, agents, targets, obstacles, bonuses=None):
    """
    Compute what entities an agent can see using ray-casting.
    An object is visible if the ray to it is not blocked by any other object.
    """
    if bonuses is None:
        bonuses = []
        
    # Bonuses are visible but don't usually block vision (unless we want them to?).
    # Assuming bonuses are flat on the ground and don't block vision.
    # But they are "entities" we want to see.
    # To check visibility TO a bonus, we check if obstacles block it.
    
    all_entities = [a for a in agents if a.id != agent.id and a.is_alive()] + \
                   [t for t in targets if t.is_alive()] + \
                   obstacles + \
                   bonuses
                   
    # Hidders are objects that block vision. Assuming bonuses DON'T block vision.
    hidders = [a for a in agents if a.id != agent.id and a.is_alive()] + \
              [t for t in targets if t.is_alive()] + \
              obstacles
              # Bonuses excluded from hidders
                   
    sight = []
    sight_range_sq = SIGHT_RANGE**2

    # 1. Filter objects in SIGHT_RANGE (using squared Euclidean distance)
    visible_objects = [
        o for o in all_entities 
        if (agent.position[0] - o.position[0])**2 + (agent.position[1] - o.position[1])**2 < sight_range_sq
    ]

    # 2. For each object, check for obstructions
    for obj in visible_objects:
        # Check against hidders (excluding self if self is a hidder)
        blockers = [h for h in hidders if h is not obj]
        
        is_hidden = any(_intersection(agent.position, obj.position, h.position) for h in blockers)
        
        if not is_hidden:
            entry = {'kind': getattr(obj, 'kind', 'unknown'), 'position': obj.position.copy()}
            if hasattr(obj, 'id'):
                entry['id'] = obj.id
            if hasattr(obj, 'team'):
                entry['team'] = obj.team
            if hasattr(obj, 'life'):
                entry['life'] = obj.life
            if hasattr(obj, 'type'): # For bonuses
                entry['type'] = obj.type
            sight.append(entry)
            
    return sight

def get_visible_cells(agent, agents, targets, obstacles):
    """
    Get all visible cells for an agent within SIGHT_RANGE for debugging.
    Uses ray-casting. This is computationally expensive.
    """
    hidders = [a for a in agents if a.id != agent.id and a.is_alive()] + \
              [t for t in targets if t.is_alive()] + \
              obstacles
              
    visible_cells = []
    sight_range_sq = SIGHT_RANGE**2
    
    min_x = max(-BOARD_SIZE, agent.position[0] - SIGHT_RANGE)
    max_x = min(BOARD_SIZE, agent.position[0] + SIGHT_RANGE)
    min_y = max(-BOARD_SIZE, agent.position[1] - SIGHT_RANGE)
    max_y = min(BOARD_SIZE, agent.position[1] + SIGHT_RANGE)

    for i in range(int(min_x), int(max_x) + 1):
        for j in range(int(min_y), int(max_y) + 1):
            cell_pos = [i, j]
            
            if (agent.position[0] - i)**2 + (agent.position[1] - j)**2 > sight_range_sq:
                continue

            # Check if line of sight is blocked
            is_hidden = False
            for h in hidders:
                # If the object is at the target cell position, and it's NOT an obstacle,
                # it shouldn't block visibility of its own cell.
                # We want to see the cell under agents/targets.
                if h.position == cell_pos and getattr(h, 'kind', '') != 'obstacles' and not isinstance(h, Obstacle):
                    continue
                
                if _intersection(agent.position, cell_pos, h.position):
                    is_hidden = True
                    break
            
            if not is_hidden:
                visible_cells.append(cell_pos)
                
    return visible_cells


def has_line_of_sight(start_pos, end_pos, agents, targets, obstacles):
    """
    Check for a clear line of sight between two points using ray-casting.
    This is a wrapper around the new intersection logic for compatibility.
    """
    all_entities = agents + targets + obstacles
        
    hidders = [
        h for h in all_entities 
        if h.position != start_pos and h.position != end_pos
    ]
    
    is_hidden = any(_intersection(start_pos, end_pos, h.position) for h in hidders)
    return not is_hidden

def compute_last_positions_seen(agent, turn):
    """
    Compute the last known positions of enemies from sight history.
    """
    last_seen = agent.last_pos_seen.copy()
    for entity in agent.sight:
        if entity['kind'] in ['agents', 'targets'] and entity.get('team') != agent.team:
            # Use id if it exists (agents), otherwise use team (targets)
            entity_id = entity.get('id', f"target_{entity['team']}")
            last_seen[entity_id] = {
                'position': entity['position'],
                'turn': turn
            }
    return last_seen

def format_agent_state(agent, turn, agents, targets, obstacles):
    """
    Format the agent's state for sending to the AI API.
    """
    # Get possible moves
    possible_moves = get_possible_moves(agent, agents, targets, obstacles)
    move_actions = [f"MOVE [{pos[0]}, {pos[1]}]" for pos in possible_moves]
    
    # Get possible attacks (enemies in sight)
    attack_actions = []
    for entity in agent.sight:
        if entity['kind'] in ['agents', 'targets'] and entity.get('team') != agent.team:
            attack_actions.append(f"ATTACK [{entity['position'][0]}, {entity['position'][1]}]")
    
    # Get possible speaks (teammates in sight)
    speak_actions = []
    for entity in agent.sight:
        if entity['kind'] == 'agents' and entity.get('team') == agent.team:
            speak_actions.append(f"SPEAK [{entity['position'][0]}, {entity['position'][1]}]")
    
    # Separate sight into categories
    friends = [e for e in agent.sight if e['kind'] == 'agents' and e.get('team') == agent.team]
    enemies = [e for e in agent.sight if e['kind'] == 'agents' and e.get('team') != agent.team]
    friendly_target = [e for e in agent.sight if e['kind'] == 'targets' and e.get('team') == agent.team]
    enemy_target = [e for e in agent.sight if e['kind'] == 'targets' and e.get('team') != agent.team]
    visible_obstacles = [e for e in agent.sight if e['kind'] == 'obstacles']
    visible_bonuses = [e for e in agent.sight if e['kind'] == 'bonus']
    
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
        'bonuses': visible_bonuses,
        'actionsLeft': NB_ACTIONS_PER_TURN - turn['action_count'],
        'possibleActions': move_actions + attack_actions + speak_actions
    }
    
    return state