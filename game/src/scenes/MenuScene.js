import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../config/constants.js';

export class MenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MenuScene' });
    }

    create() {
        // Dark gradient background
        const bg = this.add.graphics();
        bg.fillGradientStyle(0x1a0a2e, 0x1a0a2e, 0x0d0d0d, 0x0d0d0d, 1);
        bg.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

        // Lava glow at bottom
        const lavaGlow = this.add.graphics();
        for (let i = 0; i < 5; i++) {
            const alpha = 0.15 - i * 0.03;
            lavaGlow.fillStyle(0xff4400, alpha);
            lavaGlow.fillRect(0, GAME_HEIGHT - 100 + i * 20, GAME_WIDTH, 20);
        }

        // Animated particles for ambiance
        const emitter = this.add.particles(0, 0, 'tiles', {
            frame: [53, 58],
            x: { min: 0, max: GAME_WIDTH },
            y: GAME_HEIGHT + 10,
            lifespan: 4000,
            speedY: { min: -40, max: -80 },
            speedX: { min: -20, max: 20 },
            scale: { start: 0.4, end: 0 },
            alpha: { start: 0.6, end: 0 },
            tint: 0xff6600,
            frequency: 300
        });

        // Title
        const title = this.add.text(GAME_WIDTH / 2, 180, '⚔️ ARENA DE COMBATE ⚔️', {
            fontFamily: '"Press Start 2P", monospace',
            fontSize: '36px',
            color: '#ff8844',
            stroke: '#000000',
            strokeThickness: 6,
            shadow: { offsetX: 3, offsetY: 3, color: '#ff4400', blur: 10, fill: true }
        }).setOrigin(0.5);

        // Subtitle
        this.add.text(GAME_WIDTH / 2, 240, '3 vs 3  •  Coliseo Isométrico', {
            fontFamily: 'monospace',
            fontSize: '16px',
            color: '#cc8866'
        }).setOrigin(0.5);

        // Pulsing Start button
        const startBtn = this.add.text(GAME_WIDTH / 2, 400, '▶  COMENZAR BATALLA  ◀', {
            fontFamily: '"Press Start 2P", monospace',
            fontSize: '20px',
            color: '#ffffff',
            backgroundColor: '#cc3300',
            padding: { x: 30, y: 15 },
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        this.tweens.add({
            targets: startBtn,
            scaleX: 1.05,
            scaleY: 1.05,
            duration: 800,
            ease: 'Sine.easeInOut',
            yoyo: true,
            repeat: -1
        });

        startBtn.on('pointerover', () => startBtn.setStyle({ backgroundColor: '#ff4400' }));
        startBtn.on('pointerout', () => startBtn.setStyle({ backgroundColor: '#cc3300' }));
        startBtn.on('pointerdown', () => {
            this.cameras.main.fadeOut(500, 0, 0, 0);
            this.time.delayedCall(500, () => this.scene.start('SelectScene'));
        });

        // Controls info
        this.add.text(GAME_WIDTH / 2, 530, 'WASD = Mover  |  J = Ataque  |  K = Ataque Fuerte  |  L = Bloquear', {
            fontFamily: 'monospace',
            fontSize: '12px',
            color: '#887766'
        }).setOrigin(0.5);

        this.add.text(GAME_WIDTH / 2, 555, '¡Empuja enemigos a la lava para eliminarlos!', {
            fontFamily: 'monospace',
            fontSize: '13px',
            color: '#ff6644'
        }).setOrigin(0.5);

        // Title animation
        this.tweens.add({
            targets: title,
            y: title.y - 5,
            duration: 2000,
            ease: 'Sine.easeInOut',
            yoyo: true,
            repeat: -1
        });

        this.cameras.main.fadeIn(500, 0, 0, 0);
    }
}
