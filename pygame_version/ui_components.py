"""
UI Components module for BattleFieldAgents.
Handles rendering of panels, agent cards, thought bubbles, and UI elements.
"""

import pygame
from constants import *
from agents import Agent


class Panel:
    """
    Base class for UI panels.
    Handles basic panel rendering with background and borders.
    """
    
    def __init__(self, x, y, width, height, bg_color=COLOR_PANEL_BG):
        """
        Initialize a panel.
        
        Args:
            x (int): X position
            y (int): Y position
            width (int): Panel width
            height (int): Panel height
            bg_color (tuple): Background color RGB
        """
        self.rect = pygame.Rect(x, y, width, height)
        self.bg_color = bg_color
    
    def draw(self, surface):
        """
        Draw the panel background.
        
        Args:
            surface (pygame.Surface): Surface to draw on
        """
        pygame.draw.rect(surface, self.bg_color, self.rect)
        pygame.draw.rect(surface, COLOR_CELL_BORDER, self.rect, 2)


class AgentCard:
    """
    UI card displaying agent information in the left panel.
    Shows agent ID, team, HP, position, and stats on hover.
    """
    
    def __init__(self, agent, x, y, width, height):
        """
        Initialize an agent card.
        
        Args:
            agent (Agent): The agent to display
            x (int): X position
            y (int): Y position
            width (int): Card width
            height (int): Card height
        """
        self.agent = agent
        self.rect = pygame.Rect(x, y, width, height)
        self.hovered = False
    
    def update_position(self, y):
        """
        Update the Y position of the card.
        
        Args:
            y (int): New Y position
        """
        self.rect.y = y
    
    def check_hover(self, mouse_pos):
        """
        Check if mouse is hovering over the card.
        
        Args:
            mouse_pos (tuple): Mouse position (x, y)
        
        Returns:
            bool: True if hovered
        """
        self.hovered = self.rect.collidepoint(mouse_pos)
        return self.hovered
    
    def draw(self, surface, font_normal, font_small):
        """
        Draw the agent card.
        
        Args:
            surface (pygame.Surface): Surface to draw on
            font_normal (pygame.font.Font): Normal font
            font_small (pygame.font.Font): Small font
        """
        # Background color based on team and alive status
        if not self.agent.is_alive():
            bg_color = (40, 40, 40)
        elif self.hovered:
            bg_color = self.agent.get_light_color()
        else:
            bg_color = self.agent.get_color()
        
        # Draw card background
        pygame.draw.rect(surface, bg_color, self.rect)
        pygame.draw.rect(surface, COLOR_TEXT, self.rect, 2)
        
        # Draw agent info
        y_offset = self.rect.y + 10
        
        # Agent ID
        id_text = font_normal.render(self.agent.id, True, COLOR_TEXT)
        surface.blit(id_text, (self.rect.x + 10, y_offset))
        y_offset += 25
        
        # Position
        pos_text = font_small.render(f"Pos: [{self.agent.position[0]}, {self.agent.position[1]}]", True, COLOR_TEXT)
        surface.blit(pos_text, (self.rect.x + 10, y_offset))
        y_offset += 20
        
        # HP Bar
        hp_bar_width = self.rect.width - 20
        hp_bar_height = 15
        hp_percentage = self.agent.get_hp_percentage()
        
        # HP bar background
        hp_bar_rect = pygame.Rect(self.rect.x + 10, y_offset, hp_bar_width, hp_bar_height)
        pygame.draw.rect(surface, COLOR_HP_BAR_BG, hp_bar_rect)
        
        # HP bar fill
        if hp_percentage > 0:
            hp_fill_width = int(hp_bar_width * (hp_percentage / 100))
            hp_fill_rect = pygame.Rect(self.rect.x + 10, y_offset, hp_fill_width, hp_bar_height)
            pygame.draw.rect(surface, self.agent.get_hp_bar_color(), hp_fill_rect)
        
        # HP text
        hp_text = font_small.render(f"{self.agent.life} / {AGENT_LIFE}", True, COLOR_TEXT)
        text_x = self.rect.x + 10 + (hp_bar_width - hp_text.get_width()) // 2
        surface.blit(hp_text, (text_x, y_offset))
        
        # Show stats on hover
        if self.hovered and SHOW_STATS:
            self._draw_stats_tooltip(surface, font_small)
    
    def _draw_stats_tooltip(self, surface, font_small):
        """
        Draw statistics tooltip when hovering.
        
        Args:
            surface (pygame.Surface): Surface to draw on
            font_small (pygame.font.Font): Small font
        """
        # Tooltip background
        tooltip_width = 150
        tooltip_height = 80
        tooltip_x = self.rect.right + 5
        tooltip_y = self.rect.y
        
        # Make sure tooltip stays on screen
        if tooltip_x + tooltip_width > surface.get_width():
            tooltip_x = self.rect.x - tooltip_width - 5
        
        tooltip_rect = pygame.Rect(tooltip_x, tooltip_y, tooltip_width, tooltip_height)
        pygame.draw.rect(surface, COLOR_PANEL_BG, tooltip_rect)
        pygame.draw.rect(surface, COLOR_TEXT, tooltip_rect, 2)
        
        # Draw stats
        stats = self.agent.stats
        y_offset = tooltip_y + 5
        
        stats_text = [
            f"Shots: {stats['shots_fired']}",
            f"Moves: {stats['moves_count']}",
            f"Speaks: {stats['speaks_count']}",
            f"Dmg dealt: {stats['damage_dealt']}",
            f"Dmg taken: {stats['damage_taken']}"
        ]
        
        for text in stats_text:
            text_surface = font_small.render(text, True, COLOR_TEXT)
            surface.blit(text_surface, (tooltip_x + 5, y_offset))
            y_offset += 15


