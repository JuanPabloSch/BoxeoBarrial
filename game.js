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
        // imágenes de enemigos (caras o sprites)
        this.load.image('enemy1', 'assets/enemy/caralucas/caralucas.png');
        this.load.image('enemy2', 'assets/enemy/negrouu/negrouu.png');
        this.load.image('enemy3', 'assets/enemy/santos/santos.png');
        this.load.image('enemy4', 'assets/enemy/sebu/sebu.png');
        this.load.image('enemy5', 'assets/enemy/nahui/nahui.png');
        this.load.image('enemy6', 'assets/enemy/el oscar/el oscar.png');
        this.load.image('enemy7', 'assets/enemy/juano/juano.png');
        this.load.image('enemy8', 'assets/enemy/chino/chino.png');

        this.load.audio('select_music', 'assets/sounds/select.mp3');
    }

    create() {
        this.add.text(90, 20, 'Elegí tu rival', {
            fontSize: '20px',
            fill: '#ffffff'
        });

        // música
        this.music = this.sound.add('select_music', { loop: true, volume: 0.4 });
        this.music.play();

        // enemigos (botones)
        let e1 = this.add.image(80, 120, 'enemy1').setScale(0.06).setInteractive();
        let e2 = this.add.image(160, 120, 'enemy2').setScale(0.06).setInteractive();
        let e3 = this.add.image(240, 120, 'enemy3').setScale(0.06).setInteractive();
        let e4 = this.add.image(320, 120, 'enemy4').setScale(0.06).setInteractive();
        let e5 = this.add.image(80, 220, 'enemy5').setScale(0.06).setInteractive();
        let e6 = this.add.image(160, 220, 'enemy6').setScale(0.06).setInteractive();
        let e7 = this.add.image(240, 220, 'enemy7').setScale(0.06).setInteractive();
        let e8 = this.add.image(320, 220, 'enemy8').setScale(0.06).setInteractive();

        e1.on('pointerdown', () => this.selectEnemy('caralucas'));
        e2.on('pointerdown', () => this.selectEnemy('negrouu'));
        e3.on('pointerdown', () => this.selectEnemy('santos'));
        e4.on('pointerdown', () => this.selectEnemy('sebu'));
        e5.on('pointerdown', () => this.selectEnemy('nahui'));
        e6.on('pointerdown', () => this.selectEnemy('el oscar'));
        e7.on('pointerdown', () => this.selectEnemy('juano'));
        e8.on('pointerdown', () => this.selectEnemy('chino'));
    }

    selectEnemy(enemyKey) {
        this.music.stop();

        // 👇 guardamos el enemigo elegido
        this.registry.set('enemySelected', enemyKey);

        this.scene.start('GameScene');
    }
}

// 👇 ESTE ES EL FIX IMPORTANTE
class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
    }

    preload() {
        preload.call(this);
    }

    create() {
        create.call(this);
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
    scene: [MenuScene, SelectScene, GameScene]
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

// ---------------- PRELOAD ----------------
function preload() {
    this.load.image('ring', 'assets/ring.png');

    this.load.image('p_idle', 'assets/player_idle.png');
    this.load.image('p_left', 'assets/player_left.png');
    this.load.image('p_right', 'assets/player_right.png');
    this.load.image('p_punch', 'assets/player_punch.png');

    this.load.image('e_idle', 'assets/enemy_idle.png');
    this.load.image('e_attack', 'assets/enemy_attack.png');
    this.load.image('e_dodge', 'assets/enemy_dodge.png');
    this.load.image('e_hit', 'assets/enemy_hit.png');

    this.load.audio('punch', 'assets/punch.wav');
    this.load.audio('music_caralucas', 'assets/enemy/caralucas/music.mp3');
    this.load.audio('music_negrouu', 'assets/enemy/negrouu/music.mp3');
    this.load.audio('music_santos', 'assets/enemy/santos/music.mp3');
    this.load.audio('music_sebu', 'assets/enemy/sebu/music.mp3');
    this.load.audio('music_nahui', 'assets/enemy/nahui/music.mp3');
    this.load.audio('music_oscar', 'assets/enemy/el oscar/music.mp3');
    this.load.audio('music_juano', 'assets/enemy/juano/music.mp3');
    this.load.audio('music_chino', 'assets/enemy/chino/music.mp3');

}

// ---------------- CREATE ----------------
    function create() {
    this.add.image(200, 180, 'ring').setScale(0.26);

    let selected = this.registry.get('enemySelected');

    let enemySprite = 'e_idle'; // default

    let enemiesConfig = {
    caralucas: { sprite: 'caralucas_idle', music: 'music_caralucas' },
    negrouu: { sprite: 'negrouu_idle', music: 'music_negrouu' },
    santos: { sprite: 'santos_idle', music: 'music_santos' },
    sebu: { sprite: 'sebu_idle', music: 'music_sebu' },
    nahui: { sprite: 'nahui_idle', music: 'music_nahui' },
    'el oscar': { sprite: 'oscar_idle', music: 'music_oscar' },
    juano: { sprite: 'juano_idle', music: 'music_juano' },
    chino: { sprite: 'chino_idle', music: 'music_chino' }
    };

let selected = this.registry.get('enemySelected');
let enemyData = enemiesConfig[selected];

enemy = this.add.image(200, 180, enemyData.sprite).setScale(0.2);

music = this.sound.add(enemyData.music, { loop: true, volume: 0.3 });
music.play();

    enemy = this.add.image(200, 180, enemySprite).setScale(0.2);

    player = this.add.image(200, 240, 'p_idle').setScale(0.2);

    playerBar = this.add.rectangle(20, 20, 100, 10, 0x00ff00).setOrigin(0, 0);
    enemyBar = this.add.rectangle(280, 20, 100, 10, 0xff0000).setOrigin(0, 0);

    cursors = this.input.keyboard.createCursorKeys();

    punchSound = this.sound.add('punch');
    
    let musicKey = 'music_chino'; // default

    music = this.sound.add(musicKey, { loop: true, volume: 0.3 });
    music.play();

    this.time.addEvent({
        delay: 2000,
        callback: enemyAttack,
        callbackScope: this,
        loop: true
    });
}

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