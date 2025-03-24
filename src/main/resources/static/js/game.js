const config = {
    type: Phaser.AUTO,
    width: window.innerWidth,
    height: window.innerHeight,
    parent: 'game-container',
    backgroundColor: '#000000',
    physics: {
        default: 'arcade',
        arcade: { debug: false }
    },
    scene: { preload, create, update, key: 'gameScene' }
};

const game = new Phaser.Game(config);
let nlos, planets;
let lives = 3;
let livesText, gameOverText, levelCompleteText;
let music;

function preload() {
    this.load.image('background', '/images/space.jpg');
    this.load.image('nloA', '/images/nloA.png');
    this.load.image('nloB', '/images/nloB.png');
    this.load.image('nloC', '/images/nloC.png');
    this.load.image('nloD', '/images/nloD.png');
    this.load.image('planetA', '/images/planetA.png');
    this.load.image('planetB', '/images/planetB.png');
    this.load.image('planetC', '/images/planetC.png');
    this.load.image('planetD', '/images/planetD.png');
    this.load.audio('gameMusic', '/audio/gameMusic.mp3');
}

function create() {
    music= this.sound.add("gameMusic");
    music.setLoop(true);
    music.play();

    let background = this.add.image(0, 0, 'background').setOrigin(0, 0);
    let scale = Math.max(game.config.width / background.width, game.config.height / background.height);
    background.setScale(scale).setPosition(game.config.width / 2 - background.width * scale / 2, game.config.height / 2 - background.height * scale / 2);

    // Генерация букв и соответствующих объектов
    let letters = ['A', 'B', 'C', 'D'];
    Phaser.Utils.Array.Shuffle(letters);

    // Создание НЛО
    nlos = this.physics.add.group();
    let nloKeys = ['nloA', 'nloB', 'nloC', 'nloD'];
    let startX = game.config.width * 0.2, gap = game.config.width * 0.2;

    for (let i = 0; i < letters.length; i++) {
        let nlo = nlos.create(startX + i * gap, game.config.height * 0.2, `nlo${letters[i]}`).setInteractive();
        nlo.setScale(0.2);
        nlo.startX = nlo.x;
        nlo.startY = nlo.y;
        nlo.letter = letters[i]; // Теперь буква строго соответствует изображению
        nlo.letterText = this.add.text(nlo.x, nlo.y, letters[i], { fontSize: '64px', fontWeight: 'bold', fill: '#00FF00' }).setOrigin(0.5);

        nlo.on('drag', () => nlo.letterText.setPosition(nlo.x, nlo.y));
    }

    // Создание планет
    Phaser.Utils.Array.Shuffle(letters);
    planets = this.physics.add.staticGroup();
    let startXPlanets = game.config.width * 0.2, gapPlanets = game.config.width * 0.2;

    for (let i = 0; i < letters.length; i++) {
        let planet = planets.create(startXPlanets + i * gapPlanets, game.config.height * 0.7, `planet${letters[i]}`)
    .setScale(0.3).refreshBody();
        planet.letter = letters[i]; // Теперь буква строго соответствует изображению
        planet.letterText = this.add.text(planet.x, planet.y, letters[i].toLowerCase(), { fontSize: '64px', fontWeight: 'bold', fill: '#c54b65' }).setOrigin(0.5);
    }

    // Жизни
    livesText = this.add.text(16, 16, 'Жизни: ' + lives, { fontSize: '32px', fill: '#fff' });

    // Финальные надписи
    gameOverText = this.add.text(game.config.width / 2, game.config.height / 2, '', { fontSize: '48px', fill: '#fff' }).setOrigin(0.5);
    levelCompleteText = this.add.text(game.config.width / 2, game.config.height / 2 + 100, '', { fontSize: '48px', fill: '#fff' }).setOrigin(0.5);

    // Перетаскивание НЛО
    this.input.setDraggable(nlos.getChildren());
    this.input.on('drag', (pointer, nlo, dragX, dragY) => {
        nlo.x = dragX;
        nlo.y = dragY;
    });

    this.input.on('dragend', (pointer, nlo) => {
        let planetHit = null;
        planets.getChildren().forEach(planet => {
            if (Phaser.Geom.Intersects.RectangleToRectangle(nlo.getBounds(), planet.getBounds())) {
                planetHit = planet;
            }
        });

        if (planetHit) {
            hitPlanet(nlo, planetHit);
        } else {
            returnToStart(nlo);
        }
    });
}

function hitPlanet(nlo, planet) {
    const nloLetter = nlo.letter.toLowerCase();
    const planetLetter = planet.letter.toLowerCase();
    if (nloLetter === planetLetter) {
        nlo.setPosition(planet.x, planet.y);
        nlo.letterText.setPosition(planet.x, planet.y);
        nlo.setInteractive(false);
        nlo.correctlyPlaced = true;
        planet.letterText.setText('');
        nlo.setDepth(planet.depth + 1);
        checkWinCondition();
    } else {
        returnToStart(nlo);
        lives--;
        livesText.setText('Жизни: ' + lives);
        if (lives <= 0) {
            gameOverText.setText('Игра окончена!');
            showGameOverModal();
        }
    }
}

function returnToStart(nlo) {
    nlo.setPosition(nlo.startX, nlo.startY);
    nlo.letterText.setPosition(nlo.startX, nlo.startY);
}

function checkWinCondition() {
    let allCorrect = true;
    nlos.getChildren().forEach(nlo => {
        if (!nlo.correctlyPlaced) {
            allCorrect = false;
        }
    });

    if (allCorrect) {
        const winModal = document.getElementById('win-modal');
        winModal.classList.add('show');
        game.scene.pause();
    }
}

function update() {
    if (lives <= 0) {
        gameOverText.setText('Игра окончена!');
        nlos.getChildren().forEach(nlo => nlo.setTint(0xff0000));
        showGameOverModal();
    }
}

function showGameOverModal() {
    const gameOverModal = document.getElementById('game-over-modal');
    gameOverModal.classList.add('show');
    game.scene.pause();
}

function restartGame() {
    document.getElementById('game-over-modal').classList.remove('show');
    document.getElementById('win-modal').classList.remove('show');
    lives = 3;
    livesText.setText('Жизни: ' + lives);
    levelCompleteText.setText('');
    game.scene.start("gameScene");
}

function goToMenu() {
    window.location.href = "/";
}