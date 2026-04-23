class MenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MenuScene' });
    }

    preload() {
        this.load.image('menu_bg', 'assets/background/menu.png');
        this.load.audio('menu_music', 'assets/sounds/menu.mp3');
    }

    create() {
        this.add.image(200, 150, 'menu_bg').setScale(0.3);

        this.music = this.sound.add('menu_music', { loop: true, volume: 0.5 });
        this.music.play();

        this.add.text(110, 260, 'Presioná ESPACIO', {
            fontSize: '18px',
            fill: '#ffffff'
        });

        this.input.keyboard.once('keydown-SPACE', () => {
            this.music.stop();
            this.scene.start('SelectScene');
        });
    }
}

class SelectScene extends Phaser.Scene {
    constructor() {
        super({ key: 'SelectScene' });
    }

    preload() {
        this.load.image('select_bg', 'assets/background/select_bg.png');
        // iconos (selección)
        this.load.image('enemy1', 'assets/enemy/caralucas/caralucas.png');
        this.load.image('enemy2', 'assets/enemy/negrouu/negrouu.png');
        this.load.image('enemy3', 'assets/enemy/santos/santos.png');
        this.load.image('enemy4', 'assets/enemy/sebu/sebu.png');
        this.load.image('enemy5', 'assets/enemy/nahui/nahui.png');
        this.load.image('enemy6', 'assets/enemy/oscar/oscar.png');
        this.load.image('enemy7', 'assets/enemy/juano/juano.png');
        this.load.image('enemy8', 'assets/enemy/chino/chino.png');

        this.load.audio('select_music', 'assets/sounds/select.mp3');
        this.load.audio('select_click', 'assets/sounds/select_click.wav');
    }

    create() {
         // 1️⃣ FONDO
    this.add.image(200, 150, 'select_bg')
        .setDisplaySize(400, 300);

    // 2️⃣ LUCES (arriba del fondo)
    let light = this.add.rectangle(200, 40, 400, 60, 0xff00ff, 0.2);

    this.tweens.add({
        targets: light,
        alpha: { from: 0.1, to: 0.4 },
        duration: 600,
        yoyo: true,
        repeat: -1
    });

    // 3️⃣ HUMO (abajo)
for (let i = 0; i < 8; i++) {

    let smoke = this.add.circle(
        Phaser.Math.Between(0, 400),
        Phaser.Math.Between(260, 290),
        Phaser.Math.Between(20, 40),
        0xffffff,
        0.22 // 👈 un poco más blanco
    );

    smoke.setDepth(1);

    this.tweens.add({
        targets: smoke,
        x: smoke.x + Phaser.Math.Between(-60, 60),
        y: smoke.y - Phaser.Math.Between(10, 25),
        alpha: { from: 0.15, to: 0.3 }, // 👈 más visible
        duration: Phaser.Math.Between(2000, 3500),
        yoyo: true,
        repeat: -1
    });
}

     // 4️⃣ TEXTO Y PERSONAJES (ARRIBA DE TODO)
    this.add.text(200, 20, 'ELEGÍ TU RIVAL', {
    fontSize: '22px',
    fill: '#ffffff',
    stroke: '#bb0ebb',
    strokeThickness: 4,
    fontStyle: 'bold'
    }).setOrigin(0.5);

        this.music = this.sound.add('select_music', { loop: true, volume: 0.4 });
        this.music.play();
        this.selectSound = this.sound.add('select_click', { volume: 0.6 });

        this.enemigos = [
            { key: 'caralucas', x: 80, y: 120, img: 'enemy1' },
            { key: 'negrouu', x: 160, y: 120, img: 'enemy2' },
            { key: 'santos', x: 240, y: 120, img: 'enemy3' },
            { key: 'sebu', x: 320, y: 120, img: 'enemy4' },
            { key: 'nahui', x: 80, y: 220, img: 'enemy5' },
            { key: 'oscar', x: 160, y: 220, img: 'enemy6' },
            { key: 'juano', x: 240, y: 220, img: 'enemy7' },
            { key: 'chino', x: 320, y: 220, img: 'enemy8' }
        ];

        this.borders = [];

        this.enemigos.forEach(e => {
            this.add.image(e.x, e.y, e.img).setScale(0.06);

            let rect = this.add.rectangle(e.x, e.y, 60, 90)
                .setStrokeStyle(3, 0xffff00)
                .setAlpha(0);

            this.tweens.add({
                targets: rect,
                alpha: { from: 0.2, to: 1 },
                duration: 400,
                yoyo: true,
                repeat: -1
            });

            this.borders.push(rect);
        });

        this.seleccion = 0;
        this.cursors = this.input.keyboard.createCursorKeys();
        this.space = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    }

