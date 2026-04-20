const config = {
    type: Phaser.AUTO,
    width: 400,
    height: 300,
    backgroundColor: "#05051d",

    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },

    scene: {
        preload,
        create,
        update
    }
};

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

const game = new Phaser.Game(config);

// ---------------- PRELOAD ----------------
function preload() {
    this.load.image('ring', 'assets/ring.png');
    
    // PLAYER
    this.load.image('p_idle', 'assets/player_idle.png');
    this.load.image('p_left', 'assets/player_left.png');
    this.load.image('p_right', 'assets/player_right.png');
    this.load.image('p_punch', 'assets/player_punch.png');

    // ENEMY
    this.load.image('e_idle', 'assets/enemy_idle.png');
    this.load.image('e_attack', 'assets/enemy_attack.png');
    this.load.image('e_dodge', 'assets/enemy_dodge.png');
    this.load.image('e_hit', 'assets/enemy_hit.png');

    this.load.audio('punch', 'assets/punch.wav');
    this.load.audio('music', 'assets/music.mp3');
}

// ---------------- CREATE ----------------
function create() {
    this.add.image(200, 180, 'ring').setScale(0.26);

    enemy = this.add.image(200, 180, 'e_idle').setScale(0.2);
    player = this.add.image(200, 240, 'p_idle').setScale(0.2);

    playerBar = this.add.rectangle(20, 20, 100, 10, 0x00ff00).setOrigin(0, 0);
    enemyBar = this.add.rectangle(280, 20, 100, 10, 0xff0000).setOrigin(0, 0);

    cursors = this.input.keyboard.createCursorKeys();

    punchSound = this.sound.add('punch');
    music = this.sound.add('music', { loop: true, volume: 0.3 });
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

    // ESQUIVE
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

    // GOLPE
    if (Phaser.Input.Keyboard.JustDown(cursors.space) && canPunch && !enemyAttacking) {

        punchSound.play();

        canPunch = false;
        setTimeout(() => canPunch = true, 500);

        player.setTexture('p_punch');

        setTimeout(() => {
            player.setTexture('p_idle');
        }, 150);

        let distance = Math.abs(player.x - enemy.x);

        if (distance < 50) {

            // ESQUIVE ENEMIGO
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