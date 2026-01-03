import pygame
from config import *
from collections import deque

def get_agent_at_position(agents, position):
    """Return agent at given position or None"""
    for agent in agents:
        if agent.position == position:
            return agent
    return None

def get_distance(pos1, pos2):
    """Calculate Manhattan distance between two positions"""
    return abs(pos1[0] - pos2[0]) + abs(pos1[1] - pos2[1])

def get_direction_to(from_pos, to_pos):
    """Get the primary direction from one position to another"""
    dx = to_pos[0] - from_pos[0]
    dy = to_pos[1] - from_pos[1]
    
    # Prioritize the larger distance
    if abs(dx) > abs(dy):
        return 'right' if dx > 0 else 'left'
    elif abs(dy) > abs(dx):
        return 'down' if dy > 0 else 'up'
    else:
        # Equal distance, prioritize horizontal
        return 'right' if dx > 0 else 'left'

def is_valid_move(position, grid_size):
    """Check if position is within grid bounds"""
    return 0 <= position[0] < grid_size and 0 <= position[1] < grid_size

def get_neighbors(position, grid_size):
    """Get valid neighboring positions"""
    x, y = position
    neighbors = []
    for dx, dy in [(0, 1), (1, 0), (0, -1), (-1, 0)]:
        new_pos = (x + dx, y + dy)
        if is_valid_move(new_pos, grid_size):
            neighbors.append(new_pos)
    return neighbors

def find_path_bfs(start, goal, obstacles, grid_size):
    """Find shortest path using BFS, avoiding obstacles"""
    if start == goal:
        return [start]
    
    queue = deque([(start, [start])])
    visited = {start}
    
    while queue:
        current, path = queue.popleft()
        
        for neighbor in get_neighbors(current, grid_size):
            if neighbor in visited or neighbor in obstacles:
                continue
                
            new_path = path + [neighbor]
            
            if neighbor == goal:
                return new_path
                
            visited.add(neighbor)
            queue.append((neighbor, new_path))
    
    return None  # No path found

def draw_grid(screen, grid_size, cell_size):
    """Draw the game grid"""
    for x in range(grid_size):
        for y in range(grid_size):
            rect = pygame.Rect(x * cell_size, y * cell_size, cell_size, cell_size)
            pygame.draw.rect(screen, COLORS['grid'], rect, 1)

def draw_obstacles(screen, obstacles, cell_size):
    """Draw obstacles on the grid"""
    for obs in obstacles:
        x, y = obs
        rect = pygame.Rect(x * cell_size, y * cell_size, cell_size, cell_size)
        pygame.draw.rect(screen, COLORS['obstacle'], rect)

