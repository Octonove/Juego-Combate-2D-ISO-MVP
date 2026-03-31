// Game constants
export const GAME_WIDTH = 1280;
export const GAME_HEIGHT = 720;

// Isometric tile dimensions
export const TILE_WIDTH = 64;
export const TILE_HEIGHT = 32;

// Arena size in tiles
export const ARENA_COLS = 20;
export const ARENA_ROWS = 20;

// Arena boundary (tiles from edge that are lava)
export const LAVA_BORDER = 2;

// Map offset to center the arena
export const MAP_OFFSET_X = GAME_WIDTH / 2;
export const MAP_OFFSET_Y = 120;

// Power-up types
export const POWERUP_TYPES = {
    STRENGTH: { name: 'Fuerza', color: 0xff4444, duration: 15000, icon: 'fb100.png', multiplier: { attackDamage: 1.5, knockbackForce: 1.5 } },
    SPEED: { name: 'Velocidad', color: 0x4444ff, duration: 15000, icon: 'fb101.png', multiplier: { speed: 1.5 } },
    HEAL: { name: 'Curación', color: 0x44ff44, duration: 0, icon: 'fb1000.png', healAmount: 40 },
    SHIELD: { name: 'Escudo', color: 0xffff44, duration: 15000, icon: 'fb1001.png', multiplier: { knockbackResist: 0.5 } }
};

// Power-up spawn interval (ms)
export const POWERUP_SPAWN_INTERVAL = 12000;
export const MAX_POWERUPS = 4;

// Physics
export const KNOCKBACK_FRICTION = 0.92;
export const GRAVITY_FALL = 400;

// Teams
export const TEAM_PLAYER = 'player';
export const TEAM_ENEMY = 'enemy';
