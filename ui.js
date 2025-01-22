const UI = (function () {
    function showSettings() {
        const config = Settings.load();
        const settingsHTML = `
            <div id="scraper-settings">
                <div id="scraper-settings-header">
                    <h2>Настройки</h2>
                </div>
                <div id="scraper-settings-body">
                    <h3>JSON-конфигурация</h3>
                    <textarea id="json-config"></textarea>
                </div>
                <div id="scraper-settings-footer">
                    <button id="save-settings">Сохранить</button>
                    <button id="close-settings">Закрыть</button>
                </div>
            </div>
        `;

        const settingsDiv = document.createElement('div');
        settingsDiv.innerHTML = settingsHTML;
        document.body.appendChild(settingsDiv);

        GM_addStyle(`
            #scraper-settings {
                position: fixed;
                top: 20px;
                right: 20px;
                width: 400px;
                height: 500px;
                background: #f9f9f9;
                border: 1px solid #ccc;
                border-radius: 8px;
                display: flex;
                flex-direction: column;
                resize: both;
                overflow: hidden;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                font-family: Arial, sans-serif;
            }

            #scraper-settings-header {
                padding: 10px;
                background: #007bff;
                color: white;
                border-bottom: 1px solid #ccc;
                text-align: center;
                font-size: 18px;
            }

            #scraper-settings-body {
                flex-grow: 1;
                padding: 10px;
                overflow-y: auto;
            }

            #json-config {
                width: 100%;
                height: 100%;
                font-family: monospace;
                resize: none;
                box-sizing: border-box;
            }

            #scraper-settings-footer {
                padding: 10px;
                background: #f1f1f1;
                border-top: 1px solid #ccc;
                text-align: right;
            }

            #scraper-settings-footer button {
                margin-left: 10px;
                padding: 6px 12px;
                border: 1px solid #ccc;
                border-radius: 4px;
                background: #007bff;
                color: white;
                cursor: pointer;
            }

            #scraper-settings-footer button:hover {
                background: #0056b3;
            }
        `);

        const textarea = document.getElementById('json-config');
        textarea.value = JSON.stringify(config, null, 4);

        document
            .getElementById('save-settings')
            .addEventListener('click', () => {
                try {
                    const newConfig = JSON.parse(textarea.value);
                    Settings.save(newConfig);
                    alert('Настройки сохранены!');
                    settingsDiv.remove();
                } catch (e) {
                    alert('Ошибка: ' + e.message);
                }
            });

        document
            .getElementById('close-settings')
            .addEventListener('click', () => {
                settingsDiv.remove();
            });
    }

    return { showSettings };
})();
