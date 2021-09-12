//Variaveis globais
var game;
var platforms;
var player;
var cursors;
var pontuacao = 0;
var pontuacaoText;
var gameOver = false;
var count = 0;
var countLimite = 200;

var gameOptions = {
    gravity: 900,

    playerStartXY: [100, 300],
    playerBounce: 0,
    playerJump: 400,


    platformX: 584,
    platformY: 584,
    platformSpeedRange: [200, 200],
    platformSpawnRange: [0, 0],
    platformSizeRange: [90, 300],
    platformHeightRange: [-5, 5],
    platformHeightScale: 20,
    platformVerticalLimit: [0.8, 0.8],
}

// Inicio
window.onload = function() {
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
        this.load.image('platform', 'assets/teste.png');
        this.load.image('background', 'assets/background2.png');
        this.load.spritesheet('dude', 'assets/mike-running.png', {frameWidth: 84, frameHeight: 93});
    }
    
    // Carrega animacao do Player
    create() {
        this.anims.create( {
            key: 'run',
            frames: this.anims.generateFrameNumbers('dude', { start: 0, end: 7}),
            frameRate: 16,
            repeat: -1
        })

        // Instancia a variavel que ira controlar a movimentacao do player
        cursors = this.input.keyboard.createCursorKeys();

        this.scene.start("PlayGame");
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

        // group with all active platforms.
        this.platformGroup = this.add.group({
            // once a platform is removed, it's added to the pool
            removeCallback: function(platform){
                platform.scene.platformPool.add(platform)
            }
        });

        // platform pool
        this.platformPool = this.add.group({
            // once a platform is removed from the pool, it's added to the active platforms group
            removeCallback: function(platform){
                platform.scene.platformGroup.add(platform)
            }
        });

        // Adiciona plataforma ao game
        this.addPlatform(game.config.width * 3, gameOptions.platformX, gameOptions.platformY);

        // Adiciona o jogador
        this.player = this.physics.add.sprite(gameOptions.playerStartXY[0], gameOptions.playerStartXY[1], 'dude');
        this.player.setBounce(gameOptions.playerBounce);
        this.player.setGravityY(gameOptions.gravity);

        // Colisao Player X Plataforma
        this.physics.add.collider(this.player, this.platformGroup, function(){
            if(!this.player.anims.isPlaying){
                this.player.anims.play('run');
            }
        }, null, this);

        // Cria objeto de pontuacao
        pontuacaoText = criaObjetoPontuacao(this);
    }

    addPlatform(platformWidth, X, Y) {
        this.addedPlatforms ++;
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
    }

    // Atualiza os desenhos e objetos criados
    update() {
        var pointer = this.input.activePointer;

        count++;

        if ((count == countLimite) || countLimite <= 0) {
            count = 0;
            countLimite -= 10;
            pontuacao += 10;
            pontuacaoText.setText('Pontuação: ' + pontuacao);
        }

        // Configura botao e altura do pulo
        if (pointer.isDown || cursors.space.isDown) {
            if (this.player.body.touching.down) {
                this.player.setVelocityY(gameOptions.playerJump * - 1);
            }
        }

        this.player.x = gameOptions.playerStartXY[0];

        // Removendo plataformas
        var minDistance = game.config.width;
        var rightmostPlatformHeight = 0;
        this.platformGroup.getChildren().forEach(function(platform) {
            var platformDistance = game.config.width - platform.x - platform.displayWidth / 2;
            if(platformDistance < minDistance) {
                minDistance = platformDistance;
                rightmostPlatformHeight = platform.y;
            }
            if(platform.x < - platform.displayWidth / 2) {
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

// Desabilita exibicao da estrela coletada/colidida
function coletaEstrela(player, estrela) {
    estrela.disableBody(true, true);
    pontuacao += 10;
    pontuacaoText.setText('Pontuacao: ' + pontuacao);

    if (estrelas.countActive(true) === 0) {
        estrelas.children.iterate(function(child) {
            child.enableBody(true, child.x, 0, true, true);
        });

        var x = (player.x < 400) ? Phaser.Math.Between(400, 800) : Phaser.Math.Between(0, 400);

        var bomb = bombs.create(x, 16, 'bomb');
        bomb.setBounce(1);
        bomb.setCollideWorldBounds(true);
        bomb.setVelocity(Phaser.Math.Between(-200, 200), 20);
    }
    
}

// Game over
function encostaBomba(player, bomb) {
    this.physics.pause();
    player.setTint(0xff0000);
    player.anims.play('turn');
    gameOver = true;
}

// Cria texto de pontuacao
function criaObjetoPontuacao(object) {
    return object.add.text(16, 16, 'Pontuação: 0', { fontSize: '32px', fill: '#fff' });
}

function animacaoPlayerEsquerda(object) {
    return {
        key: 'left',
        frames: object.anims.generateFrameNumbers('dude', { start: 0, end: 7}),
        frameRate: 16,
        repeat: -1
    }
}

function animacaoPlayerDireita(object) {
    return {
        key: 'right',
        frames: object.anims.generateFrameNumbers('dude', { start: 0, end: 7}),
        frameRate: 16,
        repeat: -1
    }
}

function animacaoPlayerFrente() {
    return {
        key: 'turn',
        frames: [ { key: 'dude', frame: 0} ],
        frameRate: 16
    }
}

function animacaoPlayerCorrer(object) {
    console.log('animacao player')
    return {
        key: 'correr',
        frames: object.anims.generateFrameNumbers('dude', { start: 0, end: 7}),
        frameRate: 16,
        repeat: -1
    }
}