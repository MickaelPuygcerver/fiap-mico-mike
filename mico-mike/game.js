//Variaveis globais
var game;
var platforms;
var player;
var cursors;
var pontuacao = 0;
var pontuacaoText;
var levelText;
var gameOver = false;
var count = 0;
var countLimite = 200;
var level = 1;
var trees;
var platformVelocity;
var seconds = 0;

var gameOptions = {
    gravity: 900,

    playerStartXY: [100, 300],
    playerBounce: 0,
    playerJump: 300,

    platformX: 584,
    platformY: 584,
    platformSpeedRange: [300, 300],
    platformSpawnRange: [0, 0],
    platformSizeRange: [90, 300],
    platformHeightRange: [-5, 5],
    platformHeightScale: 20,
    platformVerticalLimit: [0.8, 0.8]
}

// Inicio
window.onload = function () {
    game = initGame();
}

// Instancia o phaser com a configuracao definida
function initGame() {
    return new Phaser.Game(defaultConfiguration());
}

// Configuracao padrao do Game/Phaser
function defaultConfiguration() {
    return {
        type: Phaser.AUTO,
        width: 800,
        height: 600,
        physics: {
            default: 'arcade', // configura fisica do game estilo arcade
        },
        scene: [preloadGame, playGame] // carrega a classe 'preLoad' e carrega a classe 'playGame'
    }
}

//Carrega os assets e sprite sheets e animacao do Player
class preloadGame extends Phaser.Scene {
    constructor() {
        super('PreloadGame');
    }

    //Carrega os assets e sprite sheets
    preload() {
        this.load.spritesheet("tree", "assets/tree.png", { frameWidth: 60, frameHeight: 95 });
        this.load.image('platform', 'assets/platform.png');
        this.load.image('background', 'assets/background2.png');
        this.load.spritesheet('dude', 'assets/mike-running.png', { frameWidth: 84, frameHeight: 93 });
    }
    // Carrega animacao do Player
    create() {
        this.anims.create({
            key: 'run',
            frames: this.anims.generateFrameNumbers('dude', { start: 0, end: 7 }),
            frameRate: 16,
            repeat: -1
        })

        // Instancia a variavel que ira controlar a movimentacao do player
        cursors = this.input.keyboard.createCursorKeys();
        this.scene.start("PlayGame");
        //this.physics.add.collider(this.player, this.trees, encostaBomba, null, this); 
    }
}

class playGame extends Phaser.Scene {
    constructor() {
        super('PlayGame');
    }

    // Desenha/exibe a imagem que foi carregada no preload e cria outros 'Game Objects'
    create() {

        // Exibe background
        this.add.image(game.config.width / 2, game.config.height / 2, 'background');

        // keeping track of added platforms
        this.addedPlatforms = 0;

        // Adiciona o jogador
        this.player = this.physics.add.sprite(gameOptions.playerStartXY[0], gameOptions.playerStartXY[1], 'dude');
        this.player.setBounce(gameOptions.playerBounce);
        this.player.setGravityY(gameOptions.gravity);
        this.player.anims.play('run');

        this.trees = this.physics.add.group();
        this.physics.add.collider(this.player, this.trees, treeColider, null, this);

        // group with all active platforms.
        this.platformGroup = this.add.group({
            // once a platform is removed, it's added to the pool
            removeCallback: function (platform) {
                platform.scene.platformPool.add(platform)
            }
        });

        // platform pool
        this.platformPool = this.add.group({
            // once a platform is removed from the pool, it's added to the active platforms group
            removeCallback: function (platform) {
                platform.scene.platformGroup.add(platform)
            }
        });

        // Adiciona plataforma ao game
        this.addPlatform(game.config.width * 3, gameOptions.platformX, gameOptions.platformY);

        // Colisao Player X Plataforma
        this.physics.add.collider(this.player, this.platformGroup);

        // Cria objeto de pontuacao
        pontuacaoText = criaObjetoPontuacao(this);
        levelText = createTextLevel(this);
    }

    incrementSeconds = () => {
        seconds += 1;
        count ++;

        const initiallimit = 5;
        let limit = 
         level == 2 ? 4 :
         level == 3 ? 3 : 
         level == 4 ? 2 : initiallimit;

console.log(limit);

        if (count >= limit){
            this.createTree(game.config.width, game.config.height - 70, platformVelocity);
            count = 0;
        }

        if (seconds % 5 == 0) {
            pontuacao += 10;
            pontuacaoText.setText('Pontuação: ' + pontuacao);
        }

        this.setLevel();
    }

    setLevel = () => {
        if (pontuacao >= 120)
            level = 4;
        else
            if (pontuacao >= 60)
                level = 3;
            else
                if (pontuacao >= 30)
                    level = 2;

        levelText.setText("Nível " + level);
    }

