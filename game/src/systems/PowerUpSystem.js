import Phaser from 'phaser';
import { POWERUP_TYPES, POWERUP_SPAWN_INTERVAL, MAX_POWERUPS } from '../config/constants.js';

export class PowerUpSystem {
    constructor(scene) {
        this.scene = scene;
        this.spawnTimer = 0;
        this.powerUps = [];
    }

    update(delta) {
        this.spawnTimer += delta;

        // Spawn new power-ups periodically
        if (this.spawnTimer >= POWERUP_SPAWN_INTERVAL) {
            this.spawnTimer = 0;
            if (this.getActivePowerUps().length < MAX_POWERUPS) {
                this.spawnRandomPowerUp();
            }
        }

        // Check pickup collisions
        const characters = this.scene.characters || [];
        for (const pu of this.powerUps) {
            if (!pu.active) continue;

            for (const char of characters) {
                if (!char.alive || char.fallingToLava) continue;
                const dist = Phaser.Math.Distance.Between(char.x, char.y, pu.x, pu.y);
                if (dist < 35) {
                    this.collectPowerUp(pu, char);
                    break;
                }
            }
        }
    }

    spawnRandomPowerUp() {
        if (!this.scene.isoMap) return;

        const types = Object.values(POWERUP_TYPES);
        const type = types[Math.floor(Math.random() * types.length)];
        const pos = this.scene.isoMap.getRandomArenaPosition();

        this.createPowerUp(pos.x, pos.y, type);
    }

    createPowerUp(x, y, type) {
        const container = this.scene.add.container(x, y);
        container.setDepth(y - 1);

        // Glow circle
        const glow = this.scene.add.circle(0, 0, 18, type.color, 0.3);
        container.add(glow);

        // Icon background 
        const bgCircle = this.scene.add.circle(0, -5, 14, 0x222222, 0.8);
        bgCircle.setStrokeStyle(2, type.color, 0.9);
        container.add(bgCircle);

        // Icon (using a colored circle as fallback since we may not have the exact icon)
        const iconCircle = this.scene.add.circle(0, -5, 8, type.color, 0.9);
        container.add(iconCircle);

        // Type indicator letter
        const letters = { 'Fuerza': '⚔', 'Velocidad': '⚡', 'Curación': '♥', 'Escudo': '🛡' };
        const letter = letters[type.name] || '?';
        const label = this.scene.add.text(0, -6, letter, {
            fontSize: '10px',
            color: '#ffffff'
        }).setOrigin(0.5);
        container.add(label);

        // Floating animation
        this.scene.tweens.add({
            targets: container,
            y: y - 8,
            duration: 1000,
            ease: 'Sine.easeInOut',
            yoyo: true,
            repeat: -1
        });

        // Glow pulse
        this.scene.tweens.add({
            targets: glow,
            scaleX: 1.3,
            scaleY: 1.3,
            alpha: 0.15,
            duration: 800,
            ease: 'Sine.easeInOut',
            yoyo: true,
            repeat: -1
        });

        container.powerUpType = type;
        container.active = true;
        this.powerUps.push(container);

        // Auto-despawn after 20 seconds
        this.scene.time.delayedCall(20000, () => {
            if (container.active) {
                this.scene.tweens.add({
                    targets: container,
                    alpha: 0,
                    duration: 500,
                    onComplete: () => {
                        container.active = false;
                        container.destroy();
                    }
                });
            }
        });
    }

    collectPowerUp(pu, character) {
        pu.active = false;

        // Apply effect
        character.applyPowerUp(pu.powerUpType);

        // Collect animation - scale up and fade
        this.scene.tweens.add({
            targets: pu,
            scaleX: 1.5,
            scaleY: 1.5,
            alpha: 0,
            duration: 300,
            onComplete: () => pu.destroy()
        });

        // Show pickup text
        const pickupText = this.scene.add.text(pu.x, pu.y - 30, `✨ ${pu.powerUpType.name}!`, {
            fontFamily: '"Press Start 2P", monospace',
            fontSize: '10px',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5).setDepth(10000);

        this.scene.tweens.add({
            targets: pickupText,
            y: pickupText.y - 30,
            alpha: 0,
            duration: 1000,
            onComplete: () => pickupText.destroy()
        });
    }

    getActivePowerUps() {
        return this.powerUps.filter(p => p.active);
    }
}
