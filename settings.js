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

    return {
        load,
        save,
        toggleParsing,
        isParsing: () => load().isParsing,
    };
})();