class ThoughtBubble:
    """
    Displays agent thoughts and actions in the right panel.
    Shows reasoning and action taken by each agent.
    """
    
    def __init__(self, agent_id, team, thoughts, action, x, y, width):
        """
        Initialize a thought bubble.
        
        Args:
            agent_id (str): Agent ID
            team (str): Agent team
            thoughts (str): Agent's reasoning
            action (str): Action taken
            x (int): X position
            y (int): Y position
            width (int): Bubble width
        """
        self.agent_id = agent_id
        self.team = team
        self.thoughts = thoughts
        self.action = action
        self.x = x
        self.y = y
        self.width = width
        self.height = 0  # Calculated based on content
    
    def draw(self, surface, font_normal, font_small):
        """
        Draw the thought bubble.
        
        Args:
            surface (pygame.Surface): Surface to draw on
            font_normal (pygame.font.Font): Normal font
            font_small (pygame.font.Font): Small font
        
        Returns:
            int: Height of the drawn bubble
        """
        # Choose color based on team
        if self.team == 'red':
            bg_color = COLOR_BUBBLE_BG_RED
            border_color = COLOR_TEAM_RED
        else:
            bg_color = COLOR_BUBBLE_BG_BLUE
            border_color = COLOR_TEAM_BLUE
        
        # Calculate content
        padding = BUBBLE_PADDING
        line_height = 18
        y_offset = self.y + padding
        
        # Draw agent ID header
        header_text = font_normal.render(self.agent_id, True, COLOR_TEXT)
        
        # Wrap thoughts text
        thoughts_lines = self._wrap_text(self.thoughts, font_small, self.width - 2 * padding)
        action_lines = self._wrap_text(f"ACTION: {self.action}", font_small, self.width - 2 * padding)
        
        # Calculate total height
        total_height = padding * 2 + 25  # Header
        total_height += len(thoughts_lines) * line_height + 5  # Thoughts
        total_height += len(action_lines) * line_height  # Action
        
        self.height = min(total_height, BUBBLE_MAX_HEIGHT)
        
        # Draw bubble background
        bubble_rect = pygame.Rect(self.x, self.y, self.width, self.height)
        
        # Create surface with alpha for background
        bubble_surface = pygame.Surface((self.width, self.height), pygame.SRCALPHA)
        pygame.draw.rect(bubble_surface, bg_color, bubble_surface.get_rect(), border_radius=10)
        surface.blit(bubble_surface, (self.x, self.y))
        
        # Draw border
        pygame.draw.rect(surface, border_color, bubble_rect, 2, border_radius=10)
        
        # Draw header
        surface.blit(header_text, (self.x + padding, y_offset))
        y_offset += 25
        
        # Draw separator line
        pygame.draw.line(surface, border_color, 
                        (self.x + padding, y_offset), 
                        (self.x + self.width - padding, y_offset), 1)
        y_offset += 5
        
        # Draw thoughts
        for line in thoughts_lines:
            if y_offset + line_height > self.y + self.height - padding:
                break  # Don't overflow
            text_surface = font_small.render(line, True, COLOR_TEXT)
            surface.blit(text_surface, (self.x + padding, y_offset))
            y_offset += line_height
        
        y_offset += 5
        
        # Draw action
        for line in action_lines:
            if y_offset + line_height > self.y + self.height - padding:
                break
            text_surface = font_small.render(line, True, COLOR_TEXT)
            surface.blit(text_surface, (self.x + padding, y_offset))
            y_offset += line_height
        
        return self.height
    
    def _wrap_text(self, text, font, max_width):
        """
        Wrap text to fit within max_width.
        
        Args:
            text (str): Text to wrap
            font (pygame.font.Font): Font to use
            max_width (int): Maximum width in pixels
        
        Returns:
            list: List of text lines
        """
        words = text.split(' ')
        lines = []
        current_line = []
        
        for word in words:
            test_line = ' '.join(current_line + [word])
            test_surface = font.render(test_line, True, COLOR_TEXT)
            
            if test_surface.get_width() <= max_width:
                current_line.append(word)
            else:
                if current_line:
                    lines.append(' '.join(current_line))
                    current_line = [word]
                else:
                    # Word is too long, just add it anyway
                    lines.append(word)
        
        if current_line:
            lines.append(' '.join(current_line))
        
        return lines if lines else [text]


