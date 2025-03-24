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
    // this.load.image('background', '/images/space.jpg');

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
    // Создаем группу НЛО
    nlos = this.physics.add.group();
    const nloKeys = ['nloA', 'nloB', 'nloC', 'nloD'];

    let startX = game.config.width * 0.2;
    let gap = game.config.width * 0.2;

    for (let i = 0; i < nloKeys.length; i++) {
        let nlo = nlos.create(startX + i * gap, game.config.height * 0.2, nloKeys[i]).setInteractive();
        nlo.setScale(0.2);
        nlo.startX = nlo.x; // Сохраняем начальные координаты
        nlo.startY = nlo.y;

        // Добавляем текст с буквой на НЛО
        const letter = nlo.texture.key.replace('nlo', '').toUpperCase();
        nlo.letterText = this.add.text(nlo.x, nlo.y, letter, {
            fontSize: '64px', // Увеличиваем размер шрифта
            fontWeight: 'bold', // Жирный шрифт
            fill: '#00FF00' // Зеленый цвет
        }).setOrigin(0.5);

        // Обновляем позицию текста при перемещении НЛО
        nlo.on('drag', () => {
            nlo.letterText.setPosition(nlo.x, nlo.y);
        });
    }

    // Создаем планеты
    planets = this.physics.add.staticGroup();
    const planetKeys = ['planetA', 'planetB', 'planetC', 'planetD'];

    let startXPlanets = game.config.width * 0.2;
    let gapPlanets = game.config.width * 0.2;

    for (let i = 0; i < planetKeys.length; i++) {
        let planet = planets.create(startXPlanets + i * gapPlanets, game.config.height * 0.7, planetKeys[i])
            .setScale(0.3)
            .refreshBody();

        // Добавляем текст с буквой на планете
        const letter = planet.texture.key.replace('planet', '').toUpperCase();
        planet.letterText = this.add.text(planet.x, planet.y, letter, {
            fontSize: '64px', // Увеличиваем размер шрифта
            fontWeight: 'bold', // Жирный шрифт
            fill: '#c54b65' // Зеленый цвет
        }).setOrigin(0.5);
    }

    // Текст с жизнями
    livesText = this.add.text(16, 16, 'Жизни: ' + lives, { fontSize: '32px', fill: '#fff' });

    // Тексты о завершении
    gameOverText = this.add.text(game.config.width / 2, game.config.height / 2, '', { fontSize: '48px', fill: '#fff' }).setOrigin(0.5);
    levelCompleteText = this.add.text(game.config.width / 2, game.config.height / 2 + 100, '', { fontSize: '48px', fill: '#fff' }).setOrigin(0.5);

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
            nlo.setPosition(nlo.startX, nlo.startY); // Возвращаем на стартовую позицию
            nlo.letterText.setPosition(nlo.startX, nlo.startY); // Обновляем позицию текста
        }
    });
}

function hitPlanet(nlo, planet) {
    console.log(nlo.texture.key, planet.texture.key); // Отладка
    const nloLetter = nlo.texture.key.replace('nlo', '').toLowerCase();
    const planetLetter = planet.texture.key.replace('planet', '').toLowerCase();
    if (nloLetter === planetLetter) {
        // Перемещаем НЛО на позицию планеты
        nlo.setPosition(planet.x, planet.y);
        nlo.letterText.setPosition(planet.x, planet.y); // Обновляем позицию текста на НЛО
        // Делаем НЛО неподвижным, чтобы оно не могло быть перетащено снова
        nlo.setInteractive(false); // Блокируем возможность перетаскивания
        nlo.correctlyPlaced = true; // Устанавливаем флаг корректного размещения
        // Удаляем текст с буквой на планете, так как буква уже соответствует
        planet.letterText.setText('');
        // Убедимся, что НЛО отображается поверх планеты
        nlo.setDepth(planet.depth + 1); // Устанавливаем слой НЛО выше планеты
        checkWinCondition(); // Проверяем условие победы
    } else {
        // Возвращаем НЛО на его начальную позицию
        nlo.setPosition(nlo.startX, nlo.startY);
        nlo.letterText.setPosition(nlo.startX, nlo.startY); // Обновляем позицию текста на НЛО
        // Отнимаем жизнь
        lives--;
        livesText.setText('Жизни: ' + lives);
        if (lives <= 0) {
            gameOverText.setText('Игра окончена!');
        }
    }
}

function checkWinCondition() {
    // Проверяем, все ли НЛО на правильных планетах
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

function update() {
    if (lives <= 0) {
        gameOverText.setText('Игра окончена!');
        nlos.getChildren().forEach(nlo => nlo.setTint(0xff0000));
    }
}


