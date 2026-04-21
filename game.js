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
        this.load.image('enemy1', 'assets/enemy/caralucas/caralucas.png');
        this.load.image('enemy2', 'assets/enemy/negrouu/negrouu.png');
        this.load.image('enemy3', 'assets/enemy/santos/santos.png');
        this.load.image('enemy4', 'assets/enemy/sebu/sebu.png');
        this.load.image('enemy5', 'assets/enemy/nahui/nahui.png');
        this.load.image('enemy6', 'assets/enemy/oscar/oscar.png');
        this.load.image('enemy7', 'assets/enemy/juano/juano.png');
        this.load.image('enemy8', 'assets/enemy/chino/chino.png');

        this.load.audio('select_music', 'assets/sounds/select.mp3');
    }

    create() {
        this.add.text(90, 20, 'Elegí tu rival', {
            fontSize: '20px',
            fill: '#ffffff'
        });
        this.borders = [];
        this.music = this.sound.add('select_music', { loop: true, volume: 0.4 });
        this.music.play();

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

        this.icons = [];

        this.enemigos.forEach(e => {
    let sprite = this.add.image(e.x, e.y, e.img).setScale(0.06);
    this.icons.push(sprite);

    let rect = this.add.rectangle(e.x, e.y, 60, 90)
        .setStrokeStyle(3, 0xffff00)
        .setAlpha(0) // empieza invisible

    // 👇 animación de parpadeo
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
        if (Phaser.Input.Keyboard.JustDown(this.cursors.right)) {
            this.seleccion = (this.seleccion + 1) % this.enemigos.length;
        }

        if (Phaser.Input.Keyboard.JustDown(this.cursors.left)) {
            this.seleccion = (this.seleccion - 1 + this.enemigos.length) % this.enemigos.length;
        }

        if (Phaser.Input.Keyboard.JustDown(this.cursors.down)) {
            this.seleccion = (this.seleccion + 4) % this.enemigos.length;
        }

        if (Phaser.Input.Keyboard.JustDown(this.cursors.up)) {
            this.seleccion = (this.seleccion - 4 + this.enemigos.length) % this.enemigos.length;
        }

        // resaltado
        this.borders.forEach((border, i) => {
        border.setVisible(i === this.seleccion);
    });

        // seleccionar
        if (Phaser.Input.Keyboard.JustDown(this.space)) {
            let elegido = this.enemigos[this.seleccion];

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
        // jugador (usamos idle)
        this.load.image('p_idle', 'assets/player_idle.png');

        // enemigos
        this.load.image('caralucas_idle', 'assets/enemy/caralucas/caralucas.png');
        this.load.image('negrouu_idle', 'assets/enemy/negrouu/negrouu.png');
        this.load.image('santos_idle', 'assets/enemy/santos/santos.png');
        this.load.image('sebu_idle', 'assets/enemy/sebu/sebu.png');
        this.load.image('nahui_idle', 'assets/enemy/nahui/nahui.png');
        this.load.image('oscar_idle', 'assets/enemy/oscar/oscar.png');
        this.load.image('juano_idle', 'assets/enemy/juano/juano.png');
        this.load.image('chino_idle', 'assets/enemy/chino/chino.png');
    }

    create() {
        this.cameras.main.setBackgroundColor('#000000');

        let selected = this.registry.get('enemySelected');

        let enemiesConfig = {
            caralucas: 'caralucas_idle',
            negrouu: 'negrouu_idle',
            santos: 'santos_idle',
            sebu: 'sebu_idle',
            nahui: 'nahui_idle',
            oscar: 'oscar_idle',
            juano: 'juano_idle',
            chino: 'chino_idle'
        };

        let enemySprite = enemiesConfig[selected];

        // jugador izquierda
        player = this.add.image(200, 240, 'p_idle')
        .setScale(0.2)
        .setAlpha(0); // invisible

        // enemigo derecha
        let enemy = this.add.image(500, 150, enemySprite).setScale(0.3);

        // texto VS
        let vsText = this.add.text(80, 130, "VS", {
            fontSize: "40px",
            fill: "#ff0000"
        }).setAlpha(0);

        // animaciones entrada
        this.tweens.add({
            targets: player,
            x: 120,
            duration: 400,
            ease: 'Power2'
        });

        this.tweens.add({
            targets: enemy,
            x: 280,
            duration: 400,
            ease: 'Power2'
        });

        this.tweens.add({
            targets: vsText,
            alpha: 1,
            duration: 300,
            delay: 300
        });

        // pasar a pelea
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
        this.load.image('ring', 'assets/ring.png');

        this.load.image('p_idle', 'assets/player_idle.png');
        this.load.image('p_left', 'assets/player_left.png');
        this.load.image('p_right', 'assets/player_right.png');
        this.load.image('p_punch', 'assets/player_punch.png');

        this.load.image('caralucas_idle', 'assets/enemy/caralucas/caralucas.png');
        this.load.image('negrouu_idle', 'assets/enemy/negrouu/negrouu.png');
        this.load.image('santos_idle', 'assets/enemy/santos/santos.png');
        this.load.image('sebu_idle', 'assets/enemy/sebu/sebu.png');
        this.load.image('nahui_idle', 'assets/enemy/nahui/nahui.png');
        this.load.image('oscar_idle', 'assets/enemy/eoscar/oscar.png');
        this.load.image('juano_idle', 'assets/enemy/juano/juano.png');
        this.load.image('chino_idle', 'assets/enemy/chino/chino.png');

        this.load.image('e_attack', 'assets/enemy_attack.png');
        this.load.image('e_dodge', 'assets/enemy_dodge.png');
        this.load.image('e_hit', 'assets/enemy_hit.png');

        this.load.audio('punch', 'assets/punch.wav');

        this.load.audio('music_caralucas', 'assets/enemy/caralucas/music.mp3');
        this.load.audio('music_negrouu', 'assets/enemy/negrouu/music.mp3');
        this.load.audio('music_santos', 'assets/enemy/santos/music.mp3');
        this.load.audio('music_sebu', 'assets/enemy/sebu/music.mp3');
        this.load.audio('music_nahui', 'assets/enemy/nahui/music.mp3');
        this.load.audio('music_oscar', 'assets/enemy/oscar/music.mp3');
        this.load.audio('music_juano', 'assets/enemy/juano/music.mp3');
        this.load.audio('music_chino', 'assets/enemy/chino/music.mp3');
    }

    create() {
        this.add.image(200, 180, 'ring').setScale(0.26);
        this.cameras.main.fadeIn(300);
        let selected = this.registry.get('enemySelected');

        let enemiesConfig = {
            caralucas: { sprite: 'caralucas_idle', music: 'music_caralucas' },
            negrouu: { sprite: 'negrouu_idle', music: 'music_negrouu' },
            santos: { sprite: 'santos_idle', music: 'music_santos' },
            sebu: { sprite: 'sebu_idle', music: 'music_sebu' },
            nahui: { sprite: 'nahui_idle', music: 'music_nahui' },
            oscar: { sprite: 'oscar_idle', music: 'music_oscar' },
            juano: { sprite: 'juano_idle', music: 'music_juano' },
            chino: { sprite: 'chino_idle', music: 'music_chino' }
        };

        let enemyData = enemiesConfig[selected];

        enemy = this.add.image(200, 180, enemyData.sprite).setScale(0.2);
        player = this.add.image(200, 240, 'p_idle').setScale(0.2);

        playerBar = this.add.rectangle(20, 20, 100, 10, 0x00ff00).setOrigin(0, 0);
        enemyBar = this.add.rectangle(280, 20, 100, 10, 0xff0000).setOrigin(0, 0);

        cursors = this.input.keyboard.createCursorKeys();

        punchSound = this.sound.add('punch');

        music = this.sound.add(enemyData.music, { loop: true, volume: 0.3 });
        music.play();

        this.time.addEvent({
            delay: 2000,
            callback: enemyAttack,
            callbackScope: this,
            loop: true
        });
    }

    update() {
        update.call(this);
    }
}

// CONFIG
const config = {
    type: Phaser.AUTO,
    width: 400,
    height: 300,
    backgroundColor: "#05051d",
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    scene: [MenuScene, SelectScene, VsScene, GameScene]
};

const game = new Phaser.Game(config);

// ---------------- VARIABLES ----------------
let player, enemy, cursors;
let punchSound, music;

let enemyHealth = 5;
let playerHealth = 5;

let playerBar, enemyBar;

let canPunch = true;
let canCounter = false;
let enemyAttacking = false;
let enemyStunned = false;

let dodgeTimer = 0;
let dodgeDuration = 300;

let centerX = 200;
let dodgeLeftX = 140;
let dodgeRightX = 260;

let gameOver = false;

// ---------------- UPDATE ----------------
function update() {
    if (gameOver) return;

    if (dodgeTimer > 0) {
        dodgeTimer -= this.game.loop.delta;
    } else {
        player.x = centerX;
        player.setTexture('p_idle');
    }

    if (Phaser.Input.Keyboard.JustDown(cursors.left)) {
        player.x = dodgeLeftX;
        dodgeTimer = dodgeDuration;
        player.setTexture('p_left');
    }

    if (Phaser.Input.Keyboard.JustDown(cursors.right)) {
        player.x = dodgeRightX;
        dodgeTimer = dodgeDuration;
        player.setTexture('p_right');
    }

    if (Phaser.Input.Keyboard.JustDown(cursors.space) && canPunch && !enemyAttacking) {

        punchSound.play();

        canPunch = false;
        setTimeout(() => canPunch = true, 500);

        player.setTexture('p_punch');
        setTimeout(() => player.setTexture('p_idle'), 150);

        let distance = Math.abs(player.x - enemy.x);

        if (distance < 50) {

            let dodgeChance = canCounter ? 0.2 : 0.5;

            if (Math.random() < dodgeChance && !enemyStunned) {
                enemy.setTexture('e_dodge');

                this.tweens.add({
                    targets: enemy,
                    x: enemy.x + (Math.random() < 0.5 ? -40 : 40),
                    duration: 150,
                    yoyo: true
                });

                setTimeout(() => enemy.setTexture('e_idle'), 200);
                return;
            }

            let damage = canCounter ? 2 : 1;
            enemyHealth -= damage;
            enemyHealth = Math.max(0, enemyHealth);

            enemyBar.width = enemyHealth * 20;

            enemy.setTexture('e_hit');
            setTimeout(() => enemy.setTexture('e_idle'), 200);

            if (canCounter) {
                this.cameras.main.shake(200, 0.02);

                enemyStunned = true;
                enemy.setTint(0xffff00);

                setTimeout(() => {
                    enemyStunned = false;
                    enemy.clearTint();
                }, 1000);
            }

            canCounter = false;

            if (enemyHealth <= 0) {
                enemyBar.width = 0;
                enemy.setTint(0xff0000);
                gameOver = true;

                this.add.text(150, 10, "GANASTE!", {
                    fontSize: "20px",
                    fill: "#00ff00"
                });
            }
        }
    }
}

// ---------------- ENEMY ATTACK ----------------
function enemyAttack() {
    if (gameOver || enemyStunned) return;

    enemyAttacking = true;

    let attackSide = Math.random() < 0.5 ? "left" : "right";

    enemy.setTexture('e_attack');
    enemy.setTint(0xffaaaa);

    if (attackSide === "left") enemy.x -= 20;
    else enemy.x += 20;

    setTimeout(() => {

        enemy.x = 200;
        enemy.clearTint();

        let dodged =
            (attackSide === "left" && player.x === dodgeRightX) ||
            (attackSide === "right" && player.x === dodgeLeftX);

        if (!dodged) {
            playerHealth--;
            playerHealth = Math.max(0, playerHealth);

            playerBar.width = playerHealth * 20;

            player.setTint(0xff0000);
            setTimeout(() => player.clearTint(), 100);

            if (playerHealth <= 0) {
                gameOver = true;

                this.add.text(150, 10, "PERDISTE!", {
                    fontSize: "20px",
                    fill: "#ff0000"
                });
            }
        } else {
            canCounter = true;

            enemy.setTint(0x00ff00);

            setTimeout(() => {
                canCounter = false;
                enemy.clearTint();
            }, 1000);
        }

        enemy.setTexture('e_idle');
        enemyAttacking = false;

    }, 500);
}