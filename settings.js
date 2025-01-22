const Settings = (function () {
    const domain = window.location.hostname;
    const settingsKey = `scraperSettings_${domain}`;
    let cachedConfig = null;  

    const defaultConfig = {
        nextPageSelector: '',
        apiUrl: 'http://localhost:3000/api/list',
        fields: [{ name: 'src', selector: 'a', attribute: 'src' }],
        isParsing: false,
    };

    
    function load() {
        if (cachedConfig === null) {
            cachedConfig = GM_getValue(settingsKey, null) || defaultConfig;
        }
        return cachedConfig;
    }

    
    function save(config) {
        try {
            GM_setValue(settingsKey, config);
            cachedConfig = config;  
        } catch (error) {
            console.error('Ошибка при сохранении настроек:', error);
        }
    }

    
    function toggleParsing() {
        const config = load();
        config.isParsing = !config.isParsing;
        save(config);
        console.log(`Парсинг ${config.isParsing ? 'включен' : 'выключен'}.`);
    }

    
    function addField(selector, name, attribute) {
        const config = load();
        
        
        if (config.fields.some(field => field.name === name)) {
            console.log(`Поле с именем "${name}" уже существует.`);
            return;
        }

        config.fields.push({ name, selector, attribute: attribute || 'innerText' });
        save(config);
        console.log(`Добавлено поле: { name: "${name}", selector: "${selector}", attribute: "${attribute || 'innerText'}" }`);
    }

    
    function addFieldsFromDifferences(differences) {
        const config = load();
        differences.forEach((diff) => {
            const field = diff.type === 'text'
                ? { name: `Text at ${diff.path}`, selector: diff.path, attribute: 'innerText' }
                : { name: `Attribute ${diff.attribute} at ${diff.path}`, selector: diff.path, attribute: diff.attribute };

            
            if (!config.fields.some(f => f.name === field.name)) {
                config.fields.push(field);
            }
        });
        save(config);
        console.log('Выбранные различия сохранены в конфигурации!');
    }

    return {
        load,
        save,
        toggleParsing,
        addField,
        addFieldsFromDifferences,
        isParsing: () => load().isParsing,
    };
})();
