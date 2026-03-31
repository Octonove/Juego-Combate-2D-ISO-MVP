import Phaser from 'phaser';
import {
    TILE_WIDTH, TILE_HEIGHT,
    ARENA_COLS, ARENA_ROWS,
    LAVA_BORDER,
    MAP_OFFSET_X, MAP_OFFSET_Y
} from '../config/constants.js';

export class IsometricMap {
    constructor(scene) {
        this.scene = scene;
        this.tileWidth = TILE_WIDTH;
        this.tileHeight = TILE_HEIGHT;
        this.cols = ARENA_COLS;
        this.rows = ARENA_ROWS;
        this.lavaBorder = LAVA_BORDER;
        this.offsetX = MAP_OFFSET_X;
        this.offsetY = MAP_OFFSET_Y;
        this.tileSprites = [];
        this.lavaParticles = null;

        // Arena tile types
        this.TILE_ARENA = 0;      // playable floor
        this.TILE_LAVA = 1;       // lava border (death zone)
        this.TILE_EDGE = 2;       // edge decoration

        this.mapData = this.generateMapData();
    }

    generateMapData() {
        const map = [];
        for (let row = 0; row < this.rows; row++) {
            map[row] = [];
            for (let col = 0; col < this.cols; col++) {
                const isLavaBorder =
                    row < this.lavaBorder || row >= this.rows - this.lavaBorder ||
                    col < this.lavaBorder || col >= this.cols - this.lavaBorder;
                const isEdge =
                    row === this.lavaBorder || row === this.rows - this.lavaBorder - 1 ||
                    col === this.lavaBorder || col === this.cols - this.lavaBorder - 1;

                if (isLavaBorder) {
                    map[row][col] = this.TILE_LAVA;
                } else if (isEdge) {
                    map[row][col] = this.TILE_EDGE;
                } else {
                    map[row][col] = this.TILE_ARENA;
                }
            }
        }
        return map;
    }

