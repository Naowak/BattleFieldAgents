"""
BattleFieldAgents - Pygame 2D Version
Main game loop and entry point.

A tactical turn-based game where AI agents battle on a grid-based battlefield.
Agents can move, attack, and communicate with teammates.
"""

import pygame
import sys
import time
from constants import *
from game_state import GameState
from renderer import GameRenderer
from ui_components import LeftPanel, RightPanel, BottomPanel
from actions import parse_action_string
import ai_interface  # Import module to access classes dynamically
from utils import get_visible_cells


class Game:
    """
    Main game class.
    Handles game loop, input, and coordination between components.
    """
    
    def __init__(self, red_ai_class="MockAIInterface", blue_ai_class="MockAIInterface", use_manual_mode=False, nb_bonuses=NB_BONUS):
        """
        Initialize the game.
        
        Args:
            red_ai_class (str): Name of the AI class for Red team
            blue_ai_class (str): Name of the AI class for Blue team
            use_manual_mode (bool): Start in manual mode
            nb_bonuses (int): Number of bonuses to generate
        """
        # Initialize Pygame
        pygame.init()
        
        # Create window
        self.screen = pygame.display.set_mode((WINDOW_WIDTH, WINDOW_HEIGHT))
        pygame.display.set_caption("BattleField Agents - 2D Version")
        
        # Clock for frame rate
        self.clock = pygame.time.Clock()
        self.running = True
        self.paused = False
        self.is_manual_mode = use_manual_mode
        self.nb_bonuses = nb_bonuses
        
        # Game state
        self.game_state = GameState(nb_bonuses=self.nb_bonuses)
        
        # Renderer
        self.renderer = GameRenderer(self.game_state)
        
        # UI Panels
        self.left_panel = LeftPanel(self.game_state)
        self.right_panel = RightPanel()
        self.bottom_panel = BottomPanel(
            LEFT_PANEL_WIDTH,
            WINDOW_HEIGHT - 120,
            GRID_AREA_WIDTH,
            120,
            self.renderer
        )
        
        # Initialize AI interfaces for each team
        try:
            RedAIClass = getattr(ai_interface, red_ai_class)
            self.red_ai = RedAIClass()
            print(f"Red Team AI: {red_ai_class}")
        except AttributeError:
            print(f"Error: AI class '{red_ai_class}' not found in ai_interface.py. Defaulting to MockAIInterface.")
            self.red_ai = ai_interface.MockAIInterface()

        try:
            BlueAIClass = getattr(ai_interface, blue_ai_class)
            self.blue_ai = BlueAIClass()
            print(f"Blue Team AI: {blue_ai_class}")
        except AttributeError:
            print(f"Error: AI class '{blue_ai_class}' not found in ai_interface.py. Defaulting to MockAIInterface.")
            self.blue_ai = ai_interface.MockAIInterface()
        
        # Game state flags
        self.waiting_for_ai = False
        self.ai_request_time = None
        
        # Update UI
        self.left_panel.update_cards()
    
    def handle_events(self):
        """Handle pygame events (keyboard, mouse, etc.)."""
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                self.running = False
            
            elif event.type == pygame.KEYDOWN:
                # R - Restart game
                if event.key == pygame.K_r:
                    self.restart_game()
                
                # SPACE - Pause/unpause
                elif event.key == pygame.K_SPACE:
                    self.paused = not self.paused
                
                # M - Toggle manual/auto mode
                elif event.key == pygame.K_m:
                    self.is_manual_mode = not self.is_manual_mode
                    print(f"Game mode set to {'MANUAL' if self.is_manual_mode else 'AUTOMATIC'}")

                # ESC - Quit
                elif event.key == pygame.K_ESCAPE:
                    self.running = False
                
                # N - Next action (manual step)
                elif event.key == pygame.K_n and not self.game_state.game_over:
                    if self.is_manual_mode and not self.game_state.action_queue.is_busy():
                        self.request_next_action()
            
            elif event.type == pygame.MOUSEBUTTONDOWN:
                if event.button == 1: # Left click
                    self.bottom_panel.handle_mouse_click(event.pos)

            elif event.type == pygame.MOUSEMOTION:
                # Handle mouse hover for agent cards
                self.left_panel.handle_mouse_motion(event.pos)
            
            elif event.type == pygame.MOUSEWHEEL:
                mouse_pos = pygame.mouse.get_pos()
                if self.right_panel.rect.collidepoint(mouse_pos):
                    self.right_panel.handle_scroll(event.y)
    
    def restart_game(self):
        """Restart the game with a new initial state."""
        print("\n=== RESTARTING GAME ===\n")
        # Re-initialize game state with original params
        self.game_state.__init__(nb_bonuses=self.nb_bonuses)
        
        self.left_panel.update_cards()
        self.right_panel.clear_bubbles()
        self.waiting_for_ai = False
    
    def request_next_action(self):
        """Request the next action from the AI for the current agent."""
        if self.waiting_for_ai or self.game_state.game_over:
            return
        
        current_agent = self.game_state.get_current_agent()
        if not current_agent:
            return
        
        print(f"\n--- Turn {self.game_state.turn['current']} - {current_agent.id} (Action {self.game_state.turn['action_count'] + 1}/{NB_ACTIONS_PER_TURN}) ---")
        
        # Set waiting flag
        self.waiting_for_ai = True
        self.ai_request_time = time.time()
        
        # Select AI based on team
        ai_interface_instance = self.red_ai if current_agent.team == 'red' else self.blue_ai
        
        # Request decision from AI
        try:
            thoughts, action = ai_interface_instance.get_agent_decision(
                current_agent,
                self.game_state.turn,
                self.game_state
            )
            
            if thoughts and action:
                print(f"Thoughts: {thoughts}")
                print(f"Action: {action}")
                
                # Add to historic
                current_agent.add_historic_entry(
                    self.game_state.turn['current'],
                    self.game_state.turn['action_count'] + 1,
                    thoughts,
                    action
                )
                
                # Add thought bubble to UI
                self.right_panel.add_thought_bubble(
                    current_agent.id,
                    current_agent.team,
                    thoughts,
                    action
                )
                
                # Parse and execute action
                action_obj = parse_action_string(action, current_agent.id, self.game_state)
                
                if action_obj:
                    # Add to action queue
                    self.game_state.action_queue.add_action(action_obj)
                    
                else:
                    print(f"Invalid action: {action}")
                    self.game_state.next_action()  # Skip invalid action
            else:
                print("AI returned no action")
        
        except Exception as e:
            print(f"Error getting AI decision: {e}")
        
        finally:
            self.waiting_for_ai = False
    
    def update(self, dt):
        """
        Update game state.
        
        Args:
            dt (float): Delta time in seconds
        """
        if self.paused or self.game_state.game_over:
            return
        
        # Update action queue (animations)
        action_completed = self.game_state.action_queue.update(dt, self.game_state)
        
        # Check for system notifications from game state
        while self.game_state.notifications:
            msg = self.game_state.notifications.pop(0)
            self.right_panel.add_system_message(msg)
        
        if action_completed:
            # Check win condition after action execution (damage applied)
            self.game_state.check_win_condition()
            
            if not self.game_state.game_over:
                # Move to next action/turn
                self.game_state.next_action()
                
                # Update UI
                self.left_panel.update_cards()
        
        # If no action is animating and not waiting for AI, request next action
        if not self.is_manual_mode and not self.game_state.action_queue.is_busy() and not self.waiting_for_ai:
            if not self.game_state.action_queue.has_pending_actions():
                # Small delay before next action to allow player to see the board
                if not hasattr(self, 'action_delay_timer'):
                    self.action_delay_timer = 0.5  # 0.5 second delay
                
                self.action_delay_timer -= dt
                
                if self.action_delay_timer <= 0:
                    self.request_next_action()
                    self.action_delay_timer = 0.5
    
    def render(self):
        """Render the game."""
        # Clear screen
        self.screen.fill(COLOR_BG)

        # Update debug cache (vision and possible moves)
        self.renderer.update_debug_cache()
        
        # Render game grid and entities
        self.renderer.render(self.screen)
        
        # Render UI panels
        self.left_panel.draw(self.screen)
        self.right_panel.draw(self.screen)
        self.bottom_panel.draw(self.screen)
        
        # Draw pause/manual indicators
        if self.paused or self.is_manual_mode:
            font = pygame.font.Font(None, 48)
            mode_text = "PAUSED" if self.paused else "MANUAL MODE"
            
            text_surf = font.render(mode_text, True, COLOR_TEXT)
            center = LEFT_PANEL_WIDTH + (WINDOW_WIDTH - (LEFT_PANEL_WIDTH + RIGHT_PANEL_WIDTH)) // 2
            text_rect = text_surf.get_rect(center=(center, 50))

            # Background
            bg_rect = text_rect.inflate(20, 10)
            pygame.draw.rect(self.screen, COLOR_PANEL_BG, bg_rect)
            pygame.draw.rect(self.screen, COLOR_TEXT, bg_rect, 2)
            
            self.screen.blit(text_surf, text_rect)
        
        # Update display
        pygame.display.flip()
    
    def run(self):
        """Main game loop."""
        print("=" * 60)
        print("BattleField Agents - Pygame 2D Version")
        print("=" * 60)
        print("\nControls:")
        print("  SPACE  - Pause/Unpause")
        print("  M      - Toggle Manual/Auto mode")
        print("  N      - Next action (in Manual mode)")
        print("  R      - Restart game")
        print("  ESC    - Quit")
        print("\nStarting game...\n")
        
        last_time = time.time()
        
        while self.running:
            # Calculate delta time
            current_time = time.time()
            dt = current_time - last_time
            last_time = current_time
            
            # Handle events
            self.handle_events()
            
            # Update game
            self.update(dt)
            
            # Render
            self.render()
            
            # Cap frame rate
            self.clock.tick(FPS)
        
        # Cleanup
        pygame.quit()
        print("\nGame ended. Thanks for playing!")


def main():
    """Entry point for the game."""
    import argparse
    
    parser = argparse.ArgumentParser(description="BattleField Agents - 2D Pygame Version")
    parser.add_argument('--red-ai', type=str, default="MockAIInterface",
                       help='AI class name for Red team (default: MockAIInterface)')
    parser.add_argument('--blue-ai', type=str, default="MockAIInterface",
                       help='AI class name for Blue team (default: MockAIInterface)')
    parser.add_argument('--manual', action='store_true',
                       help='Start in manual mode (press N for next action)')
    parser.add_argument('--bonuses', type=int, default=NB_BONUS,
                       help='Number of bonus/malus items to generate (default: %(default)s)')
    
    args = parser.parse_args()
    
    try:
        game = Game(
            red_ai_class=args.red_ai,
            blue_ai_class=args.blue_ai,
            use_manual_mode=args.manual,
            nb_bonuses=args.bonuses
        )
        game.run()
    except KeyboardInterrupt:
        print("\n\nGame interrupted by user")
        sys.exit(0)
    except Exception as e:
        print(f"\nError: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)


if __name__ == "__main__":
    main()
