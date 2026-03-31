import Phaser from 'phaser';
import { Character } from './Character.js';

const AI_STATES = {
    IDLE: 'idle',
    CHASE: 'chase',
    ATTACK: 'attack',
    FLEE: 'flee',
    SEEK_POWERUP: 'seek_powerup'
};

export class AICharacter extends Character {
    constructor(scene, x, y, charKey, team) {
        super(scene, x, y, charKey, team);

        this.aiState = AI_STATES.IDLE;
        this.target = null;
        this.stateTimer = 0;
        this.thinkInterval = 300 + Math.random() * 200; // ms between decisions
        this.thinkTimer = 0;
        this.aggressiveness = 0.5 + Math.random() * 0.5; // 0.5-1.0
        this.isPlayer = false;

        // Wander target
        this.wanderX = x;
        this.wanderY = y;
    }

    update(delta) {
        if (!this.alive) {
            super.update(delta);
            return;
        }

        this.thinkTimer += delta;

        if (this.thinkTimer >= this.thinkInterval) {
            this.thinkTimer = 0;
            this.think();
        }

        this.executeState(delta);
        super.update(delta);
    }

    think() {
        const enemies = this.getEnemies();
        const aliveEnemies = enemies.filter(e => e.alive && !e.fallingToLava);

        if (aliveEnemies.length === 0) {
            this.aiState = AI_STATES.IDLE;
            this.target = null;
            return;
        }

        // Check HP - flee if low
        const hpRatio = this.hp / this.maxHp;
        if (hpRatio < 0.25) {
            // Look for heal power-ups
            const healPowerUp = this.findNearestPowerUp('heal');
            if (healPowerUp) {
                this.aiState = AI_STATES.SEEK_POWERUP;
                this.target = healPowerUp;
                return;
            }
            // Flee from nearest enemy
            this.aiState = AI_STATES.FLEE;
            this.target = this.findNearestEnemy(aliveEnemies);
            return;
        }

        // Check for nearby power-ups (opportunistic)
        if (Math.random() < 0.15) {
            const nearbyPU = this.findNearestPowerUp();
            if (nearbyPU && this.distanceTo(nearbyPU) < 150) {
                this.aiState = AI_STATES.SEEK_POWERUP;
                this.target = nearbyPU;
                return;
            }
        }

        // Find target - prioritize closest or weak enemies
        const nearest = this.findNearestEnemy(aliveEnemies);
        this.target = nearest;

        if (nearest) {
            const dist = this.distanceTo(nearest);
            if (dist <= this.attackRange + 10) {
                this.aiState = AI_STATES.ATTACK;
            } else {
                this.aiState = AI_STATES.CHASE;
            }
        } else {
            this.aiState = AI_STATES.IDLE;
        }
    }

    executeState(delta) {
        switch (this.aiState) {
            case AI_STATES.IDLE:
                this.doIdle(delta);
                break;
            case AI_STATES.CHASE:
                this.doChase(delta);
                break;
            case AI_STATES.ATTACK:
                this.doAttack(delta);
                break;
            case AI_STATES.FLEE:
                this.doFlee(delta);
                break;
            case AI_STATES.SEEK_POWERUP:
                this.doSeekPowerUp(delta);
                break;
        }
    }

    doIdle(delta) {
        // Wander slightly
        const dist = Phaser.Math.Distance.Between(this.x, this.y, this.wanderX, this.wanderY);
        if (dist < 20 || Math.random() < 0.01) {
            // Pick new wander target near center
            if (this.scene.isoMap) {
                const pos = this.scene.isoMap.getRandomArenaPosition();
                this.wanderX = pos.x;
                this.wanderY = pos.y;
            }
        }
        const dx = this.wanderX - this.x;
        const dy = this.wanderY - this.y;
        this.moveTo(dx, dy, delta);
    }

    doChase(delta) {
        if (!this.target || !this.target.alive) {
            this.aiState = AI_STATES.IDLE;
            return;
        }

        const dx = this.target.x - this.x;
        const dy = this.target.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist <= this.attackRange + 5) {
            this.aiState = AI_STATES.ATTACK;
            return;
        }

        this.moveTo(dx, dy, delta);
    }

    doAttack(delta) {
        if (!this.target || !this.target.alive) {
            this.aiState = AI_STATES.IDLE;
            return;
        }

        const dist = this.distanceTo(this.target);

        // Face the target
        this.facingRight = this.target.x > this.x;

        if (dist > this.attackRange + 20) {
            this.aiState = AI_STATES.CHASE;
            return;
        }

        // Attack! randomly choose between attack types based on aggressiveness
        if (!this.isAttacking && this.attackCooldown <= 0) {
            const useStrong = Math.random() < this.aggressiveness * 0.4;
            this.attack(useStrong ? 2 : 1);
        }
    }

    doFlee(delta) {
        if (!this.target) {
            this.aiState = AI_STATES.IDLE;
            return;
        }

        // Run away from target, but toward center of arena
        const centerX = this.scene.isoMap ? this.scene.isoMap.getArenaBounds().centerX : 640;
        const centerY = this.scene.isoMap ? this.scene.isoMap.getArenaBounds().centerY : 360;

        // Blend flee direction and center direction
        const fleeX = this.x - this.target.x;
        const fleeY = this.y - this.target.y;
        const centerDx = centerX - this.x;
        const centerDy = centerY - this.y;

        const dx = fleeX * 0.6 + centerDx * 0.4;
        const dy = fleeY * 0.6 + centerDy * 0.4;

        this.moveTo(dx, dy, delta);

        // Recover some HP? Switch back to chase if safe
        if (this.hp / this.maxHp > 0.4) {
            this.aiState = AI_STATES.CHASE;
        }
    }

    doSeekPowerUp(delta) {
        if (!this.target || !this.target.active) {
            this.aiState = AI_STATES.IDLE;
            return;
        }

        const dx = this.target.x - this.x;
        const dy = this.target.y - this.y;
        this.moveTo(dx, dy, delta);

        if (this.distanceTo(this.target) < 20) {
            this.aiState = AI_STATES.IDLE;
        }
    }

    getEnemies() {
        if (!this.scene.characters) return [];
        return this.scene.characters.filter(c => c.team !== this.team);
    }

    findNearestEnemy(enemies) {
        if (!enemies || enemies.length === 0) return null;
        let nearest = null;
        let minDist = Infinity;

        for (const enemy of enemies) {
            const dist = this.distanceTo(enemy);
            // Weight by HP ratio - prefer weaker enemies
            const score = dist - (1 - enemy.hp / enemy.maxHp) * 100;
            if (score < minDist) {
                minDist = score;
                nearest = enemy;
            }
        }
        return nearest;
    }

    findNearestPowerUp(type = null) {
        if (!this.scene.powerUps) return null;
        const pus = this.scene.powerUps.filter(p => p.active);
        if (type) {
            // Filter by type is not implemented in simple version
        }
        let nearest = null;
        let minDist = Infinity;
        for (const pu of pus) {
            const dist = this.distanceTo(pu);
            if (dist < minDist) {
                minDist = dist;
                nearest = pu;
            }
        }
        return nearest;
    }
}
