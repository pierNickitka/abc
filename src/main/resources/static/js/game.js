const config = {
    type: Phaser.AUTO,
    width: window.innerWidth,
    height: window.innerHeight,
    parent: 'game-container', // Привязываем к контейнеру
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
    this.load.image('nloA', '/images/nloA.png'); // Уникальные файлы
    this.load.image('nloB', '/images/nloB.png');
    this.load.image('nloC', '/images/nloC.png');
    this.load.image('nloD', '/images/nloD.png');

    this.load.image('planetA', '/images/planetA.png');
    this.load.image('planetB', '/images/planetB.png');
    this.load.image('planetC', '/images/planetC.png');
    this.load.image('planetD', '/images/planetD.png');
}

function create() {
    // Создаем группу НЛО с равномерным распределением
    nlos = this.physics.add.group();
    const nloKeys = ['nloA', 'nloB', 'nloC', 'nloD'];

    let startX = game.config.width * 0.2; // Начальная позиция НЛО
    let gap = game.config.width * 0.2; // Расстояние между НЛО

    for (let i = 0; i < nloKeys.length; i++) {
        let nlo = nlos.create(startX + i * gap, game.config.height * 0.2, nloKeys[i]).setInteractive();
        nlo.setScale(0.2);
    }

    // Создаем планеты с равномерным распределением
    planets = this.physics.add.staticGroup();
    const planetKeys = ['planetA', 'planetB', 'planetC', 'planetD'];

    let startXPlanets = game.config.width * 0.2; // Начальная позиция планет
    let gapPlanets = game.config.width * 0.2; // Расстояние между планетами

    for (let i = 0; i < planetKeys.length; i++) {
        planets.create(startXPlanets + i * gapPlanets, game.config.height * 0.7, planetKeys[i])
            .setScale(0.3)
            .refreshBody();
    }

    // Текст с жизнями
    livesText = this.add.text(16, 16, 'Жизни: ' + lives, { fontSize: '32px', fill: '#fff' });

    // Текст о конце игры
    gameOverText = this.add.text(game.config.width / 2, game.config.height / 2, '', {
        fontSize: '48px', fill: '#fff'
    }).setOrigin(0.5);

    // Текст о победе
    levelCompleteText = this.add.text(game.config.width / 2, game.config.height / 2 + 100, '', {
        fontSize: '48px', fill: '#fff'
    }).setOrigin(0.5);

    // Взаимодействие с НЛО
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
            nlo.setPosition(startX + (nlos.getChildren().indexOf(nlo) * gap), game.config.height * 0.2);
        }
    });
}
function hitPlanet(nlo, planet) {
    console.log(nlo.texture.key, planet.texture.key); // Отладка

    const nloLetter = nlo.texture.key.replace('nlo', '').toLowerCase();
    const planetLetter = planet.texture.key.replace('planet', '').toLowerCase();

    if (nloLetter === planetLetter) {
        nlo.disableBody(true, true);
        checkWinCondition();
    } else {
        nlo.setPosition(150 + (nlos.getChildren().indexOf(nlo) * 200), 100);
        lives--;
        livesText.setText('Жизни: ' + lives);

        if (lives <= 0) {
            gameOverText.setText('Игра окончена!');
        }
    }
}

function update() {
    if (lives <= 0) {
        gameOverText.setText('Игра окончена!');
        nlos.getChildren().forEach(nlo => nlo.setTint(0xff0000));
    }
}


function checkWinCondition() {
    console.log(nlos.countActive()); // Проверяем активные НЛО
    if (nlos.countActive() === 0) {
        levelCompleteText.setText('Поздравляем, вы выиграли!');
    }
}
