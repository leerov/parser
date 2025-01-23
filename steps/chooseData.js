function highlightElements(xpath) {
    try {
        // Удаляем предыдущие выделения
        document.querySelectorAll('*').forEach(element => {
            // Проверяем, имеет ли элемент класс exclude-from-selection
            if (!element.classList.contains('exclude-from-selection')) {
                element.style.outline = '';
                element.style.backgroundColor = "";
            }
        });


        // Выполняем XPath-запрос
        const result = document.evaluate(xpath, document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);

        // Выделяем элементы по XPath
        for (let i = 0; i < result.snapshotLength; i++) {
            const element = result.snapshotItem(i);
            element.style.outline = '2px solid red'; // Увеличиваем толщину рамки для лучшей видимости
        }
    } catch (error) {
        console.error(`Error highlighting elements for XPath "${xpath}":`, error);
    }
}

const getCommonPath = (path1, path2) => {
    try {
        const paths = [path1, path2].map(result => result.split('/').slice(1));
        const commonPath = paths.reduce((acc, path) => {
            let i = 0;
            while (acc[i] === path[i] && i < acc.length) {
                i++;
            }
            return acc.slice(0, i);
        });
        return '/' + commonPath.join('/');
    } catch (error) {
        console.error('Error getting common path:', error);
        return ''; // Возвращаем пустую строку в случае ошибки
    }
};

const showAlert = (message) => {
    const modal = document.createElement('div');
    Object.assign(modal.style, {
        position: 'fixed',
        top: '0',
        left: '0',
        width: '100vw',
        height: '100vh',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: '10000'
    });

    const modalContent = document.createElement('div');
    Object.assign(modalContent.style, {
        backgroundColor: '#fff',
        padding: '20px',
        borderRadius: '10px',
        textAlign: 'center',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)'
    });

    const messageElement = document.createElement('p');
    messageElement.textContent = message;

    const closeButton = document.createElement('button');
    closeButton.textContent = 'Закрыть';
    Object.assign(closeButton.style, {
        margin: '10px',
        padding: '10px 20px',
        backgroundColor: 'blue',
        color: '#fff',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer'
    });

    closeButton.addEventListener('click', () => {
        modal.remove();
    });

    modalContent.append(messageElement, closeButton);
    modal.appendChild(modalContent);
    document.body.appendChild(modal);
};

let container; // Переменная для хранения контейнера

window.chooseData = () => {
    return new Promise((resolve) => {
        try {
            // Проверяем, существует ли контейнер
            if (container) {
                console.warn('Контейнер уже существует. Невозможно создать новый.');
                return; // Выходим из функции, если контейнер уже существует
            }

            const domain = window.location.hostname;
            const config = GM_getValue(`${domain}_config`, {
                domain,
                currentStep: 0,
                steps: []
            });

            if (config.steps && Array.isArray(config.steps)) {
                const firstResult = config.steps[0]?.result;
                const secondResult = config.steps[1]?.result;
                const commonPath = getCommonPath(firstResult, secondResult);

                // Создаем общий контейнер для результатов и поля ввода
                container = document.createElement('div'); // Присваиваем контейнер переменной
                Object.assign(container.style, {
                    position: 'fixed',
                    top: '40%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    zIndex: '10000',
                    textAlign: 'center',
                    backgroundColor: 'rgba(50, 50, 50, 0.8)', // Темный прозрачный серый фон
                    padding: '20px', // Отступы
                    borderRadius: '10px', // Закругленные края
                });

                // Создаем элементы для первого и второго результата
                const firstResultElement = document.createElement('p');
                firstResultElement.textContent = `Первый результат: ${firstResult || 'Нет данных'}`;
                firstResultElement.style.color = 'white'; // Белый текст

                const secondResultElement = document.createElement('p');
                secondResultElement.textContent = `Второй результат: ${secondResult || 'Нет данных'}`;
                secondResultElement.style.color = 'white'; // Белый текст

                // Добавляем результаты в контейнер
                container.appendChild(firstResultElement);
                container.appendChild(secondResultElement);

                // Создаем поле ввода
                const pathEditor = document.createElement('input');
                pathEditor.type = 'text';
                pathEditor.value = commonPath;
                pathEditor.id = 'pathEditor'; // Добавляем уникальный id
                pathEditor.name = 'pathEditor'; // Добавляем уникальный name

                // Стилизация поля ввода
                Object.assign(pathEditor.style, {
                    width: '80%',
                    margin: '10px',
                    background: 'black', // Черный фон
                    color: 'white', // Белый текст
                    border: 'none', // Убираем рамку
                    padding: '10px', // Добавляем отступы
                    borderRadius: '10px', // Закругленные края
                    zIndex: '10000'
                });

                // Установка курсора в конец строки
                pathEditor.focus();
                pathEditor.setSelectionRange(pathEditor.value.length, pathEditor.value.length);

                // Добавляем обработчик изменения пути
                pathEditor.addEventListener('input', () => {
                    const newPath = pathEditor.value;
                    highlightElements(newPath);
                });

                // Добавляем обработчик нажатия клавиши
                pathEditor.addEventListener('keydown', (event) => {
                    if (event.key === 'Enter') {
                        const inputValue = pathEditor.value;
                        console.log('Содержимое input:', inputValue); // Возвращаем содержимое input
                        // Удаляем все дочерние элементы контейнера
                        while (container.firstChild) {
                            container.removeChild(container.firstChild);
                        }
                    }
                });

                // Выделяем элементы по пути
                highlightElements(commonPath);

                // Добавляем поле ввода в контейнер
                container.appendChild(pathEditor);
                document.body.appendChild(container);
                addExcludeClassRecursively(container);
            }
        } catch (error) {
            console.error('Error in chooseData function:', error);
        }
    });
};
