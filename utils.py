import anthropic
import os
from enum import Enum
import math

client = anthropic.Anthropic(api_key=os.environ.get("ANTHROPIC_API_KEY"))

class Action(Enum):
    MOVE_FORWARD = "move_forward"
    MOVE_BACKWARD = "move_backward"
    TURN_LEFT = "turn_left"
    TURN_RIGHT = "turn_right"
    ATTACK = "attack"
    DO_NOTHING = "do_nothing"

def is_aligned_for_attack(agent_pos, agent_direction, target_pos, tolerance=0.1):
    """
    Check if agent is aligned with target for attack.
    
    Args:
        agent_pos: Tuple (x, y) of agent position
        agent_direction: Agent's facing direction in radians
        target_pos: Tuple (x, y) of target position
        tolerance: Allowable angular deviation in radians
    
    Returns:
        bool: True if agent is aligned with target
    """
    dx = target_pos[0] - agent_pos[0]
    dy = target_pos[1] - agent_pos[1]
    
    if dx == 0 and dy == 0:
        return False
    
    # Calculate angle to target
    angle_to_target = math.atan2(dy, dx)
    
    # Normalize angles to [-pi, pi]
    angle_diff = (angle_to_target - agent_direction + math.pi) % (2 * math.pi) - math.pi
    
    return abs(angle_diff) <= tolerance

def has_clear_line_of_fire(agent_pos, target_pos, obstacles, agent_radius=10):
    """
    Check if there's a clear line of fire between agent and target.
    
    Args:
        agent_pos: Tuple (x, y) of agent position
        target_pos: Tuple (x, y) of target position
        obstacles: List of obstacle dictionaries with 'x', 'y', 'width', 'height'
        agent_radius: Radius of agent for collision detection
    
    Returns:
        bool: True if line of fire is clear
    """
    if not obstacles:
        return True
    
    # Vector from agent to target
    dx = target_pos[0] - agent_pos[0]
    dy = target_pos[1] - agent_pos[1]
    distance = math.sqrt(dx * dx + dy * dy)
    
    if distance == 0:
        return False
    
    # Normalized direction vector
    dir_x = dx / distance
    dir_y = dy / distance
    
    # Check each obstacle
    for obstacle in obstacles:
        obs_x = obstacle['x']
        obs_y = obstacle['y']
        obs_width = obstacle['width']
        obs_height = obstacle['height']
        
        # Obstacle bounds
        obs_left = obs_x - obs_width / 2
        obs_right = obs_x + obs_width / 2
        obs_top = obs_y - obs_height / 2
        obs_bottom = obs_y + obs_height / 2
        
        # Check if line segment intersects with obstacle rectangle
        # Using parametric line equation: P(t) = agent_pos + t * direction
        # where t goes from 0 to distance
        
        # Find t values where line crosses vertical edges
        t_values = []
        
        if dir_x != 0:
            t_left = (obs_left - agent_pos[0]) / dir_x
            t_right = (obs_right - agent_pos[0]) / dir_x
            t_values.extend([t_left, t_right])
        
        if dir_y != 0:
            t_top = (obs_top - agent_pos[1]) / dir_y
            t_bottom = (obs_bottom - agent_pos[1]) / dir_y
            t_values.extend([t_top, t_bottom])
        
        # Check if any intersection point is within obstacle bounds and line segment
        for t in t_values:
            if 0 <= t <= distance:
                point_x = agent_pos[0] + t * dir_x
                point_y = agent_pos[1] + t * dir_y
                
                if (obs_left <= point_x <= obs_right and 
                    obs_top <= point_y <= obs_bottom):
                    return False
        
        # Also check if obstacle center is close to the line
        # (in case the line passes through without hitting edges exactly)
        # Project obstacle center onto line
        to_obs_x = obs_x - agent_pos[0]
        to_obs_y = obs_y - agent_pos[1]
        projection = to_obs_x * dir_x + to_obs_y * dir_y
        
        if 0 <= projection <= distance:
            # Closest point on line to obstacle center
            closest_x = agent_pos[0] + projection * dir_x
            closest_y = agent_pos[1] + projection * dir_y
            
            # Distance from closest point to obstacle center
            dist_to_center = math.sqrt(
                (closest_x - obs_x) ** 2 + (closest_y - obs_y) ** 2
            )
            
            # If line passes through obstacle (accounting for obstacle size and agent radius)
            if dist_to_center < (min(obs_width, obs_height) / 2 + agent_radius):
                return False
    
    return True

def get_perceivable_agents(agent, all_agents, perception_distance):
    """Return list of agents within perception distance."""
    perceivable = []
    agent_pos = (agent['x'], agent['y'])
    
    for other in all_agents:
        if other['id'] == agent['id']:
            continue
        
        other_pos = (other['x'], other['y'])
        dx = other_pos[0] - agent_pos[0]
        dy = other_pos[1] - agent_pos[1]
        distance = math.sqrt(dx * dx + dy * dy)
        
        if distance <= perception_distance:
            perceivable.append({
                'id': other['id'],
                'team': other['team'],
                'x': other['x'],
                'y': other['y'],
                'hp': other['hp'],
                'direction': other['direction'],
                'distance': distance
            })
    
    return perceivable

