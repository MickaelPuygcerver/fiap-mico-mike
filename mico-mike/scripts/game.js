//Variaveis globais
var game;
var platforms;
var player;
var pontuacao = 0;
var level = 1;
var count = 0;
var trees;
var seconds = 0;
var lifes = 3;

var gameOptions = {
    gravity: 900,

    playerStartXY: [100, 300],
    playerBounce: 0,
    playerJump: 300,

    platformX: 584,
    platformY: 584,
    platformSpeed: 200,
    platformWidth: 4000,

    treeRangeScale: [0.8, 1.2],
    treePercent: 100,
    incrementoDePontuacao: 10,
}

// Inicio
window.onload = function () {
    game = initGame();
    criaMenuEInstrucoes();
    atualizaElementoCanvas();
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
        scene: [mainMenuScene, preloadGame, playGame, gameOver] // carrega a classe 'preLoad' e carrega a classe 'playGame'
    }
}

class mainMenuScene extends Phaser.Scene {
    constructor() {
        super('MainMenuScene');
    }

    //Carrega assets e sprite sheets
    preload() {
        this.load.image('menu', 'assets/menu_v3.png');
    }

    create() {
        this.add.image(game.config.width / 2, game.config.height / 2, 'menu');
        this.cursors = this.input.keyboard.createCursorKeys();
        this.pointer = this.input.activePointer;
    }

    update() {
        if (this.pointer.isDown || this.cursors.space.isDown) {
            this.scene.start("PreloadGame");
        }
    }
}

//Carrega os assets e sprite sheets e animacao do Player
class preloadGame extends Phaser.Scene {
    constructor() {
        super('PreloadGame');
    }

    //Carrega assets e sprite sheets
    preload() {
        this.load.spritesheet("tree", "assets/tree.png", { frameWidth: 60, frameHeight: 95 });
        this.load.image('platform', 'assets/platform.png');
        this.load.image('background', 'assets/background.png');
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

        this.scene.start("PlayGame");
    }
}

class playGame extends Phaser.Scene {
    constructor() {
        super('PlayGame');
    }

    // Desenha/exibe a imagem que foi carregada no preload e cria outros 'Game Objects'
    create() {
        lifes = 3;
        this.gameOptions = getDefaultGameOptions();
        this.level = level;
        this.pontuacao = pontuacao;
        this.count = count;
        this.seconds = seconds;

        // Exibe background
        this.add.image(game.config.width / 2, game.config.height / 2, 'background');

        // keeping track of added platforms
        this.addedPlatforms = 0;

        // Adiciona o jogador
        this.player = this.physics.add.sprite(this.gameOptions.playerStartXY[0], this.gameOptions.playerStartXY[1], 'dude');
        this.player.setBounce(this.gameOptions.playerBounce);
        this.player.setGravityY(this.gameOptions.gravity);
        this.player.anims.play('run');

        this.trees = this.physics.add.group();
        // this.physics.add.collider(this.player, this.trees, treeColider, null, this);

        // Cria grupo de plataformas ativas
        this.platformGroup = this.add.group({
            // Uma vez removida do grupo, uma plataforma é adicionada ao pool
            removeCallback: function (platform) {
                platform.scene.platformPool.add(platform)
            }
        });

        // Cria pool de plataformas
        this.platformPool = this.add.group({
            // Uma vez removida da pool, uma plataforma é adicionada ao grupo de plataformas ativas
            removeCallback: function (platform) {
                platform.scene.platformGroup.add(platform)
            }
        });

        // Cria grupo de arvores ativas
        this.treeGroup = this.add.group({
            removeCallback: function (tree) {
                tree.scene.treePool.add(tree)
            }
        });

        // Cria pool de arvores
        this.treePool = this.add.group({
            removeCallback: function (tree) {
                tree.scene.treeGroup.add(tree)
            }
        });

        // Adiciona plataforma ao game
        this.addPlatform(this.gameOptions.platformWidth, this.gameOptions.platformX, this.gameOptions.platformY);

        this.physics.add.collider(this.player, this.platformGroup); // Colisao Player X Plataforma
        this.physics.add.overlap(this.player, this.treeGroup, null, treeColider, this);// Colisao Player X Arvores  
        // this.physics.add.collider(this.player, this.treeGroup, treeColider, null, this); // Colisao Player X Arvores    

        this.pontuacaoText = this.createTextPoint(this);
        this.levelText = this.createTextLevel(this);
        this.lifeText = this.createTextLife(this);

        this.cursors = this.input.keyboard.createCursorKeys(); // Instancia a variavel que recebe o valor das teclas
        this.pointer = this.input.activePointer; // Instancia a variavel que recebe o valor dos click's de mouse
        this.gameStarted = true;
    }

    // Cria texto de pontuacao
    createTextPoint(object) {
        return object.add.text(16, 16, 'Pontuação: 0', { fontFamily: 'MV Boli', fontSize: '25px', fill: '#fff' });
    }

    // Cria texto de nível
    createTextLevel(object) {
        return object.add.text(16, 46, 'Nível: 1', { fontFamily: 'MV Boli', fontSize: '25px', fill: '#fff' });
    }

    // Cria texto de Vidas
    createTextLife(object) {
        return object.add.text(game.config.width - 70, 16, '♥ ' + lifes, { fontFamily: 'MV Boli Bold', fontSize: '35px', fill: '#fc2003' });
    }

