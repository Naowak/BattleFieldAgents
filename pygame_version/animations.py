"""
Animation Management System for BattleField Agents

This module provides a comprehensive animation system for managing sprite animations,
particle effects, and visual transitions in the pygame version.
"""

import pygame
from typing import List, Dict, Tuple, Optional, Callable
from enum import Enum
import math


class AnimationState(Enum):
    """Enumeration of possible animation states"""
    IDLE = "idle"
    WALKING = "walking"
    RUNNING = "running"
    ATTACKING = "attacking"
    TAKING_DAMAGE = "taking_damage"
    DYING = "dying"
    DEAD = "dead"


class Animation:
    """
    Base animation class that handles frame-based sprite animations
    """
    
    def __init__(self, frames: List[pygame.Surface], frame_duration: int = 100,
                 loop: bool = True, on_complete: Optional[Callable] = None):
        """
        Initialize an animation
        
        Args:
            frames: List of pygame Surface objects representing animation frames
            frame_duration: Duration of each frame in milliseconds
            loop: Whether the animation should loop
            on_complete: Callback function to call when animation completes
        """
        self.frames = frames
        self.frame_duration = frame_duration
        self.loop = loop
        self.on_complete = on_complete
        
        self.current_frame = 0
        self.time_elapsed = 0
        self.is_playing = True
        self.is_finished = False
    
    def update(self, dt: int) -> None:
        """
        Update the animation state
        
        Args:
            dt: Delta time in milliseconds since last update
        """
        if not self.is_playing or self.is_finished:
            return
        
        self.time_elapsed += dt
        
        if self.time_elapsed >= self.frame_duration:
            self.time_elapsed = 0
            self.current_frame += 1
            
            if self.current_frame >= len(self.frames):
                if self.loop:
                    self.current_frame = 0
                else:
                    self.current_frame = len(self.frames) - 1
                    self.is_finished = True
                    self.is_playing = False
                    
                    if self.on_complete:
                        self.on_complete()
    
    def get_current_frame(self) -> pygame.Surface:
        """Get the current frame surface"""
        return self.frames[self.current_frame]
    
    def reset(self) -> None:
        """Reset the animation to the beginning"""
        self.current_frame = 0
        self.time_elapsed = 0
        self.is_playing = True
        self.is_finished = False
    
    def play(self) -> None:
        """Start or resume playing the animation"""
        self.is_playing = True
    
    def pause(self) -> None:
        """Pause the animation"""
        self.is_playing = False
    
    def stop(self) -> None:
        """Stop and reset the animation"""
        self.pause()
        self.reset()


class AnimationController:
    """
    Controls multiple animations and transitions between them
    """
    
    def __init__(self):
        """Initialize the animation controller"""
        self.animations: Dict[str, Animation] = {}
        self.current_animation: Optional[str] = None
        self.default_animation: Optional[str] = None
    
    def add_animation(self, name: str, animation: Animation, 
                     is_default: bool = False) -> None:
        """
        Add an animation to the controller
        
        Args:
            name: Unique name for the animation
            animation: Animation object
            is_default: Whether this should be the default animation
        """
        self.animations[name] = animation
        
        if is_default or self.default_animation is None:
            self.default_animation = name
            if self.current_animation is None:
                self.current_animation = name
    
    def play_animation(self, name: str, force_restart: bool = False) -> bool:
        """
        Play a specific animation
        
        Args:
            name: Name of the animation to play
            force_restart: Whether to restart if already playing
            
        Returns:
            True if animation was started, False if animation doesn't exist
        """
        if name not in self.animations:
            return False
        
        if self.current_animation != name or force_restart:
            if self.current_animation and self.current_animation in self.animations:
                self.animations[self.current_animation].stop()
            
            self.current_animation = name
            self.animations[name].reset()
            self.animations[name].play()
        
        return True
    
    def update(self, dt: int) -> None:
        """
        Update the current animation
        
        Args:
            dt: Delta time in milliseconds
        """
        if self.current_animation and self.current_animation in self.animations:
            animation = self.animations[self.current_animation]
            animation.update(dt)
            
            # If animation finished and not looping, return to default
            if animation.is_finished and not animation.loop:
                if self.default_animation and self.default_animation != self.current_animation:
                    self.play_animation(self.default_animation)
    
    def get_current_frame(self) -> Optional[pygame.Surface]:
        """Get the current frame from the active animation"""
        if self.current_animation and self.current_animation in self.animations:
            return self.animations[self.current_animation].get_current_frame()
        return None
    
    def get_current_animation_name(self) -> Optional[str]:
        """Get the name of the currently playing animation"""
        return self.current_animation