def get_perceivable_obstacles(agent, obstacles, perception_distance):
    """Return list of obstacles within perception distance."""
    perceivable = []
    agent_pos = (agent['x'], agent['y'])
    
    for obstacle in obstacles:
        obs_pos = (obstacle['x'], obstacle['y'])
        dx = obs_pos[0] - agent_pos[0]
        dy = obs_pos[1] - agent_pos[1]
        distance = math.sqrt(dx * dx + dy * dy)
        
        # Consider obstacle perceivable if any part is within range
        max_dimension = max(obstacle['width'], obstacle['height']) / 2
        if distance - max_dimension <= perception_distance:
            perceivable.append({
                'x': obstacle['x'],
                'y': obstacle['y'],
                'width': obstacle['width'],
                'height': obstacle['height'],
                'distance': distance
            })
    
    return perceivable

def format_agent_state(agent, all_agents, obstacles, world_width, world_height, perception_distance, attack_range):
    """Format agent state for LLM with perceivable information only."""
    
    # Get perceivable entities
    perceivable_agents = get_perceivable_agents(agent, all_agents, perception_distance)
    perceivable_obstacles = get_perceivable_obstacles(agent, obstacles, perception_distance)
    
    # Separate by team
    allies = [a for a in perceivable_agents if a['team'] == agent['team']]
    enemies = [a for a in perceivable_agents if a['team'] != agent['team']]
    
    state = f"""Your current state:
- Position: ({agent['x']:.1f}, {agent['y']:.1f})
- Direction: {math.degrees(agent['direction']):.1f}°
- HP: {agent['hp']}
- Team: {agent['team']}

World boundaries:
- Width: {world_width}, Height: {world_height}

Perception range: {perception_distance}
Attack range: {attack_range}

"""

    if allies:
        state += "Visible Allies:\n"
        for ally in allies:
            state += f"  - Agent {ally['id']}: pos=({ally['x']:.1f}, {ally['y']:.1f}), HP={ally['hp']}, distance={ally['distance']:.1f}\n"
        state += "\n"
    else:
        state += "Visible Allies: None\n\n"
    
    if enemies:
        state += "Visible Enemies:\n"
        for enemy in enemies:
            state += f"  - Agent {enemy['id']}: pos=({enemy['x']:.1f}, {enemy['y']:.1f}), HP={enemy['hp']}, distance={enemy['distance']:.1f}\n"
        state += "\n"
    else:
        state += "Visible Enemies: None\n\n"
    
    if perceivable_obstacles:
        state += "Visible Obstacles:\n"
        for obs in perceivable_obstacles:
            state += f"  - pos=({obs['x']:.1f}, {obs['y']:.1f}), size=({obs['width']:.1f}x{obs['height']:.1f}), distance={obs['distance']:.1f}\n"
        state += "\n"
    else:
        state += "Visible Obstacles: None\n\n"
    
    state += """Available actions:
- move_forward: Move forward in current direction
- move_backward: Move backward
- turn_left: Rotate 45° counter-clockwise
- turn_right: Rotate 45° clockwise
"""

    # Only add attack action if aligned with an enemy and has clear line of fire
    can_attack = False
    agent_pos = (agent['x'], agent['y'])
    
    for enemy in enemies:
        enemy_pos = (enemy['x'], enemy['y'])
        distance = enemy['distance']
        
        if distance <= attack_range:
            if is_aligned_for_attack(agent_pos, agent['direction'], enemy_pos):
                if has_clear_line_of_fire(agent_pos, enemy_pos, perceivable_obstacles):
                    can_attack = True
                    break
    
    if can_attack:
        state += "- attack: Attack an enemy in range (requires alignment and clear line of fire)\n"
    
    state += "- do_nothing: Stay idle\n"
    
    return state

def get_agent_action(agent, all_agents, obstacles, world_width, world_height, perception_distance, attack_range, conversation_history):
    """Get action decision from Claude for an agent."""
    
    state = format_agent_state(agent, all_agents, obstacles, world_width, world_height, perception_distance, attack_range)
    
    # Add state to conversation
    conversation_history.append({
        "role": "user",
        "content": state
    })
    
    system_prompt = """You are controlling an agent in a 2D battle simulation. Your goal is to work with your team to eliminate enemy agents while surviving.

Key rules:
- You can only perceive agents and obstacles within your perception range
- You can only attack enemies within attack range when aligned and with clear line of fire
- Obstacles block movement and line of fire
- Stay within world boundaries
- Coordinate with allies when possible

Respond with ONLY the action name from the available actions list. No explanation."""

    response = client.messages.create(
        model="claude-3-5-sonnet-20241022",
        max_tokens=50,
        system=system_prompt,
        messages=conversation_history
    )
    
    action_text = response.content[0].text.strip().lower()
    
    # Add assistant response to history
    conversation_history.append({
        "role": "assistant",
        "content": action_text
    })
    
    # Parse action
    try:
        return Action(action_text)
    except ValueError:
        # Default to do_nothing if invalid action
        return Action.DO_NOTHING
