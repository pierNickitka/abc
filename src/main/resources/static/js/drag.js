interact('.letter')
    .draggable({
        // Настройки перетаскивания
        inertia: true,
        modifiers: [
            interact.modifiers.restrict({
                restriction: 'parent', // Ограничиваем область внутри родительского контейнера
                endOnly: true
            })
        ],
        onstart(event) {
            console.log("Начало перетаскивания");
        },
        onmove(event) {
            // Перемещение элемента с помощью мыши
            event.target.style.transform =
                'translate(' + event.pageX + 'px, ' + event.pageY + 'px)';
        },
        onend(event) {
            console.log("Перетаскивание завершено");
        }
    });