    render() {
        // Render lava background glow first (under everything)
        this.renderLavaBackground();

        // Render tiles
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                const { x, y } = this.tileToScreen(col, row);
                const tileType = this.mapData[row][col];
                this.renderTile(x, y, col, row, tileType);
            }
        }

        // Add lava particle effects
        this.createLavaParticles();
    }

    renderLavaBackground() {
        const gfx = this.scene.add.graphics();
        gfx.setDepth(-10);

        // Draw a big lava pool beneath the arena
        const corners = [
            this.tileToScreen(0, 0),
            this.tileToScreen(this.cols, 0),
            this.tileToScreen(this.cols, this.rows),
            this.tileToScreen(0, this.rows)
        ];

        // Expand the lava area beyond the arena
        const expand = 80;
        gfx.fillStyle(0x8b0000, 0.9);
        gfx.beginPath();
        gfx.moveTo(corners[0].x, corners[0].y - expand);
        gfx.lineTo(corners[1].x + expand, corners[1].y);
        gfx.lineTo(corners[2].x, corners[2].y + expand);
        gfx.lineTo(corners[3].x - expand, corners[3].y);
        gfx.closePath();
        gfx.fillPath();

        // Inner glow
        gfx.fillStyle(0xcc2200, 0.5);
        gfx.beginPath();
        gfx.moveTo(corners[0].x, corners[0].y - expand / 2);
        gfx.lineTo(corners[1].x + expand / 2, corners[1].y);
        gfx.lineTo(corners[2].x, corners[2].y + expand / 2);
        gfx.lineTo(corners[3].x - expand / 2, corners[3].y);
        gfx.closePath();
        gfx.fillPath();

        // Animated glow
        this.scene.tweens.add({
            targets: gfx,
            alpha: { from: 0.8, to: 1 },
            duration: 1500,
            ease: 'Sine.easeInOut',
            yoyo: true,
            repeat: -1
        });
    }

    renderTile(screenX, screenY, col, row, tileType) {
        let tileIndex;
        let tintColor = null;

        if (tileType === this.TILE_LAVA) {
            // Use water-like tiles tinted as lava
            const lavaIndices = [82, 83, 84, 85]; // dark water tiles
            tileIndex = lavaIndices[(col + row) % lavaIndices.length];
            tintColor = 0xff4400;
        } else if (tileType === this.TILE_EDGE) {
            // Stone border tiles
            const edgeIndices = [7, 8, 9, 10]; // stone tiles
            tileIndex = edgeIndices[(col + row) % edgeIndices.length];
            tintColor = 0xccbbaa;
        } else {
            // Arena floor - varied stone tiles
            const floorIndices = [0, 1, 2, 3, 4, 5]; // stone floor tiles
            tileIndex = floorIndices[(col * 7 + row * 3) % floorIndices.length];
        }

        const sprite = this.scene.add.sprite(screenX, screenY, 'tiles', tileIndex);
        sprite.setScale(2);
        sprite.setDepth(row + col);

        if (tintColor) {
            sprite.setTint(tintColor);
        }

        // Lava tiles pulsate
        if (tileType === this.TILE_LAVA) {
            this.scene.tweens.add({
                targets: sprite,
                alpha: { from: 0.7, to: 1 },
                duration: 800 + Math.random() * 600,
                ease: 'Sine.easeInOut',
                yoyo: true,
                repeat: -1,
                delay: Math.random() * 800
            });
        }

        this.tileSprites.push(sprite);
        return sprite;
    }

    createLavaParticles() {
        // Create ember particles rising from lava border
        for (let i = 0; i < 4; i++) {
            const side = i; // 0=top, 1=right, 2=bottom, 3=left
            let x, y;

            // Pick positions along the lava borders
            for (let j = 0; j < 3; j++) {
                const t = (j + 0.5) / 3;
                if (side === 0) {
                    const pos = this.tileToScreen(t * this.cols, 0);
                    x = pos.x; y = pos.y;
                } else if (side === 1) {
                    const pos = this.tileToScreen(this.cols, t * this.rows);
                    x = pos.x; y = pos.y;
                } else if (side === 2) {
                    const pos = this.tileToScreen(t * this.cols, this.rows);
                    x = pos.x; y = pos.y;
                } else {
                    const pos = this.tileToScreen(0, t * this.rows);
                    x = pos.x; y = pos.y;
                }

                // Simple circle particle emitter
                const emitter = this.scene.add.particles(x, y, 'tiles', {
                    frame: [53],
                    lifespan: 2000,
                    speedY: { min: -30, max: -60 },
                    speedX: { min: -15, max: 15 },
                    scale: { start: 0.3, end: 0 },
                    alpha: { start: 0.8, end: 0 },
                    tint: [0xff4400, 0xff6600, 0xffaa00],
                    frequency: 800,
                    quantity: 1
                });
                emitter.setDepth(1000);
            }
        }
    }

    // Convert tile coordinates to screen (isometric) coordinates
    tileToScreen(col, row) {
        const x = (col - row) * (this.tileWidth / 2) + this.offsetX;
        const y = (col + row) * (this.tileHeight / 2) + this.offsetY;
        return { x, y };
    }

    // Convert screen coordinates to tile coordinates
    screenToTile(screenX, screenY) {
        const adjustedX = screenX - this.offsetX;
        const adjustedY = screenY - this.offsetY;
        const col = (adjustedX / (this.tileWidth / 2) + adjustedY / (this.tileHeight / 2)) / 2;
        const row = (adjustedY / (this.tileHeight / 2) - adjustedX / (this.tileWidth / 2)) / 2;
        return { col: Math.floor(col), row: Math.floor(row) };
    }

    // Check if world position is on valid arena floor
    isOnArena(screenX, screenY) {
        const { col, row } = this.screenToTile(screenX, screenY);
        if (col < 0 || col >= this.cols || row < 0 || row >= this.rows) return false;
        return this.mapData[row]?.[col] === this.TILE_ARENA || this.mapData[row]?.[col] === this.TILE_EDGE;
    }

    // Check if world position is on lava
    isOnLava(screenX, screenY) {
        const { col, row } = this.screenToTile(screenX, screenY);
        if (col < 0 || col >= this.cols || row < 0 || row >= this.rows) return true; // out of bounds = lava
        return this.mapData[row]?.[col] === this.TILE_LAVA;
    }

    // Get a random playable position on the arena
    getRandomArenaPosition(side = 'any') {
        const minCol = this.lavaBorder + 1;
        const maxCol = this.cols - this.lavaBorder - 2;
        const minRow = this.lavaBorder + 1;
        const maxRow = this.rows - this.lavaBorder - 2;

        let col, row;
        if (side === 'left') {
            col = Phaser.Math.Between(minCol, minCol + 4);
            row = Phaser.Math.Between(minRow, maxRow);
        } else if (side === 'right') {
            col = Phaser.Math.Between(maxCol - 4, maxCol);
            row = Phaser.Math.Between(minRow, maxRow);
        } else {
            col = Phaser.Math.Between(minCol, maxCol);
            row = Phaser.Math.Between(minRow, maxRow);
        }

        return this.tileToScreen(col, row);
    }

    // Get depth value for a screen y position
    getDepthForY(screenY) {
        return screenY;
    }

    // Get the arena bounds rectangle for camera clamping etc
    getArenaBounds() {
        const topLeft = this.tileToScreen(0, 0);
        const topRight = this.tileToScreen(this.cols, 0);
        const bottomRight = this.tileToScreen(this.cols, this.rows);
        const bottomLeft = this.tileToScreen(0, this.rows);

        return {
            minX: bottomLeft.x - 50,
            maxX: topRight.x + 50,
            minY: topLeft.y - 50,
            maxY: bottomRight.y + 50,
            centerX: (topLeft.x + bottomRight.x) / 2,
            centerY: (topLeft.y + bottomRight.y) / 2
        };
    }
}
