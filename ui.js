const UI = (function () {
    function enableSelectionMode() {
        alert('Выберите элементы на странице. Нажмите ESC для выхода.');

        const onClick = (event) => {
            event.preventDefault();
            event.stopPropagation();

            const selector = getUniqueSelector(event.target);
            const name = prompt('Введите имя поля (например, "price"):', '');
            if (!name) return;

            const attribute = prompt('Введите атрибут для получения значения (например, "src", оставьте пустым для innerText):', '');
            Settings.addField(selector, name, attribute);
        };

        const onKeyDown = (event) => {
            if (event.key === 'Escape') {
                document.removeEventListener('click', onClick, true);
                document.removeEventListener('keydown', onKeyDown, true);
                alert('Режим выбора элементов отключен.');
            }
        };

        document.addEventListener('click', onClick, true);
        document.addEventListener('keydown', onKeyDown, true);
    }

    function getUniqueSelector(element) {
        const path = [];
        while (element) {
            let selector = element.nodeName.toLowerCase();
            if (element.id) {
                selector += `#${element.id}`;
                path.unshift(selector);
                break;
            } else {
                let siblingIndex = 1;
                let sibling = element.previousElementSibling;
                while (sibling) {
                    if (sibling.nodeName === element.nodeName) siblingIndex++;
                    sibling = sibling.previousElementSibling;
                }
                if (siblingIndex > 1) selector += `:nth-of-type(${siblingIndex})`;
            }
            path.unshift(selector);
            element = element.parentElement;
        }
        return path.join(' > ');
    }

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
                    <button id="clear-selectors">Очистить селекторы</button>
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
            .getElementById('clear-selectors')
            .addEventListener('click', () => {
                Settings.clearSelectors();
                textarea.value = JSON.stringify(Settings.load(), null, 4);
            });

        document
            .getElementById('close-settings')
            .addEventListener('click', () => {
                settingsDiv.remove();
            });
    }

    return { showSettings, enableSelectionMode };
})();


UI.enableSelectionMode();