
//Variaveis globais
var game;
var platforms;
var player;
var cursors;
var pontuacao = 0;
var pontuacaoText;

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
            arcade: {
                gravity: {y: 300},
                debug: false
            }
        },
        scene: {
            preload: preload, // carrega assets
            create: create, // exibe assets
            update: update // atualiza assets
        }
    }
}

// Carrega os assets e spritesheets
function preload() {
    this.load.image('sky','assets/sky.png');
    this.load.image('sky', 'assets/sky.png');
    this.load.image('ground', 'assets/platform.png');
    this.load.image('star', 'assets/star.png');
    this.load.image('bomb', 'assets/bomb.png');
    this.load.spritesheet('dude', 'assets/dude.png', {frameWidth: 32, frameHeight: 48});
}

// Desenha/exibe a imagem que foi carregada no preload e cria outros 'Game Objects'
function create() {
    //Cria o ceu
    this.add.image(400, 300, 'sky');

    //Cria o chao e as plataformas
    platforms = this.physics.add.staticGroup();
    platforms.create(400, 568, 'ground').setScale(2).refreshBody();
    platforms.create(600, 400, 'ground');
    platforms.create(50, 250, 'ground');
    platforms.create(750, 220, 'ground');

    //Cria as estrelas
    estrelas = this.physics.add.group({
        key: 'star',
        repeat: 11,
        setXY: { x: 12, y: 0, stepX: 70 }
    });
    estrelas.children.iterate(function (child) {
        child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
    });

    //Cria o jogador
    player = this.physics.add.sprite(100, 450, 'dude');
    player.setBounce(0.1);
    player.setCollideWorldBounds(true);

    //Configura a movimentacao do player
    this.anims.create(animacaoPlayerEsquerda(this));
    this.anims.create(animacaoPlayerDireita(this));
    this.anims.create(animacaoPlayerFrente(this));

    //Cria grupo de bombas(inimigo) 
    bombs = this.physics.add.group();

    // Instancia a variavel que ira controlar a movimentacao do player
    cursors = this.input.keyboard.createCursorKeys();
    
    // Adiciona colisoes
    this.physics.add.collider(player, platforms); // Colisao Player X Plataformas
    this.physics.add.collider(estrelas, platforms); // Colisao Estrela X Plataformas
    this.physics.add.overlap(player, estrelas, coletaEstrela, null, this);  // Colisao Player X Estrela
    this.physics.add.collider(bombs, platforms); // Colisao Bombas X Plataformas
    this.physics.add.collider(player, bombs, encostaBomba, null, this); // Colisao Player X Bombas

    // Cria objeto de pontuacao
    pontuacaoText = criaObjetoPontuacao(this);
}

// Atualiza os desenhos e objetos criados
function update() {
    if (cursors.left.isDown) {
        player.setVelocityX(-160); // Seta velocidade para esquerda (valor horizontal negativo)
        player.anims.play('left', true);
    } else if (cursors.right.isDown) {
        player.setVelocityX(160); // Seta velocidade para direita (valor horizontal positivo)
        player.anims.play('right', true);
    } else {
        player.setVelocityX(0); // Seta
        player.anims.play('turn');
    }

    if (cursors.up.isDown && player.body.touching.down) {
        player.setVelocityY(-330); // Seta velocidade de pulo
    }
}

function animacaoPlayerEsquerda(object) {
    return {
        key: 'left',
        frames: object.anims.generateFrameNumbers('dude', { start: 0, end: 3 }),
        frameRate: 10,
        repeat: -1
    }
}

function animacaoPlayerDireita(object) {
    return {
        key: 'right',
        frames: object.anims.generateFrameNumbers('dude', { start: 5, end: 8 }),
        frameRate: 10,
        repeat: -1
    }
}

function animacaoPlayerFrente() {
    return {
        key: 'turn',
        frames: [ { key: 'dude', frame: 4 } ],
        frameRate: 20
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

function encostaBomba(player, bomb) {
    this.physics.pause();
    player.setTint(0xff0000);
    player.anims.play('turn');
    gameOver = true;
}

function criaObjetoPontuacao(object) {
    return object.add.text(16, 16, 'score: 0', { fontSize: '32px', fill: '#000' });
}