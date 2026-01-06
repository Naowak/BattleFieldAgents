"""
Renderer module for BattleFieldAgents.
Handles rendering of the game grid, agents, targets, obstacles, and animations.
"""

import pygame
import math
from constants import *
from agents import Agent, Target, Obstacle
from actions import MoveAction, AttackAction, SpeakAction
from utils import get_possible_moves, get_visible_cells


class GameRenderer:
    """
    Main renderer for the game.
    Renders the grid, entities, and animations.
    """
    
    def __init__(self, game_state):
        """
        Initialize the game renderer.
        
        Args:
            game_state: The game state object
        """
        self.game_state = game_state
        
        # Debug display flags
        self.show_possible_moves = False
        self.show_agent_position = False
        self.show_agent_vision = False
        
        # Cached debug info
        self.cached_visible_cells = []
        self.cached_possible_moves = []
        
        # Calculate grid dimensions and position
        self.grid_width = (2 * BOARD_SIZE + 1) * CELL_SIZE
        self.grid_height = (2 * BOARD_SIZE + 1) * CELL_SIZE
        
        # Center the grid in the available space
        available_width = GRID_AREA_WIDTH
        available_height = WINDOW_HEIGHT
        
        self.grid_x = LEFT_PANEL_WIDTH + (available_width - self.grid_width) // 2
        self.grid_y = (available_height - self.grid_height) // 2
        
        # Fonts
        self.font_small = pygame.font.Font(None, FONT_SIZE_SMALL)

    def update_debug_cache(self):
        """Update the cached debug information (vision and moves)."""
        current_agent = self.game_state.get_current_agent()
        if current_agent:
            self.cached_visible_cells = get_visible_cells(
                current_agent,
                self.game_state.agents,
                self.game_state.targets,
                self.game_state.obstacles
            )
            self.cached_possible_moves = get_possible_moves(
                current_agent,
                self.game_state.agents,
                self.game_state.targets,
                self.game_state.obstacles
            )
        else:
            self.cached_visible_cells = []
            self.cached_possible_moves = []
    
    def world_to_screen(self, world_pos):
        """
        Convert world coordinates to screen coordinates.
        
        Args:
            world_pos (list): World position [x, y]
        
        Returns:
            tuple: Screen position (x, y) in pixels
        """
        # World coordinates range from -BOARD_SIZE to +BOARD_SIZE
        # Convert to grid coordinates (0 to 2*BOARD_SIZE)
        grid_x = world_pos[0] + BOARD_SIZE
        grid_y = world_pos[1] + BOARD_SIZE
        
        # Convert to screen coordinates
        screen_x = self.grid_x + grid_x * CELL_SIZE + CELL_SIZE // 2
        screen_y = self.grid_y + grid_y * CELL_SIZE + CELL_SIZE // 2
        
        return (screen_x, screen_y)
    
    def draw_grid(self, surface):
        """
        Draw the game grid with alternating colors.
        
        Args:
            surface (pygame.Surface): Surface to draw on
        """
        for grid_x in range(2 * BOARD_SIZE + 1):
            for grid_y in range(2 * BOARD_SIZE + 1):
                # Calculate screen position
                screen_x = self.grid_x + grid_x * CELL_SIZE
                screen_y = self.grid_y + grid_y * CELL_SIZE
                
                # Alternating colors (checkerboard pattern)
                if (grid_x + grid_y) % 2 == 0:
                    color = COLOR_CELL_1
                else:
                    color = COLOR_CELL_2
                
                # Draw cell
                cell_rect = pygame.Rect(screen_x, screen_y, CELL_SIZE, CELL_SIZE)
                pygame.draw.rect(surface, color, cell_rect)
                pygame.draw.rect(surface, COLOR_CELL_BORDER, cell_rect, 1)
                
                # Draw coordinates if enabled
                if SHOW_COORDINATES and grid_x % 5 == 0 and grid_y % 5 == 0:
                    world_x = grid_x - BOARD_SIZE
                    world_y = grid_y - BOARD_SIZE
                    coord_text = self.font_small.render(f"{world_x},{world_y}", True, COLOR_TEXT_SECONDARY)
                    text_x = screen_x + 2
                    text_y = screen_y + 2
                    surface.blit(coord_text, (text_x, text_y))
    
    def _draw_debug_rect(self, surface, world_pos, color):
        """Helper to draw a debug rectangle on the overlay surface."""
        grid_x = world_pos[0] + BOARD_SIZE
        grid_y = world_pos[1] + BOARD_SIZE
        
        rect = pygame.Rect(
            grid_x * CELL_SIZE,
            grid_y * CELL_SIZE,
            CELL_SIZE,
            CELL_SIZE
        )
        pygame.draw.rect(surface, color, rect)

    def draw_debug_overlays(self, surface):
        """Draw semi-transparent overlays for debugging."""
        if not (self.show_possible_moves or self.show_agent_position or self.show_agent_vision):
            return

        overlay_surface = pygame.Surface((self.grid_width, self.grid_height), pygame.SRCALPHA)
        current_agent = self.game_state.get_current_agent()

        if current_agent:
            # Agent Vision (drawn first)
            if self.show_agent_vision:
                for cell_pos in self.cached_visible_cells:
                    self._draw_debug_rect(overlay_surface, cell_pos, COLOR_DEBUG_AGENT_VISION)
            
            # Possible Moves
            if self.show_possible_moves:
                for move in self.cached_possible_moves:
                    self._draw_debug_rect(overlay_surface, move, COLOR_DEBUG_POSSIBLE_MOVES)
            
            # Current Agent Position (drawn last to be on top of other overlays)
            if self.show_agent_position:
                self._draw_debug_rect(overlay_surface, current_agent.position, COLOR_DEBUG_AGENT_POSITION)

        surface.blit(overlay_surface, (self.grid_x, self.grid_y))

    def draw_obstacles(self, surface):
        """
        Draw obstacles with hatched pattern.
        
        Args:
            surface (pygame.Surface): Surface to draw on
        """
        for obstacle in self.game_state.obstacles:
            screen_pos = self.world_to_screen(obstacle.position)
            
            # Draw obstacle as a filled square with hatching
            obstacle_rect = pygame.Rect(
                screen_pos[0] - CELL_SIZE // 2,
                screen_pos[1] - CELL_SIZE // 2,
                CELL_SIZE,
                CELL_SIZE
            )
            
            # Fill with dark color
            pygame.draw.rect(surface, COLOR_OBSTACLE, obstacle_rect)
            
            # Draw hatched pattern (diagonal lines)
            for i in range(-CELL_SIZE, CELL_SIZE, 5):
                start_x = obstacle_rect.left + i
                start_y = obstacle_rect.top
                end_x = obstacle_rect.left + i + CELL_SIZE
                end_y = obstacle_rect.bottom
                
                # Clip to rectangle bounds
                if start_x < obstacle_rect.left:
                    start_y += (obstacle_rect.left - start_x)
                    start_x = obstacle_rect.left
                if end_x > obstacle_rect.right:
                    end_y -= (end_x - obstacle_rect.right)
                    end_x = obstacle_rect.right
                
                pygame.draw.line(surface, COLOR_OBSTACLE_PATTERN, (start_x, start_y), (end_x, end_y), 1)
            
            # Draw border
            pygame.draw.rect(surface, COLOR_TEXT, obstacle_rect, 2)
    
    def draw_targets(self, surface):
        """
        Draw targets as diamond shapes.
        
        Args:
            surface (pygame.Surface): Surface to draw on
        """
        current_action = self.game_state.action_queue.get_current_action()

        for target in self.game_state.targets:
            if not target.is_alive():
                continue
            
            # Check if target should blink (being attacked)
            should_render = True
            if current_action and isinstance(current_action, AttackAction):
                if target.position == current_action.params['target_position']:
                    should_render = current_action.should_render_target()
            
            if should_render:
                screen_pos = self.world_to_screen(target.position)
                
                # Draw diamond shape (4 points)
                points = [
                    (screen_pos[0], screen_pos[1] - TARGET_SIZE),  # Top
                    (screen_pos[0] + TARGET_SIZE, screen_pos[1]),  # Right
                    (screen_pos[0], screen_pos[1] + TARGET_SIZE),  # Bottom
                    (screen_pos[0] - TARGET_SIZE, screen_pos[1])   # Left
                ]
                
                pygame.draw.polygon(surface, target.get_color(), points)
                pygame.draw.polygon(surface, COLOR_TEXT, points, 2)
    
    def draw_agents(self, surface):
        """
        Draw agents as colored circles.
        Handles animation for moving agents.
        
        Args:
            surface (pygame.Surface): Surface to draw on
        """
        current_action = self.game_state.action_queue.get_current_action()
        
        for agent in self.game_state.agents:
            if not agent.is_alive():
                continue
            
            # Check if this agent is currently moving
            draw_pos = agent.position
            if current_action and isinstance(current_action, MoveAction) and current_action.agent_id == agent.id:
                # Get interpolated position during movement
                draw_pos = current_action.get_current_position(agent)
            
            screen_pos = self.world_to_screen(draw_pos)
            
            # Check if agent should blink (being attacked)
            should_render = True
            if current_action and isinstance(current_action, AttackAction):
                if agent.position == current_action.params['target_position']:
                    should_render = current_action.should_render_target()
            
            if should_render:
                # Draw agent circle
                pygame.draw.circle(surface, agent.get_color(), screen_pos, AGENT_RADIUS)
                pygame.draw.circle(surface, COLOR_TEXT, screen_pos, AGENT_RADIUS, 2)
                
                # Draw agent ID text
                id_text = self.font_small.render(agent.id, True, COLOR_TEXT)
                text_x = screen_pos[0] - id_text.get_width() // 2
                text_y = screen_pos[1] - id_text.get_height() // 2
                surface.blit(id_text, (text_x, text_y))
    
    def draw_speak_animation(self, surface):
        """
        Draw speak animation (yellow outline around speaking agents).
        
        Args:
            surface (pygame.Surface): Surface to draw on
        """
        current_action = self.game_state.action_queue.get_current_action()
        
        if current_action and isinstance(current_action, SpeakAction):
            # Highlight the speaker
            speaker = self.game_state.get_agent_by_id(current_action.agent_id)
            if speaker and speaker.is_alive():
                screen_pos = self.world_to_screen(speaker.position)
                pygame.draw.circle(surface, COLOR_HIGHLIGHT_YELLOW, screen_pos, AGENT_RADIUS + 5, 3)
            
            # Highlight the recipient
            recipient = self.game_state.get_entity_at_position(current_action.params['target_position'])
            if recipient and isinstance(recipient, Agent) and recipient.is_alive():
                screen_pos = self.world_to_screen(recipient.position)
                pygame.draw.circle(surface, COLOR_HIGHLIGHT_YELLOW, screen_pos, AGENT_RADIUS + 5, 3)
    
    def draw_current_agent_highlight(self, surface):
        """
        Draw a highlight around the current agent whose turn it is.
        
        Args:
            surface (pygame.Surface): Surface to draw on
        """
        current_agent = self.game_state.get_current_agent()
        if current_agent and current_agent.is_alive():
            screen_pos = self.world_to_screen(current_agent.position)
            
            # Pulsing highlight effect
            import time
            pulse = (math.sin(time.time() * 3) + 1) / 2  # 0 to 1
            radius = AGENT_RADIUS + 8 + int(pulse * 4)
            
            pygame.draw.circle(surface, COLOR_HIGHLIGHT_YELLOW, screen_pos, radius, 2)
    
    def draw_game_info(self, surface):
        """
        Draw game information overlay (turn number, etc.).
        
        Args:
            surface (pygame.Surface): Surface to draw on
        """
        info = self.game_state.get_game_info()
        
        # Draw info box at top center of grid area
        info_x = self.grid_x + self.grid_width // 2
        info_y = self.grid_y - 30
        
        # Turn info
        turn_text = f"Turn {info['turn']} - {info['current_agent']} ({info['action_count']}/{NB_ACTIONS_PER_TURN})"
        text_surface = self.font_small.render(turn_text, True, COLOR_TEXT)
        text_x = info_x - text_surface.get_width() // 2
        
        # Background for text
        bg_rect = pygame.Rect(text_x - 5, info_y - 5, text_surface.get_width() + 10, text_surface.get_height() + 10)
        pygame.draw.rect(surface, COLOR_PANEL_BG, bg_rect)
        pygame.draw.rect(surface, COLOR_TEXT, bg_rect, 1)
        
        surface.blit(text_surface, (text_x, info_y))
    
    def draw_win_screen(self, surface):
        """
        Draw win screen overlay when game is over.
        
        Args:
            surface (pygame.Surface): Surface to draw on
        """
        if not self.game_state.game_over:
            return
        
        # Semi-transparent overlay
        overlay = pygame.Surface((WINDOW_WIDTH, WINDOW_HEIGHT), pygame.SRCALPHA)
        overlay.fill((0, 0, 0, 180))
        surface.blit(overlay, (0, 0))
        
        # Win text
        font_large = pygame.font.Font(None, 72)
        winner_text = f"{self.game_state.winner.upper()} TEAM WINS!"
        
        if self.game_state.winner == 'red':
            color = COLOR_TEAM_RED
        else:
            color = COLOR_TEAM_BLUE
        
        text_surface = font_large.render(winner_text, True, color)
        text_x = LEFT_PANEL_WIDTH + (WINDOW_WIDTH - LEFT_PANEL_WIDTH - RIGHT_PANEL_WIDTH - text_surface.get_width()) // 2
        text_y = WINDOW_HEIGHT // 2 - 50
        surface.blit(text_surface, (text_x, text_y))
        
        # Instructions
        font_small = pygame.font.Font(None, 36)
        instruction_text = "Press R to restart"
        text_surface = font_small.render(instruction_text, True, COLOR_TEXT)
        text_x = LEFT_PANEL_WIDTH + (WINDOW_WIDTH - LEFT_PANEL_WIDTH - RIGHT_PANEL_WIDTH - text_surface.get_width()) // 2
        text_y = WINDOW_HEIGHT // 2 + 50
        surface.blit(text_surface, (text_x, text_y))
    
    def render(self, surface):
        """
        Main render function - draws everything.
        
        Args:
            surface (pygame.Surface): Surface to draw on
        """
        # Draw grid
        self.draw_grid(surface)
        
        # Draw debug overlays on top of the grid
        self.draw_debug_overlays(surface)

        # Draw obstacles
        self.draw_obstacles(surface)
        
        # Draw targets
        self.draw_targets(surface)
        
        # Draw agents
        self.draw_agents(surface)
        
        # Draw speak animation if active
        self.draw_speak_animation(surface)
        
        # Draw current agent highlight
        if not self.game_state.action_queue.is_busy():
            self.draw_current_agent_highlight(surface)
        
        # Draw game info
        self.draw_game_info(surface)
        
        # Draw win screen if game is over
        self.draw_win_screen(surface)