    update() {
        if (Phaser.Input.Keyboard.JustDown(this.cursors.right))
            this.seleccion = (this.seleccion + 1) % 8;

        if (Phaser.Input.Keyboard.JustDown(this.cursors.left))
            this.seleccion = (this.seleccion - 1 + 8) % 8;

        if (Phaser.Input.Keyboard.JustDown(this.cursors.down))
            this.seleccion = (this.seleccion + 4) % 8;

        if (Phaser.Input.Keyboard.JustDown(this.cursors.up))
            this.seleccion = (this.seleccion - 4 + 8) % 8;

        this.borders.forEach((b, i) => b.setVisible(i === this.seleccion));

        if (Phaser.Input.Keyboard.JustDown(this.space)) {
            let elegido = this.enemigos[this.seleccion];
            this.selectSound.play();
            this.music.stop();
            this.registry.set('enemySelected', elegido.key);
            this.scene.start('VsScene');
        }
    }
}

class VsScene extends Phaser.Scene {
    constructor() {
        super({ key: 'VsScene' });
    }

    preload() {
    this.load.image('p_idle', 'assets/player_idle.png');

    let enemigos = ['caralucas','negrouu','santos','sebu','nahui','oscar','juano','chino'];

    enemigos.forEach(e => {
        // 👇 imagen grande (VS)
        this.load.image(e + '_vs', `assets/enemy/${e}/${e}.png`);

        // 👇 opcional si querés mantener idle también cargado acá
        this.load.image(e + '_idle', `assets/enemy/${e}/${e}_idle.png`);
    });
}

    create() {
        this.cameras.main.setBackgroundColor('#000');

        let selected = this.registry.get('enemySelected');

        let player = this.add.image(200, 240, 'p_idle')
            .setScale(0.2)
            .setAlpha(0);

        let enemy = this.add.image(500, 150, selected + '_vs')
        .setScale(0.2); // 👈 más grande queda mejor

        let vs = this.add.text(100, 130, "VS", {
        fontSize: "50px",
        fill: "#ff3b3b",
        stroke: "#000000",
        strokeThickness: 6,
        fontStyle: "bold"
        }).setOrigin(0.5).setAlpha(0);

        this.tweens.add({ targets: player, x: 120, duration: 400 });
        this.tweens.add({ targets: enemy, x: 280, duration: 400 });
        this.tweens.add({ targets: vs, alpha: 1, delay: 300 });

        this.time.delayedCall(1500, () => {
            this.scene.start('GameScene');
        });
    }
}

