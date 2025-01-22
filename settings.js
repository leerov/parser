const Settings = (function () {
    const domain = window.location.hostname;
    const settingsKey = `scraperSettings_${domain}`;

    const defaultConfig = {
        nextPageSelector: '',
        apiUrl: 'http://localhost:3000/api/list',
        fields: [{ name: 'src', selector: 'a', attribute: 'src' }],
        isParsing: false,
    };

    function load() {
        return GM_getValue(settingsKey, null) || defaultConfig;
    }

    function save(config) {
        GM_setValue(settingsKey, config);
    }

    function toggleParsing() {
        const config = load();
        config.isParsing = !config.isParsing;
        save(config);
        alert(`Парсинг ${config.isParsing ? 'включен' : 'выключен'}.`);
    }

    function addField(selector, name, attribute) {
        const config = load();
        config.fields.push({ name, selector, attribute });
        save(config);
        alert(`Добавлено поле: { name: "${name}", selector: "${selector}", attribute: "${attribute || 'innerText'}" }`);
    }

    return {
        load,
        save,
        toggleParsing,
        addField,
        isParsing: () => load().isParsing,
    };
})();