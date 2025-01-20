// ==UserScript==
// @name         Universal Scraper with Dynamic Settings (Manual Start)
// @namespace    http://tampermonkey.net/
// @version      0.1.4
// @description  Universal scraper with dynamic settings, field management, and manual start
// @author       Leerov
// @match        *://*/*  
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_xmlhttpRequest
// @grant        GM_registerMenuCommand
// @grant        GM_addStyle
// @homepageURL  https://github.com/leerov/parser
// @updateURL    https://raw.githubusercontent.com/leerov/parser/main/parser.user.js
// @downloadURL  https://raw.githubusercontent.com/leerov/parser/main/parser.user.js
// ==/UserScript==

(function() {
    'use strict';

    const nextPageSelectorKey = "nextPageSelector";
    const defaultNextPageSelector = ".pager .next a";
    const savedNextPageSelector = GM_getValue(nextPageSelectorKey, defaultNextPageSelector);
    const savedFields = GM_getValue("scraperFields", []);
    const apiUrl = GM_getValue("apiUrl", "http://localhost:3000/api/list");

    function runJob() {
        const data = [];

        document.querySelectorAll(savedFields.length > 0 ? savedFields[0].selector : "").forEach(element => {
            const item = {};
            savedFields.forEach(field => {
                const value = field.attribute
                    ? element.querySelector(field.selector)?.getAttribute(field.attribute)
                    : element.querySelector(field.selector)?.innerText.trim();

                if (value) item[field.name] = value;
            });

            if (Object.keys(item).length) data.push(item);
        });

        const domain = window.location.hostname;

        GM_xmlhttpRequest({
            method: "POST",
            url: apiUrl,
            data: JSON.stringify({ domain, data }),
            headers: { "Content-Type": "application/json" },
            onload: function(response) {
                try {
                    const serverResponse = JSON.parse(response.response);
                    if (serverResponse.success) {
                        console.log("Данные успешно отправлены.");
                        const nextButton = document.querySelector(savedNextPageSelector);
                        nextButton ? nextButton.click() : console.log("Кнопка следующей страницы не найдена.");
                    } else {
                        console.error("Ошибка сервера:", serverResponse.message);
                    }
                } catch (err) {
                    console.error("Ошибка обработки ответа сервера:", err);
                }
            },
            onerror: function(err) {
                console.error("Ошибка запроса:", err);
            }
        });
    }

    function showSettings() {
        const settingsHTML = `
            <div id="scraper-settings">
                <h2>Настройки</h2>
                <label>Селектор кнопки следующей страницы: <input type="text" id="nextPageSelector" value="${savedNextPageSelector}"></label><br>
                <label>API URL: <input type="text" id="apiUrl" value="${apiUrl}"></label><br>
                <h3>Поля для сбора:</h3>
                <div id="fields-list">
                    ${savedFields.map((field, index) => `
                        <div class="field-row" data-index="${index}">
                            <input type="text" class="field-name" value="${field.name}" placeholder="Название поля">
                            <input type="text" class="field-selector" value="${field.selector}" placeholder="CSS-селектор">
                            <input type="text" class="field-attribute" value="${field.attribute || ''}" placeholder="Атрибут (опционально)">
                            <button class="remove-field">Удалить</button>
                        </div>
                    `).join("")}
                </div>
                <button id="add-field">Добавить поле</button>
                <button id="save-settings">Сохранить</button>
                <button id="export-settings">Экспортировать</button>
                <button id="import-settings">Импортировать</button>
                <button id="close-settings">Закрыть</button>
                <textarea id="settings-import-export" placeholder="Экспортированные настройки"></textarea>
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
                box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
                width: 400px;
            }
            #scraper-settings input, #scraper-settings button, #settings-import-export {
                width: 100%;
                margin-bottom: 10px;
            }
            .field-row { display: flex; align-items: center; }
            .field-row input { flex: 1; margin-right: 5px; }
            .remove-field { background: red; color: white; border: none; }
        `);

        document.getElementById("add-field").addEventListener("click", () => {
            const fieldsList = document.getElementById("fields-list");
            const fieldRowHTML = `
                <div class="field-row">
                    <input type="text" class="field-name" placeholder="Название поля">
                    <input type="text" class="field-selector" placeholder="CSS-селектор">
                    <input type="text" class="field-attribute" placeholder="Атрибут (опционально)">
                    <button class="remove-field">Удалить</button>
                </div>
            `;
            fieldsList.insertAdjacentHTML("beforeend", fieldRowHTML);
            attachRemoveFieldListeners();
        });

        document.getElementById("save-settings").addEventListener("click", () => {
            const nextPageSelector = document.getElementById("nextPageSelector").value;
            const apiUrl = document.getElementById("apiUrl").value;
            const fields = Array.from(document.querySelectorAll("#fields-list .field-row")).map(row => ({
                name: row.querySelector(".field-name").value,
                selector: row.querySelector(".field-selector").value,
                attribute: row.querySelector(".field-attribute").value || null
            }));

            GM_setValue(nextPageSelectorKey, nextPageSelector);
            GM_setValue("apiUrl", apiUrl);
            GM_setValue("scraperFields", fields);

            alert("Настройки сохранены!");
        });

        document.getElementById("export-settings").addEventListener("click", () => {
            const exportData = JSON.stringify({
                nextPageSelector: GM_getValue(nextPageSelectorKey),
                apiUrl: GM_getValue("apiUrl"),
                fields: GM_getValue("scraperFields")
            });
            document.getElementById("settings-import-export").value = exportData;
        });

        document.getElementById("import-settings").addEventListener("click", () => {
            const importData = JSON.parse(document.getElementById("settings-import-export").value);
            GM_setValue(nextPageSelectorKey, importData.nextPageSelector);
            GM_setValue("apiUrl", importData.apiUrl);
            GM_setValue("scraperFields", importData.fields);
            alert("Настройки импортированы! Перезагрузите страницу.");
        });

        document.getElementById("close-settings").addEventListener("click", () => {
            settingsDiv.remove();
        });

        function attachRemoveFieldListeners() {
            document.querySelectorAll(".remove-field").forEach(button => {
                button.addEventListener("click", (e) => e.target.closest(".field-row").remove());
            });
        }
        attachRemoveFieldListeners();
    }

    function showParseButton() {
        const parseButton = document.createElement("button");
        parseButton.innerText = "Начать парсинг";
        parseButton.style.position = "fixed";
        parseButton.style.bottom = "20px";
        parseButton.style.right = "20px";
        parseButton.style.padding = "10px";
        parseButton.style.backgroundColor = "#28a745";
        parseButton.style.color = "white";
        parseButton.style.border = "none";
        parseButton.style.cursor = "pointer";
        parseButton.style.zIndex = "10000";
        document.body.appendChild(parseButton);

        parseButton.addEventListener("click", runJob);
    }

    GM_registerMenuCommand("Открыть настройки", showSettings);
    showParseButton();
})();