class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
    }

    preload() {
        this.load.image('ring', 'assets/background/ring.png');

        this.load.image('p_idle', 'assets/player/player_idle.png');
        this.load.image('p_left', 'assets/player/player_left.png');
        this.load.image('p_right', 'assets/player/player_right.png');
        this.load.image('p_punch', 'assets/player/player_punch.png');

        let enemigos = ['caralucas','negrouu','santos','sebu','nahui','oscar','juano','chino'];

        enemigos.forEach(e => {
            this.load.image(e + '_idle', `assets/enemy/${e}/${e}_idle.png`);
            this.load.image(e + '_attack', `assets/enemy/${e}/${e}_attack.png`);
            this.load.image(e + '_hit', `assets/enemy/${e}/${e}_hit.png`);
            this.load.image(e + '_dodge', `assets/enemy/${e}/${e}_dodge.png`);
            this.load.audio('music_' + e, `assets/enemy/${e}/music.mp3`);
        });

        this.load.audio('punch', 'assets/sounds/punch.wav');
        this.load.audio('counter', 'assets/sounds/counter.wav');
        this.load.audio('dodge', 'assets/sounds/dodge.wav');
        this.load.audio('bell', 'assets/sounds/bell.wav');
        this.load.audio('enemyAttack', 'assets/sounds/enemy_attack.wav');
        this.load.audio('enemyDodge', 'assets/sounds/enemy_dodge.wav');
    }

    create() {
        this.add.image(200, 180, 'ring').setScale(0.26);

        let selected = this.registry.get('enemySelected');
        this.enemyKey = selected;

        const enemyStats = {
            caralucas: { health: 6, attackSpeed: 2200, dodgeChance: 0.3, damage: 1 },
            negrouu:   { health: 4, attackSpeed: 1500, dodgeChance: 0.5, damage: 1 },
            santos:    { health: 5, attackSpeed: 1800, dodgeChance: 0.4, damage: 1 },
            sebu:      { health: 7, attackSpeed: 2500, dodgeChance: 0.2, damage: 2 },
            nahui:     { health: 5, attackSpeed: 1700, dodgeChance: 0.6, damage: 1 },
            oscar:     { health: 6, attackSpeed: 2000, dodgeChance: 0.3, damage: 2 },
            juano:     { health: 5, attackSpeed: 1600, dodgeChance: 0.4, damage: 1 },
            chino:     { health: 8, attackSpeed: 2800, dodgeChance: 0.2, damage: 2 }
        };

        this.enemyStats = enemyStats[selected];

        enemy = this.add.image(200, 180, selected + '_idle').setScale(0.2);
        player = this.add.image(200, 240, 'p_idle').setScale(0.2);

        playerBar = this.add.rectangle(20, 20, 100, 10, 0x00ff00).setOrigin(0);
        enemyBar = this.add.rectangle(280, 20, 100, 10, 0xff0000).setOrigin(0);

        enemyHealth = this.enemyStats.health;
        enemyBar.width = enemyHealth * 20;

        cursors = this.input.keyboard.createCursorKeys();
        punchSound = this.sound.add('punch');

        music = this.sound.add('music_' + selected, { loop: true, volume: 0.3 });
        music.play();

        counterSound = this.sound.add('counter');
        dodgeSound = this.sound.add('dodge');
        bellSound = this.sound.add('bell');
        this.enemyAttackSound = this.sound.add('enemyAttack', { volume: 0.6 });
        this.enemyDodgeSound = this.sound.add('enemyDodge', { volume: 0.5 });

        this.setEnemyState = (state) => {
            enemy.setTexture(this.enemyKey + '_' + state);
        };

        this.time.addEvent({
            delay: this.enemyStats.attackSpeed,
            callback: () => enemyAttack.call(this),
            loop: true
        });
                // -------- CONTROLES MOBILE --------
        this.leftPressed = false;
        this.rightPressed = false;
        this.punchPressed = false;

        // ⬅️
        let leftBtn = this.add.rectangle(50, 260, 60, 40, 0x000000, 0.5)
            .setInteractive();

        this.add.text(50, 260, '⬅️').setOrigin(0.5);

        leftBtn.on('pointerdown', () => this.leftPressed = true);
        leftBtn.on('pointerup', () => this.leftPressed = false);
        leftBtn.on('pointerout', () => this.leftPressed = false);

        // ➡️
        let rightBtn = this.add.rectangle(120, 260, 60, 40, 0x000000, 0.5)
            .setInteractive();

        this.add.text(120, 260, '➡️').setOrigin(0.5);

        rightBtn.on('pointerdown', () => this.rightPressed = true);
        rightBtn.on('pointerup', () => this.rightPressed = false);
        rightBtn.on('pointerout', () => this.rightPressed = false);

        // 👊
        let punchBtn = this.add.rectangle(350, 260, 80, 50, 0xff0000, 0.6)
            .setInteractive();

        this.add.text(350, 260, '👊').setOrigin(0.5);

        punchBtn.on('pointerdown', () => this.punchPressed = true);
        punchBtn.on('pointerup', () => this.punchPressed = false);
        punchBtn.on('pointerout', () => this.punchPressed = false);
    }


    update() {
        update.call(this);
    }
}

// CONFIG
new Phaser.Game({
    type: Phaser.AUTO,
    width: 400,
    height: 300,
    scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
    scene: [MenuScene, SelectScene, VsScene, GameScene]
});

// -------- GAME LOGIC --------
let player, enemy, cursors;
let punchSound, music;
let playerBar, enemyBar;

let enemyHealth;
let playerHealth = 10;

let canPunch = true;
let canCounter = false;
let enemyAttacking = false;
let enemyStunned = false;

let dodgeTimer = 0;
let centerX = 200, dodgeLeftX = 140, dodgeRightX = 260;

let gameOver = false;
let counterSound;
let dodgeSound;
let bellSound;