class LeftPanel(Panel):
    """
    Left panel showing all agents and their status.
    Displays agent cards for both teams.
    """
    
    def __init__(self, game_state):
        """
        Initialize the left panel.
        
        Args:
            game_state: The game state object
        """
        super().__init__(0, 0, LEFT_PANEL_WIDTH, WINDOW_HEIGHT)
        self.game_state = game_state
        self.agent_cards = []
        self.scroll_offset = 0
        self.font_title = pygame.font.Font(None, FONT_SIZE_TITLE)
        self.font_normal = pygame.font.Font(None, FONT_SIZE_NORMAL)
        self.font_small = pygame.font.Font(None, FONT_SIZE_SMALL)
    
    def update_cards(self):
        """Update agent cards based on current game state."""
        self.agent_cards = []
        y_offset = PANEL_PADDING + 40  # Space for title
        
        # Red team
        red_agents = [a for a in self.game_state.agents if a.team == 'red']
        for agent in red_agents:
            card = AgentCard(
                agent,
                PANEL_PADDING,
                y_offset,
                LEFT_PANEL_WIDTH - 2 * PANEL_PADDING,
                AGENT_CARD_HEIGHT
            )
            self.agent_cards.append(card)
            y_offset += AGENT_CARD_HEIGHT + AGENT_CARD_MARGIN
        
        y_offset += 20  # Space between teams
        
        # Blue team
        blue_agents = [a for a in self.game_state.agents if a.team == 'blue']
        for agent in blue_agents:
            card = AgentCard(
                agent,
                PANEL_PADDING,
                y_offset,
                LEFT_PANEL_WIDTH - 2 * PANEL_PADDING,
                AGENT_CARD_HEIGHT
            )
            self.agent_cards.append(card)
            y_offset += AGENT_CARD_HEIGHT + AGENT_CARD_MARGIN
    
    def handle_mouse_motion(self, mouse_pos):
        """
        Handle mouse motion for hover effects.
        
        Args:
            mouse_pos (tuple): Mouse position (x, y)
        """
        for card in self.agent_cards:
            card.check_hover(mouse_pos)
    
    def draw(self, surface):
        """
        Draw the left panel.
        
        Args:
            surface (pygame.Surface): Surface to draw on
        """
        # Draw panel background
        super().draw(surface)
        
        # Draw title
        title_text = self.font_title.render("AGENTS", True, COLOR_TEXT)
        surface.blit(title_text, (PANEL_PADDING, PANEL_PADDING))
        
        # Draw agent cards
        for card in self.agent_cards:
            card.draw(surface, self.font_normal, self.font_small)


class RightPanel(Panel):
    """
    Right panel showing thought bubbles (agent decisions).
    Displays reasoning and actions from AI agents.
    """
    
    def __init__(self):
        """Initialize the right panel."""
        super().__init__(
            WINDOW_WIDTH - RIGHT_PANEL_WIDTH,
            0,
            RIGHT_PANEL_WIDTH,
            WINDOW_HEIGHT
        )
        self.thought_bubbles = []
        self.scroll_offset = 0
        self.font_title = pygame.font.Font(None, FONT_SIZE_TITLE)
        self.font_normal = pygame.font.Font(None, FONT_SIZE_NORMAL)
        self.font_small = pygame.font.Font(None, FONT_SIZE_SMALL)
    
    def add_thought_bubble(self, agent_id, team, thoughts, action):
        """
        Add a new thought bubble to the panel.
        
        Args:
            agent_id (str): Agent ID
            team (str): Agent team
            thoughts (str): Agent's reasoning
            action (str): Action taken
        """
        bubble = ThoughtBubble(
            agent_id,
            team,
            thoughts,
            action,
            self.rect.x + PANEL_PADDING,
            0,  # Y position calculated during draw
            RIGHT_PANEL_WIDTH - 2 * PANEL_PADDING
        )
        self.thought_bubbles.append(bubble)
        
        # Keep only last 20 bubbles
        if len(self.thought_bubbles) > 20:
            self.thought_bubbles.pop(0)
    
    def clear_bubbles(self):
        """Clear all thought bubbles."""
        self.thought_bubbles = []
    
    def draw(self, surface):
        """
        Draw the right panel with thought bubbles.
        
        Args:
            surface (pygame.Surface): Surface to draw on
        """
        # Draw panel background
        super().draw(surface)
        
        # Draw title
        title_text = self.font_title.render("THOUGHTS", True, COLOR_TEXT)
        surface.blit(title_text, (self.rect.x + PANEL_PADDING, PANEL_PADDING))
        
        # Draw thought bubbles from bottom to top (newest at bottom)
        y_offset = self.rect.bottom - PANEL_PADDING
        
        for bubble in reversed(self.thought_bubbles):
            bubble.y = y_offset - bubble.height if bubble.height > 0 else y_offset - 100
            height = bubble.draw(surface, self.font_normal, self.font_small)
            y_offset -= height + BUBBLE_MARGIN
            
            # Stop if we've reached the top
            if y_offset < PANEL_PADDING + 40:
                break