    timer = setInterval(this.incrementSeconds, 1000);

    addPlatform(platformWidth, X, Y) {
        this.addedPlatforms++;
        var platform;
        if (this.platformPool.getLength()) {
            platform = this.platformPool.getFirst();
            platform.x = X;
            platform.y = Y;
            platform.active = true;
            platform.visible = true;
            this.platformPool.remove(platform);
            var newRatio = platformWidth / platform.displayWidtj;
            platform.displayWidth = platformWidth;
            platform.titleScaleX = 1 / platform.scaleX;
        } else {
            platform = this.add.tileSprite(X, Y, platformWidth, 32, 'platform');
            this.physics.add.existing(platform);
            platform.body.setImmovable(true);
            platform.body.setVelocityX(Phaser.Math.Between(gameOptions.platformSpeedRange[0], gameOptions.platformSpeedRange[1]) * - 1);
            this.platformGroup.add(platform);
        }

        this.nextPlatformDistance = Phaser.Math.Between(gameOptions.platformSpawnRange[0], gameOptions.platformSpawnRange[1]);
        platformVelocity = platform.body.velocity.x;
    }


    createTree = (posX, posY, velocity) => {
        let tree = this.trees.create(posX, posY, "tree");

        //tree.setCollideWorldBounds(true);
        tree.setImmovable(true);
        tree.setVelocityX(velocity);
        tree.setScale(getRandom(0.8, 1.2), getRandom(0.8, 1.2));
        tree.setDepth(1);
    }


    // Atualiza os desenhos e objetos criados
    update() {

        if (gameOver) return;

        var pointer = this.input.activePointer;

        // Configura botao e altura do pulo
        if (pointer.isDown || cursors.space.isDown) {
            if (this.player.body.touching.down) {
                this.player.setVelocityY(gameOptions.playerJump * - 2);
            }
        }

        this.player.x = gameOptions.playerStartXY[0];

        // Removendo plataformas
        var minDistance = game.config.width;
        var rightmostPlatformHeight = 0;
        this.platformGroup.getChildren().forEach(function (platform) {
            var platformDistance = game.config.width - platform.x - platform.displayWidth / 2;
            if (platformDistance < minDistance) {
                minDistance = platformDistance;
                rightmostPlatformHeight = platform.y;
            }
            if (platform.x < - platform.displayWidth / 2) {
                this.platformGroup.killAndHide(platform);
                this.platformGroup.remove(platform);
            }
        }, this);

        // Adicionando plataformas
        if (minDistance > this.nextPlatformDistance) {
            this.addPlatform(game.config.width * 3, gameOptions.platformX, gameOptions.platformY);
        }

        // if (cursors.left.isDown) {
        //     player.setVelocityX(-200); // Seta velocidade para esquerda (valor horizontal negativo)
        //     player.anims.play('left', true);
        // } else if (cursors.right.isDown) {
        //     player.setVelocityX(200); // Seta velocidade para direita (valor horizontal positivo)
        //     player.anims.play('right', true);
        // } else {
        //     player.setVelocityX(0); // Seta
        //     player.anims.play('turn');
        // }

        // if (cursors.up.isDown && player.body.touching.down) {
        //     player.setVelocityY(-200); // Seta velocidade de pulo
        // }
    }
}

function getRandom(min, max) {
    return Math.random() * (max - min) + min;
}

// Game over
function treeColider(player, tree) {
    clearInterval(this.timer);
    this.physics.pause();
    player.setTint(0xff0000);
    player.anims.stop();
    gameOver = true;
}

// Cria texto de pontuacao
function criaObjetoPontuacao(object) {
    return object.add.text(16, 16, 'Pontuação: 0', { fontFamily: 'MV Boli', fontSize: '25px', fill: '#fff' });
}


createTextLevel = (object) => {
    return object.add.text(game.config.width - 150, 16, 'Nível: 0', { fontFamily: 'MV Boli', fontSize: '25px', fill: '#fff' });
}


function animacaoPlayerEsquerda(object) {
    return {
        key: 'left',
        frames: object.anims.generateFrameNumbers('dude', { start: 0, end: 7 }),
        frameRate: 16,
        repeat: -1
    }
}

function animacaoPlayerDireita(object) {
    return {
        key: 'right',
        frames: object.anims.generateFrameNumbers('dude', { start: 0, end: 7 }),
        frameRate: 16,
        repeat: -1
    }
}

function animacaoPlayerFrente() {
    return {
        key: 'turn',
        frames: [{ key: 'dude', frame: 0 }],
        frameRate: 16
    }
}

function animacaoPlayerCorrer(object) {
    console.log('animacao player')
    return {
        key: 'correr',
        frames: object.anims.generateFrameNumbers('dude', { start: 0, end: 7 }),
        frameRate: 16,
        repeat: -1
    }
}