class Particle:
    """
    Individual particle for particle effects
    """
    
    def __init__(self, position: Tuple[float, float], velocity: Tuple[float, float],
                 color: Tuple[int, int, int], size: float, lifetime: int,
                 fade: bool = True, gravity: float = 0.0):
        """
        Initialize a particle
        
        Args:
            position: Starting (x, y) position
            velocity: (vx, vy) velocity vector
            color: RGB color tuple
            size: Particle radius
            lifetime: Lifetime in milliseconds
            fade: Whether particle should fade out
            gravity: Gravity acceleration (positive = downward)
        """
        self.x, self.y = position
        self.vx, self.vy = velocity
        self.color = color
        self.size = size
        self.max_lifetime = lifetime
        self.lifetime = lifetime
        self.fade = fade
        self.gravity = gravity
        self.is_alive = True
    
    def update(self, dt: int) -> None:
        """
        Update particle state
        
        Args:
            dt: Delta time in milliseconds
        """
        if not self.is_alive:
            return
        
        # Update position
        dt_seconds = dt / 1000.0
        self.x += self.vx * dt_seconds
        self.y += self.vy * dt_seconds
        
        # Apply gravity
        self.vy += self.gravity * dt_seconds
        
        # Update lifetime
        self.lifetime -= dt
        if self.lifetime <= 0:
            self.is_alive = False
    
    def render(self, surface: pygame.Surface, camera_offset: Tuple[int, int] = (0, 0)) -> None:
        """
        Render the particle
        
        Args:
            surface: Surface to render on
            camera_offset: (x, y) camera offset for scrolling
        """
        if not self.is_alive:
            return
        
        # Calculate alpha if fading
        alpha = 255
        if self.fade:
            alpha = int(255 * (self.lifetime / self.max_lifetime))
        
        # Create particle surface with alpha
        particle_surface = pygame.Surface((int(self.size * 2), int(self.size * 2)), pygame.SRCALPHA)
        color_with_alpha = (*self.color, alpha)
        pygame.draw.circle(particle_surface, color_with_alpha, 
                         (int(self.size), int(self.size)), int(self.size))
        
        # Render to screen
        screen_pos = (int(self.x - camera_offset[0] - self.size),
                     int(self.y - camera_offset[1] - self.size))
        surface.blit(particle_surface, screen_pos)


class ParticleSystem:
    """
    Manages a collection of particles
    """
    
    def __init__(self, max_particles: int = 1000):
        """
        Initialize the particle system
        
        Args:
            max_particles: Maximum number of particles to manage
        """
        self.particles: List[Particle] = []
        self.max_particles = max_particles
    
    def emit(self, position: Tuple[float, float], count: int = 1,
             velocity_range: Tuple[Tuple[float, float], Tuple[float, float]] = ((-50, 50), (-50, 50)),
             color: Tuple[int, int, int] = (255, 255, 255),
             size_range: Tuple[float, float] = (2, 5),
             lifetime_range: Tuple[int, int] = (500, 1500),
             fade: bool = True, gravity: float = 0.0) -> None:
        """
        Emit particles
        
        Args:
            position: Emission position (x, y)
            count: Number of particles to emit
            velocity_range: ((min_vx, max_vx), (min_vy, max_vy))
            color: RGB color tuple
            size_range: (min_size, max_size)
            lifetime_range: (min_lifetime, max_lifetime) in milliseconds
            fade: Whether particles should fade
            gravity: Gravity acceleration
        """
        import random
        
        for _ in range(count):
            if len(self.particles) >= self.max_particles:
                break
            
            vx = random.uniform(*velocity_range[0])
            vy = random.uniform(*velocity_range[1])
            size = random.uniform(*size_range)
            lifetime = random.randint(*lifetime_range)
            
            particle = Particle(position, (vx, vy), color, size, lifetime, fade, gravity)
            self.particles.append(particle)
    
    def emit_explosion(self, position: Tuple[float, float], count: int = 20,
                      color: Tuple[int, int, int] = (255, 100, 0)) -> None:
        """
        Emit an explosion effect
        
        Args:
            position: Explosion center
            count: Number of particles
            color: Particle color
        """
        import random
        
        for _ in range(count):
            if len(self.particles) >= self.max_particles:
                break
            
            angle = random.uniform(0, 2 * math.pi)
            speed = random.uniform(50, 200)
            vx = math.cos(angle) * speed
            vy = math.sin(angle) * speed
            
            size = random.uniform(3, 8)
            lifetime = random.randint(300, 800)
            
            particle = Particle(position, (vx, vy), color, size, lifetime, True, 100)
            self.particles.append(particle)
    
    def update(self, dt: int) -> None:
        """
        Update all particles
        
        Args:
            dt: Delta time in milliseconds
        """
        # Update particles
        for particle in self.particles:
            particle.update(dt)
        
        # Remove dead particles
        self.particles = [p for p in self.particles if p.is_alive]
    
    def render(self, surface: pygame.Surface, camera_offset: Tuple[int, int] = (0, 0)) -> None:
        """
        Render all particles
        
        Args:
            surface: Surface to render on
            camera_offset: Camera offset for scrolling
        """
        for particle in self.particles:
            particle.render(surface, camera_offset)
    
    def clear(self) -> None:
        """Clear all particles"""
        self.particles.clear()


class Tween:
    """
    Simple tweening/easing system for smooth transitions
    """
    
    @staticmethod
    def linear(t: float) -> float:
        """Linear interpolation"""
        return t
    
    @staticmethod
    def ease_in_quad(t: float) -> float:
        """Quadratic ease in"""
        return t * t
    
    @staticmethod
    def ease_out_quad(t: float) -> float:
        """Quadratic ease out"""
        return t * (2 - t)
    
    @staticmethod
    def ease_in_out_quad(t: float) -> float:
        """Quadratic ease in-out"""
        return 2 * t * t if t < 0.5 else -1 + (4 - 2 * t) * t
    
    @staticmethod
    def ease_in_cubic(t: float) -> float:
        """Cubic ease in"""
        return t * t * t
    
    @staticmethod
    def ease_out_cubic(t: float) -> float:
        """Cubic ease out"""
        t -= 1
        return t * t * t + 1
    
    @staticmethod
    def ease_in_out_cubic(t: float) -> float:
        """Cubic ease in-out"""
        return 4 * t * t * t if t < 0.5 else (t - 1) * (2 * t - 2) * (2 * t - 2) + 1


class ValueAnimator:
    """
    Animates a numeric value over time using easing functions
    """
    
    def __init__(self, start_value: float, end_value: float, duration: int,
                 easing_function: Callable[[float], float] = Tween.linear,
                 on_complete: Optional[Callable] = None):
        """
        Initialize value animator
        
        Args:
            start_value: Starting value
            end_value: Target value
            duration: Animation duration in milliseconds
            easing_function: Easing function to use
            on_complete: Callback when animation completes
        """
        self.start_value = start_value
        self.end_value = end_value
        self.duration = duration
        self.easing_function = easing_function
        self.on_complete = on_complete
        
        self.current_value = start_value
        self.elapsed_time = 0
        self.is_playing = True
        self.is_finished = False
    
    def update(self, dt: int) -> None:
        """
        Update the animation
        
        Args:
            dt: Delta time in milliseconds
        """
        if not self.is_playing or self.is_finished:
            return
        
        self.elapsed_time += dt
        
        if self.elapsed_time >= self.duration:
            self.current_value = self.end_value
            self.is_finished = True
            self.is_playing = False
            
            if self.on_complete:
                self.on_complete()
        else:
            t = self.elapsed_time / self.duration
            eased_t = self.easing_function(t)
            self.current_value = self.start_value + (self.end_value - self.start_value) * eased_t
    
    def get_value(self) -> float:
        """Get the current animated value"""
        return self.current_value
    
    def reset(self) -> None:
        """Reset the animation"""
        self.current_value = self.start_value
        self.elapsed_time = 0
        self.is_playing = True
        self.is_finished = False


# Example usage and helper functions
def create_sprite_sheet_animation(sprite_sheet: pygame.Surface, frame_width: int,
                                  frame_height: int, frame_count: int,
                                  row: int = 0, frame_duration: int = 100,
                                  loop: bool = True) -> Animation:
    """
    Create an animation from a sprite sheet
    
    Args:
        sprite_sheet: The sprite sheet surface
        frame_width: Width of each frame
        frame_height: Height of each frame
        frame_count: Number of frames to extract
        row: Which row of the sprite sheet to use
        frame_duration: Duration of each frame in ms
        loop: Whether to loop the animation
        
    Returns:
        Animation object
    """
    frames = []
    for i in range(frame_count):
        frame = sprite_sheet.subsurface(
            pygame.Rect(i * frame_width, row * frame_height, frame_width, frame_height)
        )
        frames.append(frame)
    
    return Animation(frames, frame_duration, loop)
