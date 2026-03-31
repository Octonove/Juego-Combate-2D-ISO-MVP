import Phaser from 'phaser';
import { CHARACTERS, ANIMATIONS } from '../config/characters.js';
import { KNOCKBACK_FRICTION } from '../config/constants.js';

export class Character extends Phaser.GameObjects.Container {
    constructor(scene, x, y, charKey, team) {
        super(scene, x, y);
        scene.add.existing(this);

        this.charKey = charKey;
        this.charData = { ...CHARACTERS[charKey] };
        this.team = team;
        this.alive = true;
        this.fallingToLava = false;

        // Stats (can be modified by power-ups)
        this.maxHp = this.charData.hp;
        this.hp = this.maxHp;
        this.speed = this.charData.speed;
        this.attackDamage = this.charData.attackDamage;
        this.attackRange = this.charData.attackRange;
        this.knockbackForce = this.charData.knockbackForce;
        this.attackDamage2 = this.charData.attackDamage2;
        this.knockbackForce2 = this.charData.knockbackForce2;
        this.knockbackResist = 1.0;

        // State
        this.currentAnim = 'idle';
        this.isAttacking = false;
        this.isBlocking = false;
        this.isHurt = false;
        this.facingRight = true;
        this.attackCooldown = 0;
        this.knockbackVelX = 0;
        this.knockbackVelY = 0;

        // Active power-ups
        this.activePowerUps = [];

        // Create sprite
        this.sprite = scene.add.sprite(0, -20, `${charKey}_idle`);
        this.sprite.setScale(1.8);
        this.add(this.sprite);

        // Shadow
        this.shadow = scene.add.ellipse(0, 5, 40, 15, 0x000000, 0.4);
        this.add(this.shadow);
        this.sendToBack(this.shadow);

        // Team indicator ring
        const ringColor = team === 'player' ? 0x4488ff : 0xff4444;
        this.ring = scene.add.ellipse(0, 5, 44, 18, ringColor, 0.0);
        this.ring.setStrokeStyle(2, ringColor, 0.7);
        this.add(this.ring);
        this.sendToBack(this.ring);

        // HP bar background
        this.hpBarBg = scene.add.rectangle(0, -55, 50, 6, 0x222222, 0.8);
        this.add(this.hpBarBg);

        // HP bar fill
        const hpColor = team === 'player' ? 0x44ff44 : 0xff4444;
        this.hpBarFill = scene.add.rectangle(-25, -55, 50, 6, hpColor);
        this.hpBarFill.setOrigin(0, 0.5);
        this.add(this.hpBarFill);

        // Name tag
        this.nameTag = scene.add.text(0, -65, this.charData.name, {
            fontFamily: 'monospace',
            fontSize: '9px',
            color: team === 'player' ? '#88ccff' : '#ff8888',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5);
        this.add(this.nameTag);

        // Play idle animation
        this.playAnim('idle');

        // Set depth based on y position
        this.setDepth(y);
    }

    playAnim(animKey) {
        if (this.currentAnim === animKey && animKey !== 'attack1' && animKey !== 'attack2') return;
        if (!this.alive && animKey !== 'death') return;

        const fullKey = `${this.charKey}_${animKey}`;
        if (this.scene.anims.exists(fullKey)) {
            this.currentAnim = animKey;
            this.sprite.play(fullKey, true);

            // Listen for animation complete on non-looping anims
            if (ANIMATIONS[animKey]?.repeat === 0) {
                this.sprite.once('animationcomplete', () => {
                    if (animKey === 'death') {
                        this.onDeathComplete();
                    } else if (animKey === 'attack1' || animKey === 'attack2') {
                        this.isAttacking = false;
                        this.playAnim('idle');
                    } else if (animKey === 'hurt') {
                        this.isHurt = false;
                        this.playAnim('idle');
                    } else if (animKey === 'block') {
                        this.isBlocking = false;
                        this.playAnim('idle');
                    }
                });
            }
        }
    }

    attack(type = 1) {
        if (!this.alive || this.isAttacking || this.isHurt || this.fallingToLava) return false;
        if (this.attackCooldown > 0) return false;

        this.isAttacking = true;
        const animKey = type === 1 ? 'attack1' : 'attack2';
        this.playAnim(animKey);
        this.attackCooldown = type === 1 ? this.charData.attackSpeed : this.charData.attackSpeed * 1.5;

        return true;
    }

    block() {
        if (!this.alive || this.isAttacking || this.isHurt || this.fallingToLava) return;
        this.isBlocking = true;
        this.playAnim('block');
    }

    takeDamage(amount, knockbackX, knockbackY) {
        if (!this.alive || this.fallingToLava) return;

        // Blocking reduces damage and knockback
        if (this.isBlocking) {
            amount *= 0.3;
            knockbackX *= 0.2;
            knockbackY *= 0.2;
        }

        // Apply knockback resistance from power-ups
        knockbackX *= this.knockbackResist;
        knockbackY *= this.knockbackResist;

        this.hp -= amount;
        this.isHurt = true;
        this.isBlocking = false;

        // Apply knockback velocity
        this.knockbackVelX += knockbackX;
        this.knockbackVelY += knockbackY;

        // Update HP bar
        this.updateHpBar();

        // Flash red
        this.sprite.setTint(0xff0000);
        this.scene.time.delayedCall(150, () => {
            if (this.sprite) this.sprite.clearTint();
        });

        // Damage number
        this.showDamageNumber(amount);

        if (this.hp <= 0) {
            this.hp = 0;
            this.die();
        } else {
            this.playAnim('hurt');
        }
    }

    showDamageNumber(amount) {
        const dmgText = this.scene.add.text(this.x, this.y - 70, `-${Math.round(amount)}`, {
            fontFamily: '"Press Start 2P", monospace',
            fontSize: '12px',
            color: '#ff4444',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5).setDepth(10000);

        this.scene.tweens.add({
            targets: dmgText,
            y: dmgText.y - 40,
            alpha: 0,
            duration: 800,
            ease: 'Power2',
            onComplete: () => dmgText.destroy()
        });
    }

    updateHpBar() {
        const ratio = Math.max(0, this.hp / this.maxHp);
        this.hpBarFill.setScale(ratio, 1);

        // Color shift: green -> yellow -> red
        if (ratio > 0.6) {
            this.hpBarFill.setFillStyle(0x44ff44);
        } else if (ratio > 0.3) {
            this.hpBarFill.setFillStyle(0xffcc00);
        } else {
            this.hpBarFill.setFillStyle(0xff2200);
        }
    }

    die() {
        if (!this.alive) return;
        this.alive = false;
        this.isAttacking = false;
        this.isBlocking = false;
        this.playAnim('death');
    }

    onDeathComplete() {
        // Fade out after death animation
        this.scene.tweens.add({
            targets: this,
            alpha: 0,
            duration: 1000,
            onComplete: () => {
                this.setVisible(false);
            }
        });
    }

    fallToLava() {
        if (this.fallingToLava) return;
        this.fallingToLava = true;
        this.alive = false;
        this.isAttacking = false;

        // Play jump/fall anim
        this.playAnim('jump_fall');

        // Scale down + tint red (falling into lava effect)
        this.scene.tweens.add({
            targets: this,
            scaleX: 0.3,
            scaleY: 0.3,
            alpha: 0,
            y: this.y + 30,
            duration: 800,
            ease: 'Power2',
            onComplete: () => {
                this.setVisible(false);
            }
        });

        // Screen shake
        this.scene.cameras.main.shake(200, 0.005);
    }

    update(delta) {
        if (!this.alive) return;

        // Cooldown timer
        if (this.attackCooldown > 0) {
            this.attackCooldown -= delta;
        }

        // Apply knockback
        if (Math.abs(this.knockbackVelX) > 0.5 || Math.abs(this.knockbackVelY) > 0.5) {
            this.x += this.knockbackVelX * (delta / 1000) * 60;
            this.y += this.knockbackVelY * (delta / 1000) * 60;
            this.knockbackVelX *= KNOCKBACK_FRICTION;
            this.knockbackVelY *= KNOCKBACK_FRICTION;

            if (Math.abs(this.knockbackVelX) < 0.5) this.knockbackVelX = 0;
            if (Math.abs(this.knockbackVelY) < 0.5) this.knockbackVelY = 0;
        }

        // Check lava
        if (this.scene.isoMap && this.scene.isoMap.isOnLava(this.x, this.y)) {
            this.fallToLava();
            return;
        }

        // Update depth based on Y position
        this.setDepth(this.y);

        // Update sprite direction
        this.sprite.setFlipX(!this.facingRight);

        // Power-up timers
        this.activePowerUps = this.activePowerUps.filter(pu => {
            if (pu.duration > 0) {
                pu.remaining -= delta;
                if (pu.remaining <= 0) {
                    this.removePowerUpEffect(pu);
                    return false;
                }
            }
            return true;
        });
    }

    applyPowerUp(powerUpType) {
        const pu = { ...powerUpType, remaining: powerUpType.duration };

        if (pu.healAmount) {
            this.hp = Math.min(this.maxHp, this.hp + pu.healAmount);
            this.updateHpBar();
            // Show heal effect
            const healText = this.scene.add.text(this.x, this.y - 70, `+${pu.healAmount}`, {
                fontFamily: '"Press Start 2P", monospace',
                fontSize: '12px',
                color: '#44ff44',
                stroke: '#000000',
                strokeThickness: 2
            }).setOrigin(0.5).setDepth(10000);
            this.scene.tweens.add({
                targets: healText,
                y: healText.y - 40,
                alpha: 0,
                duration: 800,
                onComplete: () => healText.destroy()
            });
        }

        if (pu.multiplier) {
            for (const [stat, mult] of Object.entries(pu.multiplier)) {
                if (stat === 'knockbackResist') {
                    this.knockbackResist *= mult;
                } else if (this[stat] !== undefined) {
                    this[stat] *= mult;
                }
            }
            this.activePowerUps.push(pu);

            // Glow effect
            this.sprite.setTint(pu.color);
            this.scene.time.delayedCall(300, () => {
                if (this.sprite) this.sprite.clearTint();
            });
        }
    }

    removePowerUpEffect(pu) {
        if (pu.multiplier) {
            for (const [stat, mult] of Object.entries(pu.multiplier)) {
                if (stat === 'knockbackResist') {
                    this.knockbackResist /= mult;
                } else if (this[stat] !== undefined) {
                    this[stat] /= mult;
                }
            }
        }
    }

    moveTo(dx, dy, delta) {
        if (!this.alive || this.isAttacking || this.isHurt || this.fallingToLava) return;

        if (dx !== 0 || dy !== 0) {
            // Normalize
            const len = Math.sqrt(dx * dx + dy * dy);
            const nx = dx / len;
            const ny = dy / len;

            const moveSpeed = this.speed * (delta / 1000);
            const newX = this.x + nx * moveSpeed;
            const newY = this.y + ny * moveSpeed;

            // Only move if destination is on the arena (not lava)
            if (this.scene.isoMap && this.scene.isoMap.isOnArena(newX, newY)) {
                this.x = newX;
                this.y = newY;
            } else {
                // Try sliding along axes individually
                if (this.scene.isoMap && this.scene.isoMap.isOnArena(newX, this.y)) {
                    this.x = newX;
                } else if (this.scene.isoMap && this.scene.isoMap.isOnArena(this.x, newY)) {
                    this.y = newY;
                }
                // If both axes blocked, don't move
            }

            // Face direction
            if (dx > 0) this.facingRight = true;
            else if (dx < 0) this.facingRight = false;

            this.playAnim('walk');
        } else if (!this.isAttacking && !this.isHurt && !this.isBlocking) {
            this.playAnim('idle');
        }
    }

    distanceTo(other) {
        return Phaser.Math.Distance.Between(this.x, this.y, other.x, other.y);
    }

    angleTo(other) {
        return Phaser.Math.Angle.Between(this.x, this.y, other.x, other.y);
    }
}
