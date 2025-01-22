const UI = (function () {
    function showSettings() {
        const config = Settings.load();
        const settingsHTML = `
            <div id="scraper-settings">
                <h2>Настройки</h2>
                <h3>JSON-конфигурация</h3>
                <textarea id="json-config" style="width: 100%; height: 300px; font-family: monospace;"></textarea><br>
                <button id="save-settings">Сохранить</button>
                <button id="close-settings">Закрыть</button>
            </div>
        `;

        const settingsDiv = document.createElement("div");
        settingsDiv.innerHTML = settingsHTML;
        document.body.appendChild(settingsDiv);

        GM_addStyle(`
            #scraper-settings {
                position: fixed;
                top: 20px;
                right: 20px;
                background: white;
                border: 1px solid black;
                padding: 10px;
                z-index: 10000;
            }
        `);

        const textarea = document.getElementById("json-config");
        textarea.value = JSON.stringify(config, null, 4);

        document.getElementById("save-settings").addEventListener("click", () => {
            try {
                const newConfig = JSON.parse(textarea.value);
                Settings.save(newConfig);
                alert("Настройки сохранены!");
                settingsDiv.remove();
            } catch (e) {
                alert("Ошибка: " + e.message);
            }
        });

        document.getElementById("close-settings").addEventListener("click", () => {
            settingsDiv.remove();
        });
    }

    return { showSettings };
})();
