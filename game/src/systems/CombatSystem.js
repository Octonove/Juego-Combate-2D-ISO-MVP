import Phaser from 'phaser';

export class CombatSystem {
    constructor(scene) {
        this.scene = scene;
    }

    update(delta) {
        const characters = this.scene.characters;
        if (!characters) return;

        // Check every attacker against possible targets
        for (const attacker of characters) {
            if (!attacker.alive || !attacker.isAttacking) continue;

            // Only register hit on the right frame of attack animation
            const frame = attacker.sprite?.anims?.currentFrame?.index;
            if (frame !== 3 && frame !== 4) continue; // hit frames

            // Check against all enemies
            for (const target of characters) {
                if (target === attacker) continue;
                if (!target.alive || target.fallingToLava) continue;
                if (target.team === attacker.team) continue;

                const dist = attacker.distanceTo(target);
                const range = attacker.currentAnim === 'attack2'
                    ? attacker.attackRange * 1.2
                    : attacker.attackRange;

                if (dist <= range) {
                    // Check facing direction
                    const targetIsRight = target.x > attacker.x;
                    if (attacker.facingRight !== targetIsRight) continue;

                    // Calculate damage and knockback
                    const isStrong = attacker.currentAnim === 'attack2';
                    const damage = isStrong ? attacker.attackDamage2 : attacker.attackDamage;
                    const kbForce = isStrong ? attacker.knockbackForce2 : attacker.knockbackForce;

                    // Knockback direction: away from attacker
                    const angle = attacker.angleTo(target);
                    const kbX = Math.cos(angle) * kbForce / 10;
                    const kbY = Math.sin(angle) * kbForce / 10;

                    // Apply hit (mark attacker to avoid double-hit)
                    if (!attacker._hitTargets) attacker._hitTargets = new Set();
                    const hitKey = `${target.charKey}_${Date.now()}`;

                    if (!attacker._hitTargets.has(target)) {
                        attacker._hitTargets.add(target);
                        target.takeDamage(damage, kbX, kbY);

                        // Hit effect
                        this.createHitEffect(target.x, target.y - 20);

                        // Clear hit targets when attack ends
                        this.scene.time.delayedCall(400, () => {
                            if (attacker._hitTargets) attacker._hitTargets.delete(target);
                        });
                    }
                }
            }
        }
    }

    createHitEffect(x, y) {
        // Flash circle
        const flash = this.scene.add.circle(x, y, 20, 0xffffff, 0.8).setDepth(10000);
        this.scene.tweens.add({
            targets: flash,
            scaleX: 2,
            scaleY: 2,
            alpha: 0,
            duration: 200,
            onComplete: () => flash.destroy()
        });

        // Particles (simple circles)
        for (let i = 0; i < 5; i++) {
            const px = x + (Math.random() - 0.5) * 30;
            const py = y + (Math.random() - 0.5) * 30;
            const particle = this.scene.add.circle(px, py, 3, 0xffaa00, 1).setDepth(10000);
            this.scene.tweens.add({
                targets: particle,
                x: px + (Math.random() - 0.5) * 40,
                y: py - Math.random() * 30,
                alpha: 0,
                scaleX: 0,
                scaleY: 0,
                duration: 300 + Math.random() * 200,
                onComplete: () => particle.destroy()
            });
        }
    }
}
