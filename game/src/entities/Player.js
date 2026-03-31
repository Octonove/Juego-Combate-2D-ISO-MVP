import { Character } from './Character.js';

export class Player extends Character {
    constructor(scene, x, y, charKey) {
        super(scene, x, y, charKey, 'player');

        // Input keys
        this.keys = scene.input.keyboard.addKeys({
            up: Phaser.Input.Keyboard.KeyCodes.W,
            down: Phaser.Input.Keyboard.KeyCodes.S,
            left: Phaser.Input.Keyboard.KeyCodes.A,
            right: Phaser.Input.Keyboard.KeyCodes.D,
            attack1: Phaser.Input.Keyboard.KeyCodes.J,
            attack2: Phaser.Input.Keyboard.KeyCodes.K,
            block: Phaser.Input.Keyboard.KeyCodes.L,
            arrowUp: Phaser.Input.Keyboard.KeyCodes.UP,
            arrowDown: Phaser.Input.Keyboard.KeyCodes.DOWN,
            arrowLeft: Phaser.Input.Keyboard.KeyCodes.LEFT,
            arrowRight: Phaser.Input.Keyboard.KeyCodes.RIGHT,
        });

        // Player marker (arrow above head)
        this.marker = scene.add.text(0, -80, '▼', {
            fontSize: '14px',
            color: '#44ff44'
        }).setOrigin(0.5);
        this.add(this.marker);

        // Pulsing marker
        scene.tweens.add({
            targets: this.marker,
            y: -75,
            duration: 500,
            ease: 'Sine.easeInOut',
            yoyo: true,
            repeat: -1
        });

        this.isPlayer = true;
    }

    update(delta) {
        if (!this.alive) {
            super.update(delta);
            return;
        }

        // Movement input
        let dx = 0;
        let dy = 0;

        if (this.keys.left.isDown || this.keys.arrowLeft.isDown) dx -= 1;
        if (this.keys.right.isDown || this.keys.arrowRight.isDown) dx += 1;
        if (this.keys.up.isDown || this.keys.arrowUp.isDown) dy -= 1;
        if (this.keys.down.isDown || this.keys.arrowDown.isDown) dy += 1;

        this.moveTo(dx, dy, delta);

        // Combat inputs
        if (Phaser.Input.Keyboard.JustDown(this.keys.attack1)) {
            this.attack(1);
        }
        if (Phaser.Input.Keyboard.JustDown(this.keys.attack2)) {
            this.attack(2);
        }
        if (this.keys.block.isDown) {
            this.block();
        }

        super.update(delta);
    }
}

// Need Phaser import for keycodes
import Phaser from 'phaser';
