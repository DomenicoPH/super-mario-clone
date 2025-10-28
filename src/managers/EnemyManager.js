import Phaser from "phaser";
import Goomba from "../enemies/Goomba";
import Koopa, { STATE as KOOPA_STATE } from "../enemies/Koopa";

export default class EnemyManager {
    constructor(scene, mapManager, blockManager, player, fireballs){
        this.scene = scene;
        this.mapManager = mapManager;
        this.blockManager = blockManager;
        this.player = player;
        this.fireballs = fireballs;

        this.physics = scene.physics;
        this.time = scene.time;
        this.add = scene.add;
        this.cameras = scene.cameras;

        this.blocksGroup = blockManager?.blocksGroup;
        
        this.enemies = null;
        this.enemySpawnData = null;
    }

    createEnemies() {
        this.enemies = this.physics.add.group();
        this.enemySpawnData = [];

        // Leer todos los objetos desde la capa "enemies"
        const enemyObjects = this.mapManager.map.getObjectLayer('enemies')?.objects || [];

        enemyObjects.forEach(obj => {
            const type = obj.type || (obj.properties?.find(p => p.name === 'type')?.value);
            this.enemySpawnData.push({
                type,
                x: obj.x,
                y: obj.y,
                spawned: false
            });
        });

        // Colisiones con entorno
        const handleShellBounce = (enemySprite) => {
          const e = enemySprite.enemyRef;
          if (!e || e.type !== 'koopa' || e.state !== KOOPA_STATE.SHELL_MOVING) return;

          const { body } = e.sprite;
          if ((e.directionFactor > 0 && body.blocked.right) || (e.directionFactor < 0 && body.blocked.left)) {
            e.directionFactor *= -1;
            e.sprite.setVelocityX(e.shellSpeed * e.directionFactor);
            e.sprite.x += e.directionFactor * 4; // pequeño empujón para evitar rebote infinito
          }
        };

        this.physics.add.collider(this.enemies, this.mapManager.groundLayer, handleShellBounce);
        this.physics.add.collider(this.enemies, this.blocksGroup, handleShellBounce);

        // Colisión con otros enemigos
        this.physics.add.collider(this.enemies, this.enemies, (enemyA, enemyB) => {
            const eA = enemyA.enemyRef;
            const eB = enemyB.enemyRef;
                
            if (!eA?.alive || !eB?.alive) return;

            if(eA.state === KOOPA_STATE.SHELL_MOVING && eB.alive){
                eB.hitByShell(eA);
                enemyA.body.checkCollision.none = false;
                enemyB.body.checkCollision.none = true;

                this.time.delayedCall(50, () => {
                    enemyB.body.checkCollision.none = false;
                });
                return; // no hacer rebote normal
            } 
            if(eB.state === KOOPA_STATE.SHELL_MOVING && eA.alive){
                eA.hitByShell(eB);
                enemyB.body.checkCollision.none = false;
                enemyA.body.checkCollision.none = true;
                this.time.delayedCall(50, () => {
                    enemyA.body.checkCollision.none = false;
                });
                return; // no hacer rebote normal
            }
                
            // Determinar quién está a la izquierda
            if (enemyA.x < enemyB.x) {
                // A viene de la izquierda, rebota hacia la izquierda
                eA.sprite.setVelocityX(-Math.abs(eA.speed));
                eA.sprite.flipX = false;
            
                // B viene de la derecha, rebota hacia la derecha
                eB.sprite.setVelocityX(Math.abs(eB.speed));
                eB.sprite.flipX = true;
            
                // Separar ligeramente
                enemyA.x -= 2;
                enemyB.x += 2;
            } else {
                // A viene de la derecha
                eA.sprite.setVelocityX(Math.abs(eA.speed));
                eA.sprite.flipX = true;
            
                // B viene de la izquierda
                eB.sprite.setVelocityX(-Math.abs(eB.speed));
                eB.sprite.flipX = false;
            
                // Separar ligeramente
                enemyA.x += 2;
                enemyB.x -= 2;
            }
        });

        // Colisión jugador / enemigos
        this.physics.add.overlap(
            this.player.sprite, 
            this.enemies, 
            (playerSprite, enemySprite) => {
                this.handlePlayerEnemyCollision(playerSprite, enemySprite);
            }
        );

        // Fireballs / enemigos * REVISAR
        this.physics.add.overlap(this.fireballs, this.enemies, (fbSprite, enemySprite) => {
            const fb = fbSprite.fireballRef;
            const enemy = enemySprite.enemyRef;
            if(!enemy || !fb) return;
            enemy.hitByFireball(fb);                
        });
    }

    handlePlayerEnemyCollision(playerSprite, enemySprite) {
        const enemy = enemySprite.enemyRef;
        const player = this.player;
        
        if (!enemy || !enemy.alive) return;

        if (enemySprite.tempIgnorePlayer) return;

        const isKoopa = enemy.type === 'koopa' || enemy.isKoopa;
        
        // Calcular dirección de la colisión
        const playerBottom = playerSprite.body.bottom;
        const enemyTop = enemySprite.body.top;
        const verticalOverlap = playerBottom - enemyTop;
        
        // Si el jugador está cayendo y se superpone significativamente por arriba -> STOMP
        if (playerSprite.body.velocity.y > 0 && verticalOverlap > 0 && verticalOverlap < 10) {
            enemy.stomped();
            playerSprite.setVelocityY(-250);
        } 
        // Si no es stomp y el jugador no ignora colisiones laterales
        else if (!player.ignoreEnemySide) {
            if(isKoopa && ['SHELL_STATIONARY', 'REVIVE_WARNING'].includes(enemy.state)){
                const dir = playerSprite.x < enemySprite.x ? 1 : -1;
                enemy.kick(dir);
            } else {
                enemy.hitPlayer(player);
            }
        }
        // Si ignoreEnemySide es true, NO HACER NADA - permitir superposición
    }

    handleEnemySpawning(){
        const playerX = this.player.sprite.x;
        const activationDistance = 200;

        this.enemySpawnData.forEach(data => {
            if(!data.spawned && data.x - playerX < activationDistance){
                data.spawned = true;

                let enemy;
                if(data.type === 'goomba'){
                    enemy = new Goomba(this.scene, data.x, data.y, {type: 'goomba'});
                } else if(data.type === 'koopa'){
                    enemy = new Koopa(this.scene, data.x, data.y, {type: 'koopa'});
                }

                if(enemy){
                    this.enemies.add(enemy.sprite);
                }
            }
        })
    }

    update(){
        if(!this.enemies) return;
        this.handleEnemySpawning();
        this.enemies.getChildren().forEach(e => e.enemyRef.update());
    }

    getEnemies(){
        return this.enemies;
    }

    getEnemySpawnData(){
        return this.enemySpawnData;
    }

};