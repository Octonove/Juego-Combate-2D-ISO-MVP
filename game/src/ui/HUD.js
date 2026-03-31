import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../config/constants.js';

export class HUD {
    constructor(scene) {
        this.scene = scene;
        this.elements = [];

        this.createHUD();
    }

    createHUD() {
        // Semi-transparent top bar
        const topBar = this.scene.add.graphics();
        topBar.fillStyle(0x000000, 0.6);
        topBar.fillRect(0, 0, GAME_WIDTH, 55);
        topBar.setScrollFactor(0).setDepth(9000);

        // Team labels
        this.scene.add.text(20, 5, '🛡 TU EQUIPO', {
            fontFamily: '"Press Start 2P", monospace',
            fontSize: '10px',
            color: '#4488ff'
        }).setScrollFactor(0).setDepth(9001);

        this.scene.add.text(GAME_WIDTH - 20, 5, '☠ ENEMIGOS', {
            fontFamily: '"Press Start 2P", monospace',
            fontSize: '10px',
            color: '#ff4444'
        }).setOrigin(1, 0).setScrollFactor(0).setDepth(9001);

        // VS text
        this.scene.add.text(GAME_WIDTH / 2, 15, 'VS', {
            fontFamily: '"Press Start 2P", monospace',
            fontSize: '16px',
            color: '#ffaa44',
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(0.5).setScrollFactor(0).setDepth(9001);

        // HP bars will be created when characters are added
        this.playerBars = [];
        this.enemyBars = [];
    }

    setupCharacterBars(characters) {
        const players = characters.filter(c => c.team === 'player');
        const enemies = characters.filter(c => c.team === 'enemy');

        // Player team bars (left side)
        players.forEach((char, i) => {
            const bar = this.createCharacterBar(20 + i * 140, 22, char, true);
            this.playerBars.push(bar);
        });

        // Enemy team bars (right side)
        enemies.forEach((char, i) => {
            const bar = this.createCharacterBar(GAME_WIDTH - 140 - i * 140, 22, char, false);
            this.enemyBars.push(bar);
        });
    }

    createCharacterBar(x, y, character, isPlayer) {
        const barWidth = 110;
        const barHeight = 8;

        // Name
        const name = this.scene.add.text(x, y, character.charData.name, {
            fontFamily: 'monospace',
            fontSize: '9px',
            color: isPlayer ? '#88bbff' : '#ff8888'
        }).setScrollFactor(0).setDepth(9001);

        // HP bar bg
        const bg = this.scene.add.rectangle(x, y + 14, barWidth, barHeight, 0x333333)
            .setOrigin(0, 0.5)
            .setScrollFactor(0).setDepth(9001);

        // HP bar fill
        const fill = this.scene.add.rectangle(x, y + 14, barWidth, barHeight, isPlayer ? 0x44ff44 : 0xff4444)
            .setOrigin(0, 0.5)
            .setScrollFactor(0).setDepth(9002);

        // Player star indicator
        if (character.isPlayer) {
            this.scene.add.text(x + barWidth + 5, y + 5, '★', {
                fontSize: '12px',
                color: '#ffdd00'
            }).setScrollFactor(0).setDepth(9001);
        }

        return { character, fill, bg, barWidth };
    }

    update() {
        // Update all bars
        const allBars = [...this.playerBars, ...this.enemyBars];
        for (const bar of allBars) {
            if (!bar.character) continue;
            const ratio = Math.max(0, bar.character.hp / bar.character.maxHp);
            bar.fill.setScale(ratio, 1);

            // Color change
            if (ratio > 0.6) {
                bar.fill.setFillStyle(bar.character.team === 'player' ? 0x44ff44 : 0xff4444);
            } else if (ratio > 0.3) {
                bar.fill.setFillStyle(0xffcc00);
            } else {
                bar.fill.setFillStyle(0xff2200);
            }

            // Gray out if dead
            if (!bar.character.alive) {
                bar.fill.setAlpha(0.3);
            }
        }
    }
}
