const Parser = (function () {
    function extractData(element, fields) {
        const item = {};
        fields.forEach(field => {
            const value = field.attribute
                ? element.querySelector(field.selector)?.getAttribute(field.attribute)
                : element.querySelector(field.selector)?.innerText.trim();

            if (value) {
                item[field.name] = value;
            }
        });
        return item;
    }

    function start() {
        const config = Settings.load();
        const data = [];

        
        document.querySelectorAll(config.fields[0].selector).forEach(element => {
            const item = extractData(element, config.fields);
            if (Object.keys(item).length) {
                data.push(item);
            }
        });

        
        if (data.length === 0) {
            console.error('Нет данных для отправки.');
            Settings.save({ ...config, isParsing: false });
            return;
        }

        
        GM_xmlhttpRequest({
            method: 'POST',
            url: config.apiUrl,
            data: JSON.stringify({ domain: window.location.hostname, data }),
            headers: { 'Content-Type': 'application/json' },
            onload: function (response) {
                console.log('Ответ сервера:', response.responseText);
                const nextButton = document.querySelector(config.nextPageSelector);
                if (nextButton) {
                    nextButton.click();
                } else {
                    console.log('Кнопка следующей страницы не найдена.');
                }
            },
            onerror: function (err) {
                console.error('Ошибка запроса:', err);
            },
            onfinish: function () {
                const newConfig = { ...config, isParsing: false };
                
                if (JSON.stringify(newConfig) !== JSON.stringify(config)) {
                    Settings.save(newConfig);
                }
            },
        });
    }

    return { start };
})();
