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
        }

        // Выделяем элементы по XPath
        for (let i = 0; i < result.snapshotLength; i++) {
            const element = result.snapshotItem(i);
            element.style.outline = '1px solid red';
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
