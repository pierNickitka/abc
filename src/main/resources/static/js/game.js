const config = {
    type: Phaser.AUTO,
    width: window.innerWidth,
    height: window.innerHeight,
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
    this.load.image('nloA', '/images/planet.png');
    this.load.image('nloB', '/images/planet.png');
    this.load.image('nloC', '/images/planet.png');
    this.load.image('nloD', '/images/planet.png');
    this.load.image('planetA', '/images/planet.png');
    this.load.image('planetB', '/images/planet.png');
    this.load.image('planetC', '/images/planet.png');
    this.load.image('planetD', '/images/planet.png');
}

function create() {
    // Создаем группу НЛО
    nlos = this.physics.add.group();
    const nloKeys = ['nloA', 'nloB', 'nloC', 'nloD'];
    for (let i = 0; i < nloKeys.length; i++) {
        let nlo = nlos.create(150 + i * 200, 100, nloKeys[i]).setInteractive();
        nlo.setScale(0.2);  // Уменьшаем размер НЛО
    }

    // Создаем планеты
    planets = this.physics.add.staticGroup();
    planets.create(300, 500, 'planetA').setScale(0.3).refreshBody();
    planets.create(500, 500, 'planetB').setScale(0.3).refreshBody();
    planets.create(700, 500, 'planetC').setScale(0.3).refreshBody();
    planets.create(900, 500, 'planetD').setScale(0.3).refreshBody();

    // Добавляем коллизии
    this.physics.add.overlap(nlos, planets, hitPlanet, null, this);

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
        // Проверяем столкновение с планетами после завершения перемещения
        this.physics.world.collide(nlo, planets);
    });
}

function update() {
    if (lives <= 0) {
        gameOverText.setText('Игра окончена!');
        nlos.getChildren().forEach(nlo => nlo.setTint(0xff0000));  // Красный оттенок при поражении
    }
}

function hitPlanet(nlo, planet) {
    const nloLetter = nlo.texture.key.charAt(3).toLowerCase();
    const planetLetter = planet.texture.key.charAt(6).toLowerCase();

    if (nloLetter === planetLetter) {
        nlo.disableBody(true, true);  // Убираем НЛО
        checkWinCondition();
    } else {
        nlo.setPosition(150 + (nlos.getChildren().indexOf(nlo) * 200), 100);
        lives--;
        livesText.setText('Жизни: ' + lives);
    }
}

function checkWinCondition() {
    if (nlos.countActive() === 0) {
        levelCompleteText.setText('Поздравляем, вы выиграли!');
    }
}
