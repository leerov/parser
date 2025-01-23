function highlightElements(xpath) {
    try {
        // Удаляем предыдущие выделения
        document.querySelectorAll('*').forEach(element => {
            element.style.outline = '';
        });

        // Выполняем XPath-запрос
        const result = document.evaluate(xpath, document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
        
        // Проверяем, есть ли результаты
        if (result.snapshotLength === 0) {
            console.warn(`No elements found for XPath: ${xpath}`);
            showAlert(`Элементы не найдены для XPath: ${xpath}`);
            return;
        }

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

window.chooseData = () => {
    return new Promise((resolve) => {
        try {
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

                // Открываем редактор пути
                const pathEditor = document.createElement('input');
                pathEditor.type = 'text';
                pathEditor.value = commonPath;
                pathEditor.style.width = '300px';
                pathEditor.style.margin = '10px';
                pathEditor.id = 'pathEditor'; // Добавляем уникальный id
                pathEditor.name = 'pathEditor'; // Добавляем уникальный name
                document.body.appendChild(pathEditor);

                // Добавляем обработчик изменения пути
                pathEditor.addEventListener('input', () => {
                    const newPath = pathEditor.value;
                    highlightElements(newPath);
                });

                // Выделяем элементы по пути
                highlightElements(commonPath);
            }
        } catch (error) {
            console.error('Error in chooseData function:', error);
        }
    });
};