def draw_agents(screen, agents, cell_size):
    """Draw all agents on the grid"""
    for agent in agents:
        x, y = agent.position
        center = (x * cell_size + cell_size // 2, y * cell_size + cell_size // 2)
        
        # Draw agent circle
        pygame.draw.circle(screen, agent.color, center, cell_size // 3)
        
        # Draw health bar
        health_ratio = agent.health / agent.max_health
        bar_width = cell_size - 10
        bar_height = 5
        bar_x = x * cell_size + 5
        bar_y = y * cell_size + 5
        
        # Background (red)
        pygame.draw.rect(screen, (255, 0, 0), 
                        (bar_x, bar_y, bar_width, bar_height))
        # Health (green)
        pygame.draw.rect(screen, (0, 255, 0), 
                        (bar_x, bar_y, int(bar_width * health_ratio), bar_height))

def draw_text(screen, text, position, font_size=24, color=COLORS['text']):
    """Draw text on screen"""
    font = pygame.font.Font(None, font_size)
    text_surface = font.render(text, True, color)
    screen.blit(text_surface, position)

def is_aligned_for_attack(agent_pos, target_pos):
    """
    Check if agent and target are aligned for attack.
    Returns True if they share the same row or column.
    
    Args:
        agent_pos: Tuple (x, y) representing agent position
        target_pos: Tuple (x, y) representing target position
    
    Returns:
        bool: True if aligned (same row or column), False otherwise
    """
    return agent_pos[0] == target_pos[0] or agent_pos[1] == target_pos[1]

def has_clear_line_of_fire(agent_pos, target_pos, obstacles):
    """
    Check if there's a clear line of fire between agent and target.
    Assumes agent and target are already aligned (same row or column).
    
    Args:
        agent_pos: Tuple (x, y) representing agent position
        target_pos: Tuple (x, y) representing target position
        obstacles: Set or list of obstacle positions
    
    Returns:
        bool: True if no obstacles block the path, False otherwise
    """
    # Get all positions between agent and target (exclusive)
    if agent_pos[0] == target_pos[0]:  # Same column, check rows
        x = agent_pos[0]
        min_y = min(agent_pos[1], target_pos[1])
        max_y = max(agent_pos[1], target_pos[1])
        
        # Check all positions between (exclusive of start and end)
        for y in range(min_y + 1, max_y):
            if (x, y) in obstacles:
                return False
                
    elif agent_pos[1] == target_pos[1]:  # Same row, check columns
        y = agent_pos[1]
        min_x = min(agent_pos[0], target_pos[0])
        max_x = max(agent_pos[0], target_pos[0])
        
        # Check all positions between (exclusive of start and end)
        for x in range(min_x + 1, max_x):
            if (x, y) in obstacles:
                return False
    
    return True

def format_game_state(agent, agents, obstacles, grid_size):
    """Format game state for LLM"""
    # Get other agents and their info
    other_agents = []
    for other in agents:
        if other.id != agent.id:
            distance = get_distance(agent.position, other.position)
            direction = get_direction_to(agent.position, other.position)
            other_agents.append({
                'id': other.id,
                'team': other.team,
                'position': other.position,
                'health': other.health,
                'distance': distance,
                'direction': direction
            })
    
    # Sort by distance
    other_agents.sort(key=lambda x: x['distance'])
    
    # Find closest enemy and ally
    closest_enemy = None
    closest_ally = None
    
    for other in other_agents:
        if other['team'] != agent.team and closest_enemy is None:
            closest_enemy = other
        elif other['team'] == agent.team and closest_ally is None:
            closest_ally = other
            
        if closest_enemy and closest_ally:
            break
    
    state = {
        'agent_id': agent.id,
        'team': agent.team,
        'position': agent.position,
        'health': agent.health,
        'max_health': agent.max_health,
        'grid_size': grid_size,
        'closest_enemy': closest_enemy,
        'closest_ally': closest_ally,
        'all_agents': other_agents,
        'nearby_obstacles': [obs for obs in obstacles 
                           if get_distance(agent.position, obs) <= 3]
    }
    
    return state

def format_agent_state(agent, agents, obstacles, grid_size):
    """
    Format game state into natural language for the agent.
    Only includes attack actions when aligned with target and has clear line of fire.
    """
    state = format_game_state(agent, agents, obstacles, grid_size)
    
    # Build context string
    context = f"""You are Agent {agent.id} (Team {agent.team}).
Position: {agent.position}
Health: {agent.health}/{agent.max_health}

"""
    
    # Add enemy information
    if state['closest_enemy']:
        enemy = state['closest_enemy']
        context += f"""Closest Enemy: Agent {enemy['id']} (Team {enemy['team']})
- Position: {enemy['position']}
- Distance: {enemy['distance']} cells
- Direction: {enemy['direction']}
- Health: {enemy['health']}

"""
    
    # Add ally information
    if state['closest_ally']:
        ally = state['closest_ally']
        context += f"""Closest Ally: Agent {ally['id']}
- Position: {ally['position']}
- Distance: {ally['distance']} cells
- Direction: {ally['direction']}
- Health: {ally['health']}

"""
    
    # Add obstacles info
    if state['nearby_obstacles']:
        context += f"Nearby Obstacles: {len(state['nearby_obstacles'])} within 3 cells\n\n"
    
    # Add available actions with conditional attack options
    context += """Available Actions:
- move_up: Move one cell up
- move_down: Move one cell down
- move_left: Move one cell left
- move_right: Move one cell right
"""
    
    # Only add attack actions if aligned with an enemy and has clear line of fire
    if state['closest_enemy']:
        enemy_pos = tuple(state['closest_enemy']['position'])
        agent_pos = tuple(agent.position)
        
        if is_aligned_for_attack(agent_pos, enemy_pos) and has_clear_line_of_fire(agent_pos, enemy_pos, obstacles):
            context += f"- attack: Attack Agent {state['closest_enemy']['id']} (aligned with clear line of fire)\n"
    
    context += """- wait: Do nothing this turn

Choose the best action for your survival and team victory."""
    
    return context

def parse_llm_action(response_text):
    """Parse LLM response to extract action"""
    # Clean up the response
    response_text = response_text.strip().lower()
    
    # List of valid actions
    valid_actions = ['move_up', 'move_down', 'move_left', 'move_right', 'attack', 'wait']
    
    # Check if response contains a valid action
    for action in valid_actions:
        if action in response_text:
            return action
    
    # Default to wait if no valid action found
    return 'wait'

def execute_action(agent, action, agents, obstacles, grid_size):
    """Execute agent action and return result message"""
    if action == 'wait':
        return f"Agent {agent.id} waits"
    
    elif action.startswith('move_'):
        direction = action.split('_')[1]
        x, y = agent.position
        
        new_pos = {
            'up': (x, y - 1),
            'down': (x, y + 1),
            'left': (x - 1, y),
            'right': (x + 1, y)
        }.get(direction)
        
        if new_pos and is_valid_move(new_pos, grid_size):
            # Check for obstacles
            if new_pos in obstacles:
                return f"Agent {agent.id} cannot move {direction} - obstacle in the way"
            
            # Check for other agents
            if any(a.position == new_pos for a in agents if a.id != agent.id):
                return f"Agent {agent.id} cannot move {direction} - another agent is there"
            
            agent.position = new_pos
            return f"Agent {agent.id} moves {direction} to {new_pos}"
        else:
            return f"Agent {agent.id} cannot move {direction} - out of bounds"
    
    elif action == 'attack':
        # Find target (closest enemy)
        target = None
        min_distance = float('inf')
        
        for other in agents:
            if other.team != agent.team and other.health > 0:
                distance = get_distance(agent.position, other.position)
                if distance < min_distance:
                    min_distance = distance
                    target = other
        
        if target and min_distance <= ATTACK_RANGE:
            # Check if aligned and has clear line of fire
            if is_aligned_for_attack(agent.position, target.position) and \
               has_clear_line_of_fire(agent.position, target.position, obstacles):
                damage = ATTACK_DAMAGE
                target.health -= damage
                result = f"Agent {agent.id} attacks Agent {target.id} for {damage} damage"
                
                if target.health <= 0:
                    result += f" - Agent {target.id} eliminated!"
                
                return result
            else:
                return f"Agent {agent.id} cannot attack - no clear line of fire or not aligned"
        else:
            return f"Agent {agent.id} cannot attack - no enemy in range"
    
    return f"Agent {agent.id} performs unknown action: {action}"
