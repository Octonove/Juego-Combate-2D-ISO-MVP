import Phaser from 'phaser';
import { CHARACTERS } from '../config/characters.js';
import { GAME_WIDTH, GAME_HEIGHT } from '../config/constants.js';

export class SelectScene extends Phaser.Scene {
    constructor() {
        super({ key: 'SelectScene' });
        this.selectedChar = null;
    }

    create() {
        this.cameras.main.fadeIn(500, 0, 0, 0);

        // Background
        const bg = this.add.graphics();
        bg.fillGradientStyle(0x1a0a2e, 0x1a0a2e, 0x0d0d0d, 0x0d0d0d, 1);
        bg.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

        // Title
        this.add.text(GAME_WIDTH / 2, 50, 'ELIGE TU GUERRERO', {
            fontFamily: '"Press Start 2P", monospace',
            fontSize: '24px',
            color: '#ff8844',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5);

        // Player characters (top row)
        this.add.text(GAME_WIDTH / 2, 100, '— Tu Equipo —', {
            fontFamily: 'monospace',
            fontSize: '14px',
            color: '#4488ff'
        }).setOrigin(0.5);

        const playerChars = Object.entries(CHARACTERS).filter(([_, c]) => c.team === 'player');
        const enemyChars = Object.entries(CHARACTERS).filter(([_, c]) => c.team === 'enemy');

        const cardWidth = 200;
        const cardHeight = 280;
        const startX = GAME_WIDTH / 2 - (playerChars.length * (cardWidth + 20)) / 2 + cardWidth / 2;

        // Draw player character cards
        playerChars.forEach(([key, char], i) => {
            const x = startX + i * (cardWidth + 20);
            const y = 260;
            this.createCharCard(x, y, key, char, cardWidth, cardHeight, true);
        });

        // Enemy team preview
        this.add.text(GAME_WIDTH / 2, 430, '— Equipo Enemigo —', {
            fontFamily: 'monospace',
            fontSize: '14px',
            color: '#ff4444'
        }).setOrigin(0.5);

        const enemyStartX = GAME_WIDTH / 2 - (enemyChars.length * (cardWidth + 20)) / 2 + cardWidth / 2;
        enemyChars.forEach(([key, char], i) => {
            const x = enemyStartX + i * (cardWidth + 20);
            const y = 560;
            this.createCharCard(x, y, key, char, cardWidth, cardHeight * 0.7, false);
        });

        // Start button (initially hidden)
        this.startBtn = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 40, '⚔️  ¡A LA BATALLA!  ⚔️', {
            fontFamily: '"Press Start 2P", monospace',
            fontSize: '16px',
            color: '#ffffff',
            backgroundColor: '#228833',
            padding: { x: 25, y: 12 },
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(0.5).setInteractive({ useHandCursor: true }).setVisible(false);

        this.startBtn.on('pointerover', () => this.startBtn.setStyle({ backgroundColor: '#33aa44' }));
        this.startBtn.on('pointerout', () => this.startBtn.setStyle({ backgroundColor: '#228833' }));
        this.startBtn.on('pointerdown', () => {
            if (this.selectedChar) {
                this.cameras.main.fadeOut(500, 0, 0, 0);
                this.time.delayedCall(500, () => {
                    this.scene.start('GameScene', { playerChar: this.selectedChar });
                });
            }
        });

        // Default selection: first player character
        this.selectCharacter(playerChars[0][0]);
    }

    createCharCard(x, y, key, char, w, h, selectable) {
        const card = this.add.graphics();
        const border = char.team === 'player' ? 0x4488cc : 0xcc4444;

        card.fillStyle(0x1a1a2e, 0.9);
        card.fillRoundedRect(x - w / 2, y - h / 2, w, h, 8);
        card.lineStyle(2, border, 0.8);
        card.strokeRoundedRect(x - w / 2, y - h / 2, w, h, 8);

        // Character sprite preview
        const animKey = `${key}_idle`;
        if (this.anims.exists(animKey)) {
            const sprite = this.add.sprite(x, y - h / 2 + 70, `${key}_idle`).setScale(2);
            sprite.play(animKey);
        }

        // Name
        this.add.text(x, y + 20, char.name, {
            fontFamily: '"Press Start 2P", monospace',
            fontSize: '12px',
            color: '#ffffff'
        }).setOrigin(0.5);

        // Stats
        const statsY = y + 45;
        const statsStyle = { fontFamily: 'monospace', fontSize: '10px', color: '#aaaaaa' };
        this.add.text(x, statsY, `HP: ${char.hp}  SPD: ${char.speed}`, statsStyle).setOrigin(0.5);
        this.add.text(x, statsY + 15, `ATK: ${char.attackDamage}  KB: ${char.knockbackForce}`, statsStyle).setOrigin(0.5);

        if (char.description && h > 200) {
            this.add.text(x, statsY + 35, char.description, {
                fontFamily: 'monospace',
                fontSize: '9px',
                color: '#888888',
                wordWrap: { width: w - 20 }
            }).setOrigin(0.5);
        }

        if (selectable) {
            // Create invisible hit area for selection
            const hitArea = this.add.rectangle(x, y, w, h, 0x000000, 0).setInteractive({ useHandCursor: true });

            // Highlight on hover
            const highlight = this.add.graphics();
            highlight.setAlpha(0);
            highlight.lineStyle(3, 0xffaa00, 1);
            highlight.strokeRoundedRect(x - w / 2, y - h / 2, w, h, 8);

            hitArea.on('pointerover', () => {
                this.tweens.add({ targets: highlight, alpha: 1, duration: 150 });
            });
            hitArea.on('pointerout', () => {
                if (this.selectedChar !== key) {
                    this.tweens.add({ targets: highlight, alpha: 0, duration: 150 });
                }
            });
            hitArea.on('pointerdown', () => {
                this.selectCharacter(key);
            });

            // Store reference for selection state
            if (!this.cardHighlights) this.cardHighlights = {};
            this.cardHighlights[key] = highlight;
        }
    }

    selectCharacter(key) {
        this.selectedChar = key;
        // Update all highlights
        if (this.cardHighlights) {
            Object.entries(this.cardHighlights).forEach(([k, h]) => {
                h.setAlpha(k === key ? 1 : 0);
            });
        }
        // Show start button
        if (this.startBtn) {
            this.startBtn.setVisible(true);
            this.tweens.add({
                targets: this.startBtn,
                scaleX: 1.05,
                scaleY: 1.05,
                duration: 600,
                ease: 'Sine.easeInOut',
                yoyo: true,
                repeat: -1
            });
        }
    }
}