class BottomPanel(Panel):
    """
    Bottom panel showing debug toggles and legend.
    """
    
    def __init__(self, x, y, width, height, renderer):
        """
        Initialize the bottom panel.
        
        Args:
            x, y, width, height: Panel dimensions
            renderer: The GameRenderer object to control debug flags
        """
        super().__init__(x, y, width, height)
        self.renderer = renderer
        self.font_small = pygame.font.Font(None, FONT_SIZE_SMALL)
        
        self.buttons = []
        self._setup_buttons()

    def _setup_buttons(self):
        """Create the toggle buttons."""
        button_texts = ["Show Possible Moves", "Show Agent Position", "Show Agent Vision"]
        button_width = 180
        button_height = 30
        padding = 15
        
        start_x = self.rect.centerx - (len(button_texts) * (button_width + padding) - padding) / 2
        
        for i, text in enumerate(button_texts):
            rect = pygame.Rect(
                start_x + i * (button_width + padding),
                self.rect.y + padding,
                button_width,
                button_height
            )
            self.buttons.append({'rect': rect, 'text': text, 'id': i})

    def handle_mouse_click(self, pos):
        """
        Check if a button was clicked and toggle the corresponding flag.
        
        Args:
            pos (tuple): Mouse click position (x, y)
        """
        for button in self.buttons:
            if button['rect'].collidepoint(pos):
                if button['id'] == 0:
                    self.renderer.show_possible_moves = not self.renderer.show_possible_moves
                elif button['id'] == 1:
                    self.renderer.show_agent_position = not self.renderer.show_agent_position
                elif button['id'] == 2:
                    self.renderer.show_agent_vision = not self.renderer.show_agent_vision

    def draw(self, surface):
        """
        Draw the bottom panel with buttons and legend.
        
        Args:
            surface (pygame.Surface): The surface to draw on
        """
        super().draw(surface)
        
        # Draw buttons
        for button in self.buttons:
            is_active = False
            if button['id'] == 0 and self.renderer.show_possible_moves:
                is_active = True
            elif button['id'] == 1 and self.renderer.show_agent_position:
                is_active = True
            elif button['id'] == 2 and self.renderer.show_agent_vision:
                is_active = True

            # Draw button background
            color = COLOR_TEAM_BLUE if is_active else COLOR_HP_BAR_BG
            pygame.draw.rect(surface, color, button['rect'], border_radius=5)
            
            # Draw button border
            pygame.draw.rect(surface, COLOR_TEXT, button['rect'], 1, border_radius=5)

            # Draw button text
            text_surf = self.font_small.render(button['text'], True, COLOR_TEXT)
            text_rect = text_surf.get_rect(center=button['rect'].center)
            surface.blit(text_surf, text_rect)
        
        # Draw Legend
        legend_items = [
            ("Possible Moves", COLOR_DEBUG_POSSIBLE_MOVES),
            ("Agent Position", COLOR_DEBUG_AGENT_POSITION),
            ("Agent Vision", COLOR_DEBUG_AGENT_VISION),
        ]
        
        legend_y = self.rect.y + 60
        legend_x = self.rect.x + 20
        
        for text, color in legend_items:
            # Draw color swatch
            swatch_rect = pygame.Rect(legend_x, legend_y, 20, 20)
            pygame.draw.rect(surface, color, swatch_rect)
            
            # Draw text
            text_surf = self.font_small.render(text, True, COLOR_TEXT)
            surface.blit(text_surf, (legend_x + 30, legend_y + 2))
            
            legend_x += 180