function update() {
    if (gameOver) return;

    if (dodgeTimer > 0) dodgeTimer -= 16;
    else {
        player.x = centerX;
        player.setTexture('p_idle');
    }

    if (Phaser.Input.Keyboard.JustDown(cursors.left) || this.leftPressed) {
        player.x = dodgeLeftX;
        dodgeTimer = 300;
        player.setTexture('p_left');
    }

    if (Phaser.Input.Keyboard.JustDown(cursors.right) || this.rightPressed) {
        player.x = dodgeRightX;
        dodgeTimer = 300;
        player.setTexture('p_right');
    }

    if ((Phaser.Input.Keyboard.JustDown(cursors.space) || this.punchPressed) && canPunch && !enemyAttacking) {
        canPunch = false;
        setTimeout(() => canPunch = true, 500);

        player.setTexture('p_punch');
        setTimeout(() => player.setTexture('p_idle'), 150);

        let distance = Math.abs(player.x - enemy.x);

        if (distance < 50) {

        if (Math.random() < this.enemyStats.dodgeChance && !enemyStunned) {
        
        this.enemyDodgeSound.play();

        this.setEnemyState('dodge');

        let dir = Math.random() < 0.5 ? -1 : 1;

        this.tweens.add({
            targets: enemy,
            x: enemy.x + (40 * dir), // 👈 se corre al costado
            duration: 120,
            ease: 'Power2',
            yoyo: true, // 👈 vuelve solo
            onComplete: () => {
                this.setEnemyState('idle');
            }
        });

        return;
    }


        let damage = canCounter ? 2 : 1;

        enemyHealth -= damage;
        enemyHealth = Math.max(0, enemyHealth);

        enemyBar.width = enemyHealth * 20;

        // 🔊 sonido
        if (canCounter) {
            counterSound.play({ volume: 1.0 }); // fuerte
        } else {
            punchSound.play({ volume: 0.5 }); // normal
        }
        
            this.setEnemyState('hit');
            setTimeout(() => this.setEnemyState('idle'), 200);
            // 👇 SOLO EFECTO (sin cambiar lógica)
        if (canCounter) {
            counterSound.play();

            this.cameras.main.shake(150, 0.015);

            enemy.setTint(0xfff176); // amarillo suave

            setTimeout(() => {
                enemy.clearTint();
            }, 300);

            canCounter = false;
        }

            if (enemyHealth <= 0) {
                music.stop();        // 👈 corta música
                bellSound.play();    // 👈 campana
                gameOver = true;
                this.add.text(200, 20, "GANASTE!", {
                    fontSize: "28px",
                    fill: "#00ff88",
                    stroke: "#003322",
                    strokeThickness: 4,
                    fontStyle: "bold"
                }).setOrigin(0.5);
            }
        }
    }
}

function enemyAttack() {
    if (gameOver || enemyStunned) return;

    enemyAttacking = true;

    let attackSide = Math.random() < 0.5 ? "left" : "right";

    // 🟡 FASE 1: AVISO VISUAL
    enemy.setTint(0xffe066); // amarillo (aviso)
    this.setEnemyState('idle');

    setTimeout(() => {

        // 🔴 FASE 2: ATAQUE REAL
        enemy.clearTint();
        enemy.setTint(0xff6b6b); // rojo (ataque)
        this.setEnemyState('attack');
        this.enemyAttackSound.play();

        if (attackSide === "left") enemy.x -= 20;
        else enemy.x += 20;

        setTimeout(() => {

            enemy.x = 200;
            enemy.clearTint();

            let dodged =
                (attackSide === "left" && player.x === dodgeRightX) ||
                (attackSide === "right" && player.x === dodgeLeftX);

            if (!dodged) {
                playerHealth -= this.enemyStats.damage;
                playerHealth = Math.max(0, playerHealth);

                playerBar.width = playerHealth * 20;

                player.setTint(0xff0000);
                setTimeout(() => player.clearTint(), 100);

                if (playerHealth <= 0) {
                    gameOver = true;
                    music.stop();        // 👈 corta música
                    bellSound.play();    // 👈 campana
                    this.add.text(200, 20, "PERDISTE!", {
                    fontSize: "28px",
                    fill: "#ff4d4d",
                    stroke: "#330000",
                    strokeThickness: 4,
                    fontStyle: "bold"
                }).setOrigin(0.5);
                }
            } else {
            dodgeSound.play(); // 👈 SONIDO SOLO CUANDO EL PLAYER ESQUIVA

            canCounter = true;

            enemy.setTint(0x6bff95);

            setTimeout(() => {
                canCounter = false;
                enemy.clearTint();
            }, 1000);
            this.cameras.main.shake(100, 0.01);
        }

            this.setEnemyState('idle');
            enemyAttacking = false;

        }, 300); // ⏱ tiempo del golpe

    }, 500); // ⏱ tiempo de aviso (clave para jugabilidad)
}