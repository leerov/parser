const getCommonPath = (path1, path2) => {
    const paths = [path1, path2].map(result => result.split('/').slice(1));
    const commonPath = paths.reduce((acc, path) => {
        let i = 0;
        while (acc[i] === path[i] && i < acc.length) {
            i++;
        }
        return acc.slice(0, i);
    });
    return '/' + commonPath.join('/');
};

window.chooseData = () => {
    return new Promise((resolve) => {
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

            // Функция для выделения элементов по пути
            function highlightElements(path) {
                // Удаляем предыдущие выделения
                document.querySelectorAll('*').forEach(element => {
                    element.style.outline = '';
                });

                // Выделяем элементы по пути
                const elements = document.querySelectorAll(path);
                elements.forEach(element => {
                    element.style.outline = '1px solid red';
                });
            }
        }
    });
};