    incrementSeconds = () => {
        if (!this.gameStarted) { return; }

        this.seconds += 1;
        this.count++;

        if (this.seconds == 15) {
            this.seconds = 0;
            // this.gameOptions.treePercent += 20;
            this.gameOptions.incrementoDePontuacao += 10;
            this.level++;
            this.gameOptions.platformSpeed += this.gameOptions.platformSpeed < 300 ? 10 : 0;
            this.gameOptions.platformWidth -= this.gameOptions.platformWidth > 2000 ? 100 : 0;
            this.gameOptions.treeRangeScale[0] += 0.1;
            this.gameOptions.treeRangeScale[1] += 0.1;

            console.log("gameOptions.treePercent " + this.gameOptions.treePercent);
            console.log("incrementoDePontuacao " + this.gameOptions.incrementoDePontuacao);
            console.log("gameOptions.platformSpeed " + this.gameOptions.platformSpeed);
            console.log("gameOptions.platformWidth " + this.gameOptions.platformWidth);
        }

        this.pontuacao += this.gameOptions.incrementoDePontuacao;
        this.pontuacaoText.setText('Pontuação: ' + this.pontuacao);
        this.levelText.setText("Nível: " + this.level);
    }
    addPlatform(platformWidth, X, Y) {
        this.addedPlatforms++;
        var platform;
        if (this.platformPool.getLength()) {
            platform = this.platformPool.getFirst();
            platform.x = X;
            platform.y = Y;
            platform.active = true;
            platform.visible = true;
            platform.body.setVelocityX(this.getPlatformSpeed());
            this.platformPool.remove(platform);
            platform.displayWidth = platformWidth;
            platform.titleScaleX = 1 / platform.scaleX;
        } else {
            platform = this.add.tileSprite(X, Y, platformWidth, 32, 'platform');
            this.physics.add.existing(platform);
            platform.body.setImmovable(true);
            platform.body.setVelocityX(this.getPlatformSpeed());
            this.platformGroup.add(platform);
        }

        this.nextPlatformDistance = 0;

        console.log(platform.body.velocity.x)

        // Adiciona uma arvore na plataforma
        if (this.addedPlatforms > 1) {
            if (Phaser.Math.Between(1, 100) <= this.gameOptions.treePercent) {
                var scaleX = getRandom(this.gameOptions.treeRangeScale[0], this.gameOptions.treeRangeScale[1]);
                var scaleY = getRandom(this.gameOptions.treeRangeScale[0], this.gameOptions.treeRangeScale[1]);

                let tree = this.physics.add.sprite(game.config.width, game.config.height - (70 * (scaleY * 0.8)), "tree");
                tree.setImmovable(true);
                tree.setVelocityX(this.getPlatformSpeed());
                tree.setScale(scaleX, scaleY);
                tree.setDepth(1);
                this.treeGroup.add(tree);
            }
        }
    }
    // Starta timer
    timer = setInterval(this.incrementSeconds, 1000);

    // Atualiza os desenhos e objetos criados
    update() {

        // Configura botao e altura do pulo
        if (this.pointer.isDown || this.cursors.space.isDown) {
            if (this.player.body.touching.down) {
                this.player.setVelocityY(this.gameOptions.playerJump * - 2);
            }
        }

        this.player.x = this.gameOptions.playerStartXY[0];

        // Removendo plataformas
        var minDistance = game.config.width;
        var rightmostPlatformHeight = 0;
        this.platformGroup.getChildren().forEach(function (platform) {
            var platformDistance = game.config.width - platform.x - platform.displayWidth / 3;
            if (platformDistance < minDistance) {
                minDistance = platformDistance;
                rightmostPlatformHeight = platform.y;
            }
            if (platform.x < - platform.displayWidth / 3) {
                this.platformGroup.killAndHide(platform);
                this.platformGroup.remove(platform);
            }
        }, this);

        // Adicionando plataformas
        if (minDistance > this.nextPlatformDistance) {
            this.addPlatform(this.gameOptions.platformWidth, this.gameOptions.platformX, this.gameOptions.platformY);
        }
    }

    getPlatformSpeed() {
        return this.gameOptions.platformSpeed * -1;
    }
}

function treeColider(player, tree) {

    player.setTint(0xff0000);
    this.treePool.remove(tree);
    tree.destroy();
    lifes--;
    this.lifeText.setText('♥ ' + lifes);

    if (lifes == 0) {
        this.gameStarted = false;
        console.log("Game over");
        // clearInterval(this.timer);
        this.physics.pause();
        player.anims.stop();
        setTimeout(() => { this.scene.start("GameOver"); }, 2000) // Inicia a cena de gameover
    }
    else {
        setTimeout(() => { player.setTint(0xffffff); }, 1000);
    }
    return false;
}

// GAME OVER
class gameOver extends Phaser.Scene {
    constructor() {
        super('GameOver');
    }

    //Carrega assets e sprite sheets
    preload() {
        this.load.image('over', 'assets/game-over-bg.png');
    }

    create() {
        this.add.image(game.config.width / 2, game.config.height / 2, 'over');
        this.cursors = this.input.keyboard.createCursorKeys();
        this.pointer = this.input.activePointer;
    }

    update() {
        if (this.pointer.isDown || this.cursors.space.isDown) {
            setTimeout(() => { this.scene.start("MainMenuScene"); }, 500)
        }
    }
}

function getRandom(min, max) {
    return Math.random() * (max - min) + min;
}

function getDefaultGameOptions() {
    return {
        gravity: 900,
        playerStartXY: [100, 300],
        playerBounce: 0,
        playerJump: 300,

        platformX: 584,
        platformY: 584,
        platformSpeed: 200,
        platformWidth: 4000,

        treeRangeScale: [0.8, 1.2],
        treePercent: 100,
        incrementoDePontuacao: 10,
    }
}