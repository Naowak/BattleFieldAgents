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
from ui_components import LeftPanel, RightPanel
from actions import parse_action_string
from ai_interface import AIInterface, MockAIInterface


class Game:
    """
    Main game class.
    Handles game loop, input, and coordination between components.
    """
    
    def __init__(self, use_mock_ai=False):
        """
        Initialize the game.
        
        Args:
            use_mock_ai (bool): Use mock AI instead of real API
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
        
        # Game state
        self.game_state = GameState()
        
        # Renderer
        self.renderer = GameRenderer(self.game_state)
        
        # UI Panels
        self.left_panel = LeftPanel(self.game_state)
        self.right_panel = RightPanel()
        
        # AI Interface
        if use_mock_ai:
            self.ai_interface = MockAIInterface()
            print("Using Mock AI (no API required)")
        else:
            self.ai_interface = AIInterface()
            print(f"Using AI API at {self.ai_interface.api_url}")
        
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
                
                # ESC - Quit
                elif event.key == pygame.K_ESCAPE:
                    self.running = False
                
                # N - Next action (manual step)
                elif event.key == pygame.K_n and not self.game_state.game_over:
                    if not self.game_state.action_queue.is_busy():
                        self.request_next_action()
            
            elif event.type == pygame.MOUSEMOTION:
                # Handle mouse hover for agent cards
                self.left_panel.handle_mouse_motion(event.pos)
    
    def restart_game(self):
        """Restart the game with a new initial state."""
        print("\n=== RESTARTING GAME ===\n")
        self.game_state.reset_game()
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
        
        # Request decision from AI
        try:
            thoughts, action = self.ai_interface.get_agent_decision(
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
                    
                    # Move to next action
                    self.game_state.next_action()
                    
                    # Update UI
                    self.left_panel.update_cards()
                    
                    # Check win condition
                    self.game_state.check_win_condition()
                else:
                    print(f"Invalid action: {action}")
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
        self.game_state.action_queue.update(dt, self.game_state)
        
        # If no action is animating and not waiting for AI, request next action
        if not self.game_state.action_queue.is_busy() and not self.waiting_for_ai:
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
        
        # Render game grid and entities
        self.renderer.render(self.screen)
        
        # Render UI panels
        self.left_panel.draw(self.screen)
        self.right_panel.draw(self.screen)
        
        # Draw pause indicator
        if self.paused:
            font = pygame.font.Font(None, 48)
            pause_text = font.render("PAUSED", True, COLOR_TEXT)
            text_rect = pause_text.get_rect(center=(WINDOW_WIDTH // 2, 50))
            
            # Background
            bg_rect = text_rect.inflate(20, 10)
            pygame.draw.rect(self.screen, COLOR_PANEL_BG, bg_rect)
            pygame.draw.rect(self.screen, COLOR_TEXT, bg_rect, 2)
            
            self.screen.blit(pause_text, text_rect)
        
        # Update display
        pygame.display.flip()
    
    def run(self):
        """Main game loop."""
        print("=" * 60)
        print("BattleField Agents - Pygame 2D Version")
        print("=" * 60)
        print("\nControls:")
        print("  SPACE  - Pause/Unpause")
        print("  R      - Restart game")
        print("  N      - Next action (manual)")
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
    parser.add_argument('--mock-ai', action='store_true', 
                       help='Use mock AI instead of real API')
    
    args = parser.parse_args()
    
    try:
        game = Game(use_mock_ai=args.mock_ai)
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
