import Phaser from 'phaser';
import { CHARACTERS, ANIMATIONS } from '../config/characters.js';

export class BootScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BootScene' });
    }

    preload() {
        // -- Loading bar --
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        const bgBar = this.add.rectangle(width / 2, height / 2, 400, 30, 0x222222);
        const progressBar = this.add.rectangle(width / 2 - 196, height / 2, 0, 22, 0xff6600);
        progressBar.setOrigin(0, 0.5);

        const loadingText = this.add.text(width / 2, height / 2 - 40, 'Cargando arena...', {
            fontFamily: 'monospace',
            fontSize: '18px',
            color: '#ff9944'
        }).setOrigin(0.5);

        this.load.on('progress', (value) => {
            progressBar.width = 392 * value;
        });

        this.load.on('complete', () => {
            loadingText.setText('¡Listo!');
        });

        // -- Load tileset --
        this.load.spritesheet('tiles', 'assets/tiles/spritesheet.png', {
            frameWidth: 32,
            frameHeight: 32,
            spacing: 0,
            margin: 0
        });

        // -- Load character spritesheets --
        const charKeys = Object.keys(CHARACTERS);
        for (const charKey of charKeys) {
            for (const [animKey, animData] of Object.entries(ANIMATIONS)) {
                const sheetKey = `${charKey}_${animKey}`;

                // Each animation is a separate sheet: charName_AnimationSuffix-Sheet.png
                const animPath = `assets/characters/${charKey}/${charKey}_${animData.suffix}.png`;

                this.load.spritesheet(sheetKey, animPath, {
                    frameWidth: 96,
                    frameHeight: 96
                });
            }
        }

        // -- Load bullet spritesheets --
        this.load.spritesheet('bullets_1', 'assets/bullets/bullets_1.png', {
            frameWidth: 24,
            frameHeight: 24
        });

        // -- Load power-up icons --
        const iconNames = ['fb100.png', 'fb101.png', 'fb1000.png', 'fb1001.png'];
        for (const icon of iconNames) {
            this.load.image(icon, `assets/icons/${icon}`);
        }
    }

    create() {
        // Create animations for all characters
        const charKeys = Object.keys(CHARACTERS);
        for (const charKey of charKeys) {
            for (const [animKey, animData] of Object.entries(ANIMATIONS)) {
                const sheetKey = `${charKey}_${animKey}`;
                const animName = `${charKey}_${animKey}`;

                if (this.textures.exists(sheetKey)) {
                    this.anims.create({
                        key: animName,
                        frames: this.anims.generateFrameNumbers(sheetKey, {
                            start: 0,
                            end: animData.frames - 1
                        }),
                        frameRate: animData.frameRate,
                        repeat: animData.repeat
                    });
                }
            }
        }

        this.scene.start('MenuScene');
    }
}
