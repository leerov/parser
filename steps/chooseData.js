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
        return '';
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
    
    modalContent.append(messageElement, closeButton);
    modal.appendChild(modalContent);
    document.body.appendChild(modal);
};

let container;

window.chooseData = () => {
    return new Promise((resolve) => {
        try {
            if (container) {
                console.warn('Контейнер уже существует. Невозможно создать новый.');
                return;
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

                container = document.createElement('div');
                Object.assign(container.style, {
                    position: 'fixed',
                    top: '40%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    zIndex: '10000',
                    textAlign: 'center',
                    backgroundColor: 'rgba(50, 50, 50, 0.8)',
                    padding: '20px',
                    borderRadius: '10px',
                });

                const firstResultElement = document.createElement('p');
                firstResultElement.textContent = `Первый результат: ${firstResult || 'Нет данных'}`;
                firstResultElement.style.color = 'white';

                const secondResultElement = document.createElement('p');
                secondResultElement.textContent = `Второй результат: ${secondResult || 'Нет данных'}`;
                secondResultElement.style.color = 'white';

                container.appendChild(firstResultElement);
                container.appendChild(secondResultElement);

                const pathEditor = document.createElement('input');
                pathEditor.type = 'text';
                pathEditor.value = commonPath;
                pathEditor.id = 'pathEditor';
                pathEditor.name = 'pathEditor';

                Object.assign(pathEditor.style, {
                    width: '80%',
                    margin: '10px',
                    background: 'black',
                    color: 'white',
                    border: 'none',
                    padding: '10px',
                    borderRadius: '10px',
                    zIndex: '10000'
                });

                pathEditor.focus();
                pathEditor.setSelectionRange(pathEditor.value.length, pathEditor.value.length);

                pathEditor.addEventListener('input', () => {
                    const newPath = pathEditor.value;
                    highlightElements(newPath);
                });

                pathEditor.addEventListener('keydown', (event) => {
                    if (event.key === 'Enter') {
                        const inputValue = pathEditor.value;
                        console.log('Содержимое input:', inputValue);
                        while (container.firstChild) {
                            container.removeChild(container.firstChild);
                        }
                        container.remove(); // Удаляем контейнер
                    }
                });
                
                highlightElements(commonPath);

                container.appendChild(pathEditor);
                document.body.appendChild(container);
                addExcludeClassRecursively(container);
            }
        } catch (error) {
            console.error('Error in chooseData function:', error);
        }
    });
};
