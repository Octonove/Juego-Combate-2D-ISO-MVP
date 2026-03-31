import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../config/constants.js';

export class GameOverScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameOverScene' });
    }

    init(data) {
        this.won = data.won || false;
        this.matchTime = data.time || 0;
        this.playerChar = data.playerChar || '';
    }

    create() {
        this.cameras.main.fadeIn(500, 0, 0, 0);

        // Background
        const bg = this.add.graphics();
        if (this.won) {
            bg.fillGradientStyle(0x0a2a0a, 0x0a2a0a, 0x0d0d0d, 0x0d0d0d, 1);
        } else {
            bg.fillGradientStyle(0x2a0a0a, 0x2a0a0a, 0x0d0d0d, 0x0d0d0d, 1);
        }
        bg.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

        // Result text
        const resultText = this.won ? '🏆 ¡VICTORIA! 🏆' : '💀 DERROTA 💀';
        const resultColor = this.won ? '#44ff44' : '#ff4444';

        this.add.text(GAME_WIDTH / 2, 180, resultText, {
            fontFamily: '"Press Start 2P", monospace',
            fontSize: '36px',
            color: resultColor,
            stroke: '#000000',
            strokeThickness: 6,
            shadow: { offsetX: 3, offsetY: 3, color: this.won ? '#006600' : '#660000', blur: 10, fill: true }
        }).setOrigin(0.5);

        // Stats
        const secs = Math.floor(this.matchTime / 1000);
        const mins = Math.floor(secs / 60);
        const timeStr = `${mins}:${(secs % 60).toString().padStart(2, '0')}`;

        this.add.text(GAME_WIDTH / 2, 280, `Tiempo de combate: ${timeStr}`, {
            fontFamily: 'monospace',
            fontSize: '16px',
            color: '#cccccc'
        }).setOrigin(0.5);

        const subText = this.won
            ? '¡Has demostrado tu valía en la Arena!'
            : 'La lava reclamó a tus guerreros...';
        this.add.text(GAME_WIDTH / 2, 320, subText, {
            fontFamily: 'monospace',
            fontSize: '14px',
            color: '#999999'
        }).setOrigin(0.5);

        // Replay button
        const replayBtn = this.add.text(GAME_WIDTH / 2, 420, '🔄  REVANCHA', {
            fontFamily: '"Press Start 2P", monospace',
            fontSize: '18px',
            color: '#ffffff',
            backgroundColor: '#cc6600',
            padding: { x: 25, y: 12 },
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        replayBtn.on('pointerover', () => replayBtn.setStyle({ backgroundColor: '#ff8800' }));
        replayBtn.on('pointerout', () => replayBtn.setStyle({ backgroundColor: '#cc6600' }));
        replayBtn.on('pointerdown', () => {
            this.cameras.main.fadeOut(500, 0, 0, 0);
            this.time.delayedCall(500, () => {
                this.scene.start('SelectScene');
            });
        });

        // Menu button
        const menuBtn = this.add.text(GAME_WIDTH / 2, 490, '🏠  MENÚ PRINCIPAL', {
            fontFamily: '"Press Start 2P", monospace',
            fontSize: '14px',
            color: '#aaaaaa',
            backgroundColor: '#333333',
            padding: { x: 20, y: 10 },
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        menuBtn.on('pointerover', () => menuBtn.setStyle({ backgroundColor: '#555555', color: '#ffffff' }));
        menuBtn.on('pointerout', () => menuBtn.setStyle({ backgroundColor: '#333333', color: '#aaaaaa' }));
        menuBtn.on('pointerdown', () => {
            this.cameras.main.fadeOut(500, 0, 0, 0);
            this.time.delayedCall(500, () => {
                this.scene.start('MenuScene');
            });
        });

        // Ember particles for ambiance
        if (this.textures.exists('tiles')) {
            this.add.particles(0, 0, 'tiles', {
                frame: [53],
                x: { min: 0, max: GAME_WIDTH },
                y: GAME_HEIGHT + 10,
                lifespan: 3000,
                speedY: { min: -30, max: -60 },
                speedX: { min: -10, max: 10 },
                scale: { start: 0.3, end: 0 },
                alpha: { start: 0.5, end: 0 },
                tint: this.won ? 0x44ff44 : 0xff4400,
                frequency: 500
            });
        }
    }
}
