import Phaser from 'phaser';
import { IsometricMap } from '../map/IsometricMap.js';
import { Player } from '../entities/Player.js';
import { AICharacter } from '../entities/AICharacter.js';
import { CombatSystem } from '../systems/CombatSystem.js';
import { PowerUpSystem } from '../systems/PowerUpSystem.js';
import { HUD } from '../ui/HUD.js';
import { CHARACTERS } from '../config/characters.js';
import { GAME_WIDTH, GAME_HEIGHT, TEAM_PLAYER, TEAM_ENEMY } from '../config/constants.js';

export class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
    }

    init(data) {
        this.playerCharKey = data.playerChar || 'Human_Soldier_Sword_Shield';
    }

    create() {
        this.cameras.main.fadeIn(800, 0, 0, 0);

        // Dark background
        this.cameras.main.setBackgroundColor('#0a0505');

        // Characters array (shared with all systems)
        this.characters = [];
        this.powerUps = [];

        // Create isometric map
        this.isoMap = new IsometricMap(this);
        this.isoMap.render();

        // Spawn characters
        this.spawnCharacters();

        // Systems
        this.combatSystem = new CombatSystem(this);
        this.powerUpSystem = new PowerUpSystem(this);

        // HUD
        this.hud = new HUD(this);
        this.hud.setupCharacterBars(this.characters);

        // Timer display
        this.matchTime = 0;
        this.timerText = this.add.text(GAME_WIDTH / 2, 42, '0:00', {
            fontFamily: '"Press Start 2P", monospace',
            fontSize: '12px',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5).setScrollFactor(0).setDepth(9001);

        // Game over flag
        this.gameEnded = false;

        // "FIGHT!" announcement
        this.showAnnouncement('⚔️ ¡A LUCHAR! ⚔️', 0xff8844, 2000);
    }

    spawnCharacters() {
        // Get player team characters (player + 2 allies)
        const playerTeamKeys = Object.keys(CHARACTERS).filter(k => CHARACTERS[k].team === 'player');
        const enemyTeamKeys = Object.keys(CHARACTERS).filter(k => CHARACTERS[k].team === 'enemy');

        // Ensure player's chosen character is first
        const orderedPlayerKeys = [
            this.playerCharKey,
            ...playerTeamKeys.filter(k => k !== this.playerCharKey)
        ];

        // Spawn player (human controlled)
        const playerPos = this.isoMap.getRandomArenaPosition('left');
        const player = new Player(this, playerPos.x, playerPos.y, this.playerCharKey);
        this.characters.push(player);

        // Spawn AI allies
        for (let i = 1; i < orderedPlayerKeys.length; i++) {
            const pos = this.isoMap.getRandomArenaPosition('left');
            const ally = new AICharacter(this, pos.x, pos.y, orderedPlayerKeys[i], TEAM_PLAYER);
            this.characters.push(ally);
        }

        // Spawn AI enemies
        for (const key of enemyTeamKeys) {
            const pos = this.isoMap.getRandomArenaPosition('right');
            const enemy = new AICharacter(this, pos.x, pos.y, key, TEAM_ENEMY);
            this.characters.push(enemy);
        }
    }

    showAnnouncement(text, color = 0xff8844, duration = 1500) {
        const colorStr = '#' + color.toString(16).padStart(6, '0');
        const announce = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2, text, {
            fontFamily: '"Press Start 2P", monospace',
            fontSize: '28px',
            color: colorStr,
            stroke: '#000000',
            strokeThickness: 5,
            shadow: { offsetX: 3, offsetY: 3, color: '#000', blur: 8, fill: true }
        }).setOrigin(0.5).setScrollFactor(0).setDepth(10000);

        this.tweens.add({
            targets: announce,
            scaleX: { from: 0.5, to: 1.2 },
            scaleY: { from: 0.5, to: 1.2 },
            alpha: { from: 0, to: 1 },
            duration: 400,
            ease: 'Back.easeOut',
            onComplete: () => {
                this.time.delayedCall(duration - 800, () => {
                    this.tweens.add({
                        targets: announce,
                        alpha: 0,
                        scaleX: 1.5,
                        scaleY: 1.5,
                        duration: 400,
                        onComplete: () => announce.destroy()
                    });
                });
            }
        });
    }

    update(time, delta) {
        if (this.gameEnded) return;

        // Update match timer
        this.matchTime += delta;
        const secs = Math.floor(this.matchTime / 1000);
        const mins = Math.floor(secs / 60);
        this.timerText.setText(`${mins}:${(secs % 60).toString().padStart(2, '0')}`);

        // Update all characters
        for (const char of this.characters) {
            char.update(delta);
        }

        // Update systems
        this.combatSystem.update(delta);
        this.powerUpSystem.update(delta);

        // Update HUD
        this.hud.update();

        // Sync powerUps reference for AI
        this.powerUps = this.powerUpSystem.getActivePowerUps();

        // Check win/lose conditions
        this.checkGameEnd();
    }

    checkGameEnd() {
        const playerTeamAlive = this.characters.filter(c => c.team === TEAM_PLAYER && c.alive).length;
        const enemyTeamAlive = this.characters.filter(c => c.team === TEAM_ENEMY && c.alive).length;

        if (playerTeamAlive === 0) {
            this.endGame(false);
        } else if (enemyTeamAlive === 0) {
            this.endGame(true);
        }
    }

    endGame(playerWon) {
        this.gameEnded = true;

        const text = playerWon ? '🏆 ¡VICTORIA! 🏆' : '💀 DERROTA 💀';
        const color = playerWon ? 0x44ff44 : 0xff4444;
        this.showAnnouncement(text, color, 3000);

        this.time.delayedCall(3500, () => {
            this.cameras.main.fadeOut(800, 0, 0, 0);
            this.time.delayedCall(800, () => {
                this.scene.start('GameOverScene', {
                    won: playerWon,
                    time: this.matchTime,
                    playerChar: this.playerCharKey
                });
            });
        });
    }
}
