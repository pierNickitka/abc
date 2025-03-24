const config = {
    type: Phaser.AUTO,
    width: window.innerWidth,
    height: window.innerHeight,
    parent: 'game-container',
    backgroundColor: '#000000',
    physics: {
        default: 'arcade',
        arcade: {
            debug: false
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

const game = new Phaser.Game(config);

let nlos;
let planets;
let lives = 3;
let livesText;
let gameOverText;
let levelCompleteText;

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
}

function create() {
    let background = this.add.image(0, 0, 'background').setOrigin(0, 0);
    let scaleX = game.config.width / background.width;
    let scaleY = game.config.height / background.height;
    let scale = Math.max(scaleX, scaleY);
    background.setScale(scale);
    background.setPosition(game.config.width / 2 - background.width * scale / 2, game.config.height / 2 - background.height * scale / 2);

    nlos = this.physics.add.group();
    const nloKeys = ['nloA', 'nloB', 'nloC', 'nloD'];
    let startX = game.config.width * 0.2;
    let gap = game.config.width * 0.2;

    for (let i = 0; i < nloKeys.length; i++) {
        let nlo = nlos.create(startX + i * gap, game.config.height * 0.2, nloKeys[i]).setInteractive();
        nlo.setScale(0.2);
        nlo.startX = nlo.x;
        nlo.startY = nlo.y;
        const letter = nlo.texture.key.replace('nlo', '').toUpperCase();
        nlo.letterText = this.add.text(nlo.x, nlo.y, letter, {
            fontSize: '64px',
            fontWeight: 'bold',
            fill: '#00FF00'
        }).setOrigin(0.5);
        nlo.on('drag', () => {
            nlo.letterText.setPosition(nlo.x, nlo.y);
        });
    }

    planets = this.physics.add.staticGroup();
    const planetKeys = ['planetA', 'planetB', 'planetC', 'planetD'];
    let startXPlanets = game.config.width * 0.2;
    let gapPlanets = game.config.width * 0.2;

    for (let i = 0; i < planetKeys.length; i++) {
        let planet = planets.create(startXPlanets + i * gapPlanets, game.config.height * 0.7, planetKeys[i])
            .setScale(0.3)
            .refreshBody();
        const letter = planet.texture.key.replace('planet', '').toUpperCase();
        planet.letterText = this.add.text(planet.x, planet.y, letter, {
            fontSize: '64px',
            fontWeight: 'bold',
            fill: '#c54b65'
        }).setOrigin(0.5);
    }

    livesText = this.add.text(16, 16, 'Жизни: ' + lives, { fontSize: '32px', fill: '#fff' });
    gameOverText = this.add.text(game.config.width / 2, game.config.height / 2, '', { fontSize: '48px', fill: '#fff' }).setOrigin(0.5);
    levelCompleteText = this.add.text(game.config.width / 2, game.config.height / 2 + 100, '', { fontSize: '48px', fill: '#fff' }).setOrigin(0.5);

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
            nlo.setPosition(nlo.startX, nlo.startY);
            nlo.letterText.setPosition(nlo.startX, nlo.startY);
        }
    });
}

function hitPlanet(nlo, planet) {
    const nloLetter = nlo.texture.key.replace('nlo', '').toLowerCase();
    const planetLetter = planet.texture.key.replace('planet', '').toLowerCase();

    if (nloLetter === planetLetter) {
        nlo.setPosition(planet.x, planet.y);
        nlo.letterText.setPosition(planet.x, planet.y);
        nlo.setInteractive();
        nlo.correctlyPlaced = true;
        planet.letterText.setText('');
        nlo.setDepth(planet.depth + 1);
        checkWinCondition();
    } else {
        nlo.setPosition(nlo.startX, nlo.startY);
        nlo.letterText.setPosition(nlo.startX, nlo.startY);
        lives--;
        livesText.setText('Жизни: ' + lives);
        if (lives <= 0) {
            gameOverText.setText('Игра окончена!');
        }
    }
}

function checkWinCondition() {
    let allCorrect = true;
    nlos.getChildren().forEach(nlo => {
        if (!nlo.correctlyPlaced) {
            allCorrect = false;
        }
    });
    if (allCorrect) {
        levelCompleteText.setText('Поздравляем, вы выиграли!');
    }
}

function showGameOverPopup() {
    const popupWidth = 400;
    const popupHeight = 250;
    const centerX = game.config.width / 2;
    const centerY = game.config.height / 2;

    let bg = this.add.rectangle(centerX, centerY, popupWidth, popupHeight, 0x444444)
        .setOrigin(0.5);

    let message = this.add.text(centerX, centerY - 50, 'К сожалению, вы проиграли!', {
        fontSize: '24px',
        fill: '#ffffff',
        align: 'center'
    }).setOrigin(0.5);

    let retryButton = this.add.text(centerX, centerY + 20, 'Попробовать еще раз', {
        fontSize: '20px',
        fill: '#ffffff',
        backgroundColor: '#ff0000',
        padding: { x: 20, y: 10 }
    }).setOrigin(0.5).setInteractive();

    retryButton.on('pointerdown', () => {
        location.reload();
    });

    let menuButton = this.add.text(centerX, centerY + 80, 'Вернуться в меню', {
        fontSize: '20px',
        fill: '#ffffff',
        backgroundColor: '#007bff',
        padding: { x: 20, y: 10 }
    }).setOrigin(0.5).setInteractive();

    menuButton.on('pointerdown', () => {
        window.location.href = '/';
    });

    this.add.existing(bg);
    this.add.existing(message);
    this.add.existing(retryButton);
    this.add.existing(menuButton);

    bg.setDepth(200);
    message.setDepth(201);
    retryButton.setDepth(202);
    menuButton.setDepth(203);
}

function update() {
    if (lives <= 0) {
        gameOverText.setText('Игра окончена!');
        nlos.getChildren().forEach(nlo => {
            nlo.setTint(0xff0000);
        });
        this.input.setDraggable(nlos.getChildren(), true);
        showGameOverPopup();
